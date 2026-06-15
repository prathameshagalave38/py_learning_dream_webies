from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.models.models import Wishlist, Product, User
from backend.app.schemas.schemas import WishlistResponse, WishlistCreate
from backend.app.auth.security import get_current_user, require_customer
from backend.app.api.products import map_product_to_response

router = APIRouter(prefix="/wishlist", tags=["Customer Wishlist"])

@router.get("/", response_model=List[WishlistResponse])
def get_wishlist(current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    items = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()
    results = []
    for item in items:
        prod_mapped = map_product_to_response(item.product)
        results.append({
            "id": item.id,
            "user_id": item.user_id,
            "product_id": item.product_id,
            "product": prod_mapped,
            "created_at": item.created_at
        })
    return results

@router.post("/", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    wishlist_data: WishlistCreate,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    # Check if product exists
    product = db.query(Product).filter(Product.id == wishlist_data.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
        
    # Check if already in wishlist
    existing = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == wishlist_data.product_id
    ).first()
    
    if existing:
        return {
            "id": existing.id,
            "user_id": existing.user_id,
            "product_id": existing.product_id,
            "product": map_product_to_response(existing.product),
            "created_at": existing.created_at
        }
        
    new_wish = Wishlist(
        user_id=current_user.id,
        product_id=wishlist_data.product_id
    )
    db.add(new_wish)
    db.commit()
    db.refresh(new_wish)
    
    return {
        "id": new_wish.id,
        "user_id": new_wish.user_id,
        "product_id": new_wish.product_id,
        "product": map_product_to_response(new_wish.product),
        "created_at": new_wish.created_at
    }

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(
    product_id: str,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    item = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist item not found"
        )
        
    db.delete(item)
    db.commit()
    return None
