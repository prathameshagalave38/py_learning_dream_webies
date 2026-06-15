import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.app.database.connection import engine, Base
from backend.app.database.seed import seed_db

# Import API Routers
from backend.app.api.auth import router as auth_router
from backend.app.api.products import router as products_router
from backend.app.api.categories import router as categories_router
from backend.app.api.cart import router as cart_router
from backend.app.api.orders import router as orders_router
from backend.app.api.payments import router as payments_router
from backend.app.api.reviews import router as reviews_router
from backend.app.api.vendors import router as vendors_router
from backend.app.api.admin import router as admin_router
from backend.app.api.wishlist import router as wishlist_router

app = FastAPI(
    title="Tribal E-Marketplace Portal API",
    description="Full-stack REST API backend built with FastAPI, SQLAlchemy, and Role-Based Access Control.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads folder exists
os.makedirs("uploads", exist_ok=True)

# Mount Static Files for product images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Automatically generate database tables and run seeds on startup
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    try:
        seed_db()
    except Exception as e:
        print(f"Warning: Startup database seeding skipped: {str(e)}")

# Include REST API Routers
app.include_router(auth_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(categories_router, prefix="/api")
app.include_router(cart_router, prefix="/api")
app.include_router(wishlist_router, prefix="/api")
app.include_router(orders_router, prefix="/api")
app.include_router(payments_router, prefix="/api")
app.include_router(reviews_router, prefix="/api")
app.include_router(vendors_router, prefix="/api")
app.include_router(admin_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "portal": "Tribal E-Marketplace",
        "documentation": "/docs"
    }
