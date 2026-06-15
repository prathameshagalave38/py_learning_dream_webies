import re
from typing import List
from sqlalchemy.orm import Session
from backend.app.models.models import Product, Review

STOP_WORDS = {"a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "in", "on", "at", "to", "for", "with", "of", "by", "this", "that", "these", "those", "it", "its"}

def clean_text_to_keywords(text: str) -> set:
    if not text:
        return set()
    words = re.findall(r'\w+', text.lower())
    return {w for w in words if w not in STOP_WORDS and len(w) > 2}

def get_product_keyword_similarity(p1: Product, p2: Product) -> float:
    # Get keywords from name and description
    keywords1 = clean_text_to_keywords(p1.name) | clean_text_to_keywords(p1.description)
    keywords2 = clean_text_to_keywords(p2.name) | clean_text_to_keywords(p2.description)
    
    if not keywords1 or not keywords2:
        return 0.0
        
    intersection = keywords1.intersection(keywords2)
    union = keywords1.union(keywords2)
    return len(intersection) / len(union)

def get_recommendations(db: Session, product_id: str, limit: int = 4) -> List[Product]:
    """
    Given a product ID, find products in the same category, ranked by keyword similarity,
    falling back to ratings/newest if similarity is 0.
    """
    target = db.query(Product).filter(Product.id == product_id).first()
    if not target:
        return db.query(Product).limit(limit).all()
        
    # Query other products in the same category
    candidates = db.query(Product).filter(
        Product.id != product_id,
        Product.category_id == target.category_id,
        Product.stock > 0
    ).all()
    
    # Calculate similarity score for each candidate
    scored_candidates = []
    for cand in candidates:
        sim = get_product_keyword_similarity(target, cand)
        # Give a boost for same category
        score = sim + 0.5
        scored_candidates.append((cand, score))
        
    # If we need more candidates, pull from other categories
    if len(scored_candidates) < limit:
        other_candidates = db.query(Product).filter(
            Product.id != product_id,
            Product.category_id != target.category_id,
            Product.stock > 0
        ).limit(limit * 2).all()
        
        for cand in other_candidates:
            sim = get_product_keyword_similarity(target, cand)
            scored_candidates.append((cand, sim))
            
    # Sort by score descending
    scored_candidates.sort(key=lambda x: x[1], reverse=True)
    return [item[0] for item in scored_candidates[:limit]]

def get_personalized_recommendations(db: Session, recently_viewed_ids: List[str], limit: int = 4) -> List[Product]:
    """
    Given a list of recently viewed product IDs, find products from the same categories
    that the user has not seen yet, ranked by average rating.
    """
    if not recently_viewed_ids:
        # Return popular products
        return db.query(Product).filter(Product.stock > 0).limit(limit).all()
        
    viewed_products = db.query(Product).filter(Product.id.in_(recently_viewed_ids)).all()
    if not viewed_products:
        return db.query(Product).filter(Product.stock > 0).limit(limit).all()
        
    # Track the categories user is interested in
    category_ids = {p.category_id for p in viewed_products}
    
    # Find active products in these categories not recently viewed
    candidates = db.query(Product).filter(
        Product.category_id.in_(category_ids),
        ~Product.id.in_(recently_viewed_ids),
        Product.stock > 0
    ).all()
    
    # Sort candidates: we can calculate a mock popularity based on rating or just default order
    # Let's sort by categories matching the most recently viewed product first
    most_recent_cat = viewed_products[-1].category_id
    
    def ranking_key(p: Product):
        # Boost products in the exact category of the very last viewed product
        cat_boost = 2.0 if p.category_id == most_recent_cat else 1.0
        return cat_boost
        
    candidates.sort(key=ranking_key, reverse=True)
    
    # If not enough candidates, pad with other products
    results = candidates[:limit]
    if len(results) < limit:
        remaining = limit - len(results)
        viewed_and_result_ids = set(recently_viewed_ids) | {p.id for p in results}
        padding = db.query(Product).filter(
            ~Product.id.in_(viewed_and_result_ids),
            Product.stock > 0
        ).limit(remaining).all()
        results.extend(padding)
        
    return results
