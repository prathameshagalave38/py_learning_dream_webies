from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.models.models import Order, Payment, User
from backend.app.schemas.schemas import PaymentResponse, PaymentVerification
from backend.app.auth.security import get_current_user, require_admin, require_customer
from backend.app.services.notify import send_email_notification

router = APIRouter(prefix="/payments", tags=["Payment Gateway"])

@router.post("/verify", response_model=PaymentResponse)
def verify_payment(
    payment_data: PaymentVerification,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.order_id == payment_data.order_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment record not found"
        )
        
    order = payment.order
    if order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized payment action"
        )
        
    # Simulate verification
    payment.payment_status = "verified"
    payment.transaction_id = payment_data.transaction_id
    order.status = "confirmed"
    
    db.commit()
    db.refresh(payment)
    
    # Notify user
    send_email_notification(
        to_email=current_user.email,
        subject=f"Payment Verified - Order #{order.id[:8]}",
        body=f"Hi {current_user.name},\n\nYour payment of Rs. {payment.amount} has been successfully verified!\nOrder Status: Confirmed.\nTransaction ID: {payment.transaction_id}"
    )
    
    return payment

@router.post("/refund/{payment_id}", response_model=PaymentResponse)
def refund_payment(
    payment_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment transaction not found"
        )
        
    payment.payment_status = "refunded"
    payment.order.status = "cancelled"
    
    db.commit()
    db.refresh(payment)
    
    # Notify user of refund
    buyer = db.query(User).filter(User.id == payment.order.user_id).first()
    if buyer:
        send_email_notification(
            to_email=buyer.email,
            subject=f"Refund Processed - Order #{payment.order_id[:8]}",
            body=f"Hi {buyer.name},\n\nWe have initiated a refund of Rs. {payment.amount} for your order #{payment.order_id}.\nRefund Status: Processed."
        )
        
    return payment
