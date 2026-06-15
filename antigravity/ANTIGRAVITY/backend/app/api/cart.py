from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.models.models import Cart, CartItem, Product, User
from backend.app.schemas.schemas import CartResponse, CartItemCreate, CartItemUpdate
from backend.app.auth.security import get_current_user, require_customer
from backend.app.api.products import map_product_to_response

router = APIRouter(prefix="/cart", tags=["Shopping Cart"])

def get_or_create_cart(user_id: str, db: Session) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

def map_cart_to_response(cart: Cart) -> dict:
    items_response = []
    for item in cart.items:
        # map product using products router utility
        prod_mapped = map_product_to_response(item.product)
        items_response.append({
            "id": item.id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "product": prod_mapped
        })
    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "items": items_response
    }

@router.get("/", response_model=CartResponse)
def view_cart(current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    cart = get_or_create_cart(current_user.id, db)
    return map_cart_to_response(cart)

@router.post("/items", response_model=CartResponse)
def add_item_to_cart(
    item_data: CartItemCreate,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    # Check product availability
    product = db.query(Product).filter(Product.id == item_data.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
        
    cart = get_or_create_cart(current_user.id, db)
    
    # Check if product is already in cart
    cart_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == product.id
    ).first()
    
    requested_qty = item_data.quantity
    if cart_item:
        requested_qty += cart_item.quantity
        
    if requested_qty > product.stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot add requested quantity. Only {product.stock} items left in stock."
        )
        
    if cart_item:
        cart_item.quantity = requested_qty
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=product.id,
            quantity=requested_qty
        )
        db.add(cart_item)
        
    db.commit()
    db.refresh(cart)
    return map_cart_to_response(cart)

@router.put("/items/{item_id}", response_model=CartResponse)
def update_cart_item(
    item_id: str,
    item_data: CartItemUpdate,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    cart = get_or_create_cart(current_user.id, db)
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
        
    # Check stock
    if item_data.quantity > cart_item.product.stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {cart_item.product.stock} items left in stock."
        )
        
    cart_item.quantity = item_data.quantity
    db.commit()
    db.refresh(cart)
    return map_cart_to_response(cart)

@router.delete("/items/{item_id}", response_model=CartResponse)
def remove_cart_item(
    item_id: str,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    cart = get_or_create_cart(current_user.id, db)
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
        
    db.delete(cart_item)
    db.commit()
    db.refresh(cart)
    return map_cart_to_response(cart)

@router.delete("/", response_model=CartResponse)
def clear_cart(current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    cart = get_or_create_cart(current_user.id, db)
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
    db.refresh(cart)
    return map_cart_to_response(cart)
