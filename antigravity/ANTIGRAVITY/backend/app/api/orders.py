from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.models.models import Order, OrderItem, Cart, CartItem, Product, User, Payment, Vendor
from backend.app.schemas.schemas import OrderCreate, OrderResponse, OrderStatusUpdate
from backend.app.auth.security import get_current_user, require_customer, require_any_user
from backend.app.services.shipping import calculate_shipping_rate
from backend.app.services.notify import send_email_notification, send_sms_notification
from backend.app.api.products import map_product_to_response

router = APIRouter(prefix="/orders", tags=["Order Management"])

# Setup sample coupon values
COUPONS = {
    "WELCOME10": 0.10,   # 10% off
    "TRIBAL20": 0.20,    # 20% off
    "FESTIVE15": 0.15,   # 15% off
}

def map_order_to_response(order: Order, filter_vendor_id: Optional[str] = None) -> dict:
    items_response = []
    for item in order.items:
        # If filtering by vendor (for Vendor dashboard), skip other vendors' products
        if filter_vendor_id and item.product.vendor_id != filter_vendor_id:
            continue
            
        prod_mapped = map_product_to_response(item.product)
        items_response.append({
            "id": item.id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": item.price,
            "product": prod_mapped
        })
        
    return {
        "id": order.id,
        "user_id": order.user_id,
        "total_amount": order.total_amount,
        "status": order.status,
        "shipping_address": order.shipping_address,
        "created_at": order.created_at,
        "items": items_response,
        "payment_status": order.payment.payment_status if order.payment else "pending"
    }

@router.post("/checkout", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def checkout(
    order_data: OrderCreate,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot checkout. Your shopping cart is empty."
        )
        
    subtotal = 0.0
    total_weight = 0.0
    
    # Verify stock and calculate subtotal
    for item in cart.items:
        if item.quantity > item.product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{item.product.name}' only has {item.product.stock} units in stock. Please reduce quantity."
            )
        # Apply discount if any on the product price
        effective_price = item.product.price * (1 - (item.product.discount / 100.0))
        subtotal += effective_price * item.quantity
        total_weight += (item.product.weight or 0.1) * item.quantity
        
    # Calculate coupon discount
    discount_amount = 0.0
    if order_data.coupon_code:
        coupon = order_data.coupon_code.upper().strip()
        if coupon in COUPONS:
            discount_amount = subtotal * COUPONS[coupon]
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid coupon code"
            )
            
    # Calculate dynamic shipping rate (simulated)
    # Using generic pincodes for demo purposes
    shipping_info = calculate_shipping_rate(origin_pincode="110001", dest_pincode="400001", weight_kg=total_weight)
    shipping_cost = shipping_info["rate"]
    
    total_amount = round(subtotal - discount_amount + shipping_cost, 2)
    
    # Create Order
    new_order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        status="pending",
        shipping_address=order_data.shipping_address
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Create OrderItems and decrement stock
    for item in cart.items:
        effective_price = item.product.price * (1 - (item.product.discount / 100.0))
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=effective_price
        )
        db.add(order_item)
        # Decrement stock
        item.product.stock -= item.quantity
        
    # Create Pending Payment log
    import uuid
    payment_log = Payment(
        order_id=new_order.id,
        amount=total_amount,
        payment_status="pending",
        transaction_id=f"TXN-MOCK-{uuid.uuid4().hex[:10].upper()}"
    )
    db.add(payment_log)
    
    # Clear User's Cart
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    
    db.commit()
    db.refresh(new_order)
    
    # Trigger mock email/SMS alerts
    send_email_notification(
        to_email=current_user.email,
        subject=f"Order Placed - #{new_order.id[:8]}",
        body=f"Hi {current_user.name},\n\nYour order #{new_order.id} has been created.\nTotal Amount: Rs. {total_amount}\nStatus: Pending Payment."
    )
    
    return map_order_to_response(new_order)

@router.get("/", response_model=List[OrderResponse])
def get_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "admin":
        orders = db.query(Order).order_by(Order.created_at.desc()).all()
        return [map_order_to_response(o) for o in orders]
        
    elif current_user.role == "vendor":
        vendor = current_user.vendor_profile
        if not vendor:
            return []
        # Find orders containing vendor's products
        orders = db.query(Order).join(OrderItem).join(Product).filter(
            Product.vendor_id == vendor.id
        ).order_by(Order.created_at.desc()).all()
        return [map_order_to_response(o, filter_vendor_id=vendor.id) for o in orders]
        
    else:  # customer
        orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
        return [map_order_to_response(o) for o in orders]

@router.get("/{order_id}", response_model=OrderResponse)
def get_order_details(order_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    # Check permissions
    if current_user.role == "customer" and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    elif current_user.role == "vendor":
        vendor = current_user.vendor_profile
        # Verify vendor sells at least one product in this order
        has_product = False
        for item in order.items:
            if item.product.vendor_id == vendor.id:
                has_product = True
                break
        if not has_product:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this order"
            )
        return map_order_to_response(order, filter_vendor_id=vendor.id)
        
    return map_order_to_response(order)

@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str,
    status_data: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["admin", "vendor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized to update order status"
        )
        
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    valid_statuses = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"]
    new_status = status_data.status.lower()
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order status code"
        )
        
    order.status = new_status
    db.commit()
    db.refresh(order)
    
    # Notify customer of status update
    buyer = db.query(User).filter(User.id == order.user_id).first()
    if buyer:
        send_sms_notification(
            to_phone=buyer.phone,
            message=f"Dear Customer, your Tribal E-Marketplace order #{order.id[:8]} status has been updated to '{new_status.upper()}'."
        )
        
    return map_order_to_response(order)

@router.get("/{order_id}/invoice", response_class=HTMLResponse)
def get_order_invoice(order_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if current_user.role == "customer" and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    buyer = db.query(User).filter(User.id == order.user_id).first()
    buyer_name = buyer.name if buyer else "Valued Customer"
    buyer_email = buyer.email if buyer else ""
    buyer_phone = buyer.phone if buyer else ""
    
    items_rows = ""
    for idx, item in enumerate(order.items, 1):
        effective_price = item.price
        row_total = effective_price * item.quantity
        items_rows += f"""
        <tr>
            <td>{idx}</td>
            <td>{item.product.name} (by {item.product.vendor.user.name if item.product.vendor else 'Tribal Seller'})</td>
            <td>Rs. {effective_price:.2f}</td>
            <td>{item.quantity}</td>
            <td>Rs. {row_total:.2f}</td>
        </tr>
        """
        
    invoice_html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Invoice - #{order.id[:8]}</title>
        <style>
            body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; line-height: 1.5; }}
            .invoice-box {{ max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; }}
            .header {{ display: flex; justify-content: space-between; border-bottom: 2px solid #2e7d32; padding-bottom: 20px; margin-bottom: 20px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #2e7d32; }}
            .title {{ font-size: 28px; text-align: right; text-transform: uppercase; color: #555; }}
            .details {{ display: flex; justify-content: space-between; margin-bottom: 30px; }}
            .details div {{ width: 48%; }}
            .details h4 {{ margin: 0 0 8px 0; color: #2e7d32; border-bottom: 1px solid #ddd; padding-bottom: 4px; }}
            table {{ width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 30px; }}
            th {{ background-color: #2e7d32; color: #fff; padding: 10px; }}
            td {{ padding: 10px; border-bottom: 1px solid #eee; }}
            .total-section {{ text-align: right; font-size: 18px; font-weight: bold; }}
            .footer {{ text-align: center; margin-top: 50px; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 20px; }}
            .print-btn {{ display: block; width: 120px; margin: 20px auto 0 auto; padding: 10px; background-color: #2e7d32; color: white; text-align: center; text-decoration: none; border-radius: 4px; font-weight: bold; }}
            @media print {{
                .print-btn {{ display: none; }}
                body {{ margin: 0; }}
                .invoice-box {{ border: none; box-shadow: none; }}
            }}
        </style>
    </head>
    <body>
        <div class="invoice-box">
            <div class="header">
                <div>
                    <div class="logo">Tribal E-Marketplace</div>
                    <div>Preserving Heritage, Supporting Livelihoods</div>
                </div>
                <div class="title">Invoice</div>
            </div>
            
            <div class="details">
                <div>
                    <h4>Order Information</h4>
                    <strong>Order ID:</strong> #{order.id}<br>
                    <strong>Date:</strong> {order.created_at.strftime('%Y-%m-%d %H:%M:%S')}<br>
                    <strong>Status:</strong> {order.status.upper()}<br>
                    <strong>Payment:</strong> {order.payment.payment_status.upper() if order.payment else 'PENDING'}
                </div>
                <div>
                    <h4>Billed To</h4>
                    <strong>Name:</strong> {buyer_name}<br>
                    <strong>Email:</strong> {buyer_email}<br>
                    <strong>Phone:</strong> {buyer_phone or 'N/A'}<br>
                    <strong>Address:</strong><br>{order.shipping_address}
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Item & Seller</th>
                        <th>Unit Price</th>
                        <th>Qty</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {items_rows}
                </tbody>
            </table>
            
            <div class="total-section">
                Total Amount Paid: Rs. {order.total_amount:.2f}
            </div>
            
            <div class="footer">
                Thank you for supporting tribal artisans and organic farmers!<br>
                This is a computer-generated invoice. No physical signature is required.
            </div>
        </div>
        <a href="#" class="print-btn" onclick="window.print(); return false;">Print Invoice</a>
    </body>
    </html>
    """
    return invoice_html
