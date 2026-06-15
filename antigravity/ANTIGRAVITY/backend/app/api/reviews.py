from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.models.models import Review, Product, User, Order, OrderItem
from backend.app.schemas.schemas import ReviewCreate, ReviewResponse
from backend.app.auth.security import get_current_user, require_customer, require_any_user

router = APIRouter(prefix="/reviews", tags=["Product Reviews"])

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    # Verify product exists
    product = db.query(Product).filter(Product.id == review_data.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
        
    # Check if user already reviewed this product
    existing = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.product_id == review_data.product_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a review for this product"
        )
        
    new_review = Review(
        user_id=current_user.id,
        product_id=review_data.product_id,
        rating=review_data.rating,
        review=review_data.review
    )
    
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    # Map back with user name
    return {
        "id": new_review.id,
        "user_id": new_review.user_id,
        "product_id": new_review.product_id,
        "rating": new_review.rating,
        "review": new_review.review,
        "created_at": new_review.created_at,
        "user_name": current_user.name
    }

@router.get("/product/{product_id}", response_model=List[ReviewResponse])
def get_product_reviews(product_id: str, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()
    
    results = []
    for r in reviews:
        results.append({
            "id": r.id,
            "user_id": r.user_id,
            "product_id": r.product_id,
            "rating": r.rating,
            "review": r.review,
            "created_at": r.created_at,
            "user_name": r.user.name if r.user else "Anonymous"
        })
    return results

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: str,
    current_user: User = Depends(require_any_user),
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
        
    # Owner or Admin can delete
    if review.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this review"
        )
        
    db.delete(review)
    db.commit()
    return None
