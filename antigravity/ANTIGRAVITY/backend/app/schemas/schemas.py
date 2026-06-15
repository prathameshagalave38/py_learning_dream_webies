from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

# Authentication & Tokens
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    role: str
    name: str

class TokenRefreshRequest(BaseModel):
    refresh_token: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None
    role: Optional[str] = "customer"  # customer, vendor, admin

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Vendor Models
class VendorCreate(BaseModel):
    tribal_community: str = Field(..., min_length=2, max_length=100)
    address: str = Field(..., min_length=5)
    bank_account: str = Field(..., min_length=5)

class VendorResponse(BaseModel):
    id: str
    user_id: str
    tribal_community: str
    address: str
    approval_status: str
    bank_account: str
    created_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# Category Models
class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

# Product Image Models
class ProductImageCreate(BaseModel):
    image_url: str

class ProductImageResponse(BaseModel):
    id: str
    product_id: str
    image_url: str

    class Config:
        from_attributes = True

# Product Models
class ProductCreate(BaseModel):
    category_id: int
    name: str = Field(..., min_length=2, max_length=150)
    description: str = Field(..., min_length=10)
    price: float = Field(..., gt=0)
    discount: Optional[float] = Field(0.0, ge=0, le=100)
    stock: int = Field(..., ge=0)
    weight: Optional[float] = Field(0.0, ge=0)
    shipping_cost: Optional[float] = Field(0.0, ge=0)

class ProductUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    discount: Optional[float] = None
    stock: Optional[int] = None
    weight: Optional[float] = None
    shipping_cost: Optional[float] = None

class ProductResponse(BaseModel):
    id: str
    vendor_id: str
    category_id: int
    name: str
    description: str
    price: float
    discount: float
    stock: int
    weight: float
    shipping_cost: float
    created_at: datetime
    images: List[ProductImageResponse] = []
    category: Optional[CategoryResponse] = None
    vendor_community: Optional[str] = None
    vendor_name: Optional[str] = None
    average_rating: Optional[float] = 0.0
    reviews_count: Optional[int] = 0

    class Config:
        from_attributes = True

# Cart Models
class CartItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(1, ge=1)

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)

class CartItemResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    product: ProductResponse

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: str
    user_id: str
    items: List[CartItemResponse] = []

    class Config:
        from_attributes = True

# Wishlist Models
class WishlistCreate(BaseModel):
    product_id: str

class WishlistResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    product: ProductResponse
    created_at: datetime

    class Config:
        from_attributes = True

# Order Items
class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    price: float
    product: ProductResponse

    class Config:
        from_attributes = True

# Orders
class OrderCreate(BaseModel):
    shipping_address: str = Field(..., min_length=10)
    coupon_code: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    user_id: str
    total_amount: float
    status: str
    shipping_address: str
    created_at: datetime
    items: List[OrderItemResponse] = []
    payment_status: Optional[str] = "pending"

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str

# Payments
class PaymentCreate(BaseModel):
    order_id: str
    amount: float
    transaction_id: str

class PaymentResponse(BaseModel):
    id: str
    order_id: str
    amount: float
    payment_status: str
    transaction_id: str
    timestamp: datetime

    class Config:
        from_attributes = True

class PaymentVerification(BaseModel):
    order_id: str
    transaction_id: str

# Reviews
class ReviewCreate(BaseModel):
    product_id: str
    rating: int = Field(..., ge=1, le=5)
    review: Optional[str] = None

class ReviewResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    rating: int
    review: Optional[str] = None
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True

# Dashboards & Analytics
class SalesTrendItem(BaseModel):
    date: str
    sales: float
    orders: int

class ProductPerformanceItem(BaseModel):
    product_name: str
    units_sold: int
    revenue: float

class CategoryPerformanceItem(BaseModel):
    category_name: str
    revenue: float

class VendorAnalytics(BaseModel):
    total_sales: float
    revenue: float
    orders_count: int
    monthly_growth: float
    low_stock_count: int
    sales_trend: List[SalesTrendItem] = []
    top_products: List[ProductPerformanceItem] = []

class AdminAnalytics(BaseModel):
    user_statistics: dict  # total, customers, vendors, admins
    vendor_statistics: dict  # pending, approved, rejected
    revenue_analytics: dict  # total, monthly_growth
    order_statistics: dict  # total, pending, completed, cancelled
    category_performance: List[CategoryPerformanceItem] = []
    monthly_revenue: List[SalesTrendItem] = []
