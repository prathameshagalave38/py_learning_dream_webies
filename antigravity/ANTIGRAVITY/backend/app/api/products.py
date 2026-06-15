from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database.connection import get_db
from backend.app.models.models import Product, Vendor, Category, ProductImage, Review
from backend.app.schemas.schemas import ProductCreate, ProductUpdate, ProductResponse
from backend.app.auth.security import get_current_user, require_vendor, require_any_user
from backend.app.utils.files import save_uploaded_file
from backend.app.services.recommendation import get_recommendations, get_personalized_recommendations

router = APIRouter(prefix="/products", tags=["Product Management"])

def map_product_to_response(p: Product) -> dict:
    ratings = [r.rating for r in p.reviews]
    avg_rating = sum(ratings) / len(ratings) if ratings else 0.0
    return {
        "id": p.id,
        "vendor_id": p.vendor_id,
        "category_id": p.category_id,
        "name": p.name,
        "description": p.description,
        "price": p.price,
        "discount": p.discount,
        "stock": p.stock,
        "weight": p.weight,
        "shipping_cost": p.shipping_cost,
        "created_at": p.created_at,
        "images": [{"id": img.id, "product_id": img.product_id, "image_url": img.image_url} for img in p.images],
        "category": {"id": p.category.id, "name": p.category.name, "description": p.category.description} if p.category else None,
        "vendor_community": p.vendor.tribal_community if p.vendor else None,
        "vendor_name": p.vendor.user.name if p.vendor and p.vendor.user else "Unknown Seller",
        "average_rating": avg_rating,
        "reviews_count": len(ratings)
    }

@router.get("/", response_model=List[ProductResponse])
def list_products(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    community: Optional[str] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    rating_min: Optional[float] = None,
    sort_by: Optional[str] = "newest",  # newest, price_asc, price_desc, rating_desc
    skip: int = 0,
    limit: int = 24,
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%") | Product.description.ilike(f"%{search}%"))
        
    if category_id:
        query = query.filter(Product.category_id == category_id)
        
    if community:
        query = query.join(Vendor).filter(Vendor.tribal_community.ilike(community))
        
    if price_min:
        query = query.filter(Product.price >= price_min)
        
    if price_max:
        query = query.filter(Product.price <= price_max)
        
    # Execute filters
    products_list = query.all()
    
    # Map ratings and process manual client filters/sorts (SQLite friendly)
    results = []
    for p in products_list:
        mapped = map_product_to_response(p)
        if rating_min and mapped["average_rating"] < rating_min:
            continue
        results.append(mapped)
        
    # Sorting
    if sort_by == "price_asc":
        results.sort(key=lambda x: x["price"])
    elif sort_by == "price_desc":
        results.sort(key=lambda x: x["price"], reverse=True)
    elif sort_by == "rating_desc":
        results.sort(key=lambda x: x["average_rating"], reverse=True)
    else:  # newest
        results.sort(key=lambda x: x["created_at"], reverse=True)
        
    return results[skip : skip + limit]

@router.get("/personalized-recommendations", response_model=List[ProductResponse])
def personalized_recommendations(
    recently_viewed: Optional[str] = None,  # comma-separated IDs
    limit: int = 4,
    db: Session = Depends(get_db)
):
    ids = [item.strip() for item in recently_viewed.split(",") if item.strip()] if recently_viewed else []
    recommended = get_personalized_recommendations(db, ids, limit=limit)
    return [map_product_to_response(p) for p in recommended]

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return map_product_to_response(product)

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    current_user=Depends(require_vendor),
    db: Session = Depends(get_db)
):
    vendor = current_user.vendor_profile
    if not vendor or vendor.approval_status != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only approved vendors can create listings"
        )
        
    # Check category
    category = db.query(Category).filter(Category.id == product_data.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category ID"
        )
        
    new_product = Product(
        vendor_id=vendor.id,
        category_id=product_data.category_id,
        name=product_data.name,
        description=product_data.description,
        price=product_data.price,
        discount=product_data.discount or 0.0,
        stock=product_data.stock,
        weight=product_data.weight or 0.0,
        shipping_cost=product_data.shipping_cost or 0.0
    )
    
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return map_product_to_response(new_product)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    product_data: ProductUpdate,
    current_user=Depends(require_vendor),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
        
    # Verify ownership
    if product.vendor_id != current_user.vendor_profile.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this product"
        )
        
    for key, value in product_data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
        
    db.commit()
    db.refresh(product)
    return map_product_to_response(product)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: str,
    current_user=Depends(require_any_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
        
    # Verify owner or admin
    is_owner = (current_user.role == "vendor" and product.vendor_id == current_user.vendor_profile.id)
    is_admin = current_user.role == "admin"
    
    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this product"
        )
        
    db.delete(product)
    db.commit()
    return None

@router.post("/{product_id}/images", response_model=ProductResponse)
def upload_product_image(
    product_id: str,
    file: UploadFile = File(...),
    current_user=Depends(require_vendor),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
        
    if product.vendor_id != current_user.vendor_profile.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this product"
        )
        
    image_url = save_uploaded_file(file)
    
    new_image = ProductImage(
        product_id=product.id,
        image_url=image_url
    )
    
    db.add(new_image)
    db.commit()
    db.refresh(product)
    return map_product_to_response(product)

@router.get("/{product_id}/recommendations", response_model=List[ProductResponse])
def product_recommendations(product_id: str, limit: int = 4, db: Session = Depends(get_db)):
    recommended = get_recommendations(db, product_id, limit=limit)
    return [map_product_to_response(p) for p in recommended]
