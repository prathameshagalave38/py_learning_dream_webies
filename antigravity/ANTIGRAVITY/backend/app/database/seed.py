import os
from sqlalchemy.orm import Session
from backend.app.database.connection import SessionLocal, engine, Base
from backend.app.models.models import User, Vendor, Category, Product, ProductImage, Review
from backend.app.auth.security import get_password_hash

def seed_db():
    print("Initializing Database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Checking if categories already exist...")
        if db.query(Category).count() > 0:
            print("Database already seeded. Skipping seeding.")
            return
            
        print("Seeding Categories...")
        categories = [
            Category(name="Tribal Paintings", description="Traditional tribal art including Warli and Gond paintings on canvas, cloth, and paper."),
            Category(name="Handicrafts", description="Authentic bamboo bottles, handcarved wooden statues, clay pottery, and home decor."),
            Category(name="Organic Food", description="Wild forest honey, herbal tea infusions, organic spices, and hand-gathered grains."),
            Category(name="Handmade Jewelry", description="Terracotta beaded necklaces, traditional brass earrings, and coin jewelry.")
        ]
        db.add_all(categories)
        db.commit()
        
        # Reload categories for IDs
        cat_paintings = db.query(Category).filter(Category.name == "Tribal Paintings").first()
        cat_crafts = db.query(Category).filter(Category.name == "Handicrafts").first()
        cat_food = db.query(Category).filter(Category.name == "Organic Food").first()
        cat_jewelry = db.query(Category).filter(Category.name == "Handmade Jewelry").first()
        
        print("Seeding Users (Admin, Customer, Vendors)...")
        # 1. Admin
        admin_user = User(
            name="Platform Administrator",
            email="admin@tribalportal.com",
            phone="9999988888",
            password_hash=get_password_hash("admin123"),
            role="admin",
            is_verified=True
        )
        db.add(admin_user)
        
        # 2. Customer
        customer_user = User(
            name="Rahul Sharma",
            email="customer@tribalportal.com",
            phone="9876543210",
            password_hash=get_password_hash("customer123"),
            role="customer",
            is_verified=True
        )
        db.add(customer_user)
        
        # 3. Vendor Gond (Approved)
        vendor1_user = User(
            name="Jangarh Gond",
            email="vendor_gond@tribalportal.com",
            phone="8888877777",
            password_hash=get_password_hash("vendor123"),
            role="vendor",
            is_verified=True
        )
        db.add(vendor1_user)
        
        # 4. Vendor Warli (Approved)
        vendor2_user = User(
            name="Soma Warli",
            email="vendor_warli@tribalportal.com",
            phone="7777766666",
            password_hash=get_password_hash("vendor123"),
            role="vendor",
            is_verified=True
        )
        db.add(vendor2_user)
        
        # 5. Vendor Pending (Needs Admin Approval)
        vendor3_user = User(
            name="Birsa Bhil",
            email="vendor_pending@tribalportal.com",
            phone="6666655555",
            password_hash=get_password_hash("vendor123"),
            role="vendor",
            is_verified=False
        )
        db.add(vendor3_user)
        
        db.commit()
        
        # Create Vendor profiles
        v1_profile = Vendor(
            user_id=vendor1_user.id,
            tribal_community="Gond Community",
            address="Patangarh, Dindori District, Madhya Pradesh, Pin: 481882",
            approval_status="approved",
            bank_account="SBI 12345678901 (IFSC: SBIN0001234)"
        )
        db.add(v1_profile)
        
        v2_profile = Vendor(
            user_id=vendor2_user.id,
            tribal_community="Warli Community",
            address="Jawhar, Palghar District, Maharashtra, Pin: 401603",
            approval_status="approved",
            bank_account="HDFC 98765432109 (IFSC: HDFC0000432)"
        )
        db.add(v2_profile)
        
        v3_profile = Vendor(
            user_id=vendor3_user.id,
            tribal_community="Bhil Community",
            address="Jhabua District, Madhya Pradesh, Pin: 457661",
            approval_status="pending",
            bank_account="BOI 55555666677 (IFSC: BKID0005555)"
        )
        db.add(v3_profile)
        
        db.commit()
        
        print("Seeding Products...")
        # Product 1: Gond Canvas Painting (by Gond vendor)
        p1 = Product(
            vendor_id=v1_profile.id,
            category_id=cat_paintings.id,
            name="Tree of Life - Gond Painting",
            description="An authentic, hand-painted Gond artwork on fine canvas. Hand-crafted using traditional dots and lines. Shows the interconnectedness of nature with native fauna and spirits.",
            price=2450.00,
            discount=10.0,
            stock=4,
            weight=0.8,
            shipping_cost=80.0
        )
        db.add(p1)
        
        # Product 2: Organic Forest Honey (by Gond vendor)
        p2 = Product(
            vendor_id=v1_profile.id,
            category_id=cat_food.id,
            name="Wild Forest Organic Honey",
            description="Pure, unpasteurized honey collected from wild hives in the Satpura reserves. Raw and unfiltered, maintaining natural enzymes, pollen, and nutritional benefits.",
            price=490.00,
            discount=0.0,
            stock=45,
            weight=0.5,
            shipping_cost=50.0
        )
        db.add(p2)
        
        # Product 3: Warli Harvest Painting (by Warli vendor)
        p3 = Product(
            vendor_id=v2_profile.id,
            category_id=cat_paintings.id,
            name="Warli Harvest Ceremony Canvas",
            description="A traditional Warli canvas detailing the harvest circle dance (Tarpa dance) using natural rice-paste paint. Striking geometric representation of tribal community life.",
            price=1850.00,
            discount=15.0,
            stock=3,
            weight=0.6,
            shipping_cost=80.0
        )
        db.add(p3)
        
        # Product 4: Bamboo Bottle (by Warli vendor)
        p4 = Product(
            vendor_id=v2_profile.id,
            category_id=cat_crafts.id,
            name="Handcarved Bamboo Water Bottle",
            description="Eco-friendly water bottle carved entirely out of cured organic bamboo blocks. Features a leak-proof cork lid and custom geometric tribal patterns etched by hand.",
            price=680.00,
            discount=5.0,
            stock=12,
            weight=0.4,
            shipping_cost=60.0
        )
        db.add(p4)
        
        # Product 5: Terracotta Beaded Necklace (by Gond vendor)
        p5 = Product(
            vendor_id=v1_profile.id,
            category_id=cat_jewelry.id,
            name="Terracotta Tribal Beaded Necklace",
            description="Vibrant hand-shaped clay necklace fired and painted with organic earth colors. An authentic accessory representing the tribal aesthetics of Madhya Pradesh.",
            price=320.00,
            discount=0.0,
            stock=15,
            weight=0.2,
            shipping_cost=40.0
        )
        db.add(p5)
        
        # Product 6: Herbal Forest Tea (by Warli vendor)
        p6 = Product(
            vendor_id=v2_profile.id,
            category_id=cat_food.id,
            name="Herbal Forest Tea Infusion",
            description="Hand-gathered blend of wild tulsi, lemongrass, and dry ginger roots from Western Ghats forests. Refreshes the mind and builds immunity naturally.",
            price=220.00,
            discount=0.0,
            stock=2,  # Set to 2 to trigger low stock alerts for Soma Warli!
            weight=0.1,
            shipping_cost=30.0
        )
        db.add(p6)
        
        db.commit()
        
        print("Seeding Images...")
        # Since we don't have physical images, we'll write local seed references which can fallback to beautiful SVG thumbnails in the frontend UI
        db.add(ProductImage(product_id=p1.id, image_url="/uploads/seed_gond_tree.jpg"))
        db.add(ProductImage(product_id=p2.id, image_url="/uploads/seed_honey.jpg"))
        db.add(ProductImage(product_id=p3.id, image_url="/uploads/seed_warli_harvest.jpg"))
        db.add(ProductImage(product_id=p4.id, image_url="/uploads/seed_bamboo_bottle.jpg"))
        db.add(ProductImage(product_id=p5.id, image_url="/uploads/seed_clay_necklace.jpg"))
        db.add(ProductImage(product_id=p6.id, image_url="/uploads/seed_herbal_tea.jpg"))
        
        db.commit()
        
        print("Seeding Reviews...")
        reviews = [
            Review(user_id=customer_user.id, product_id=p1.id, rating=5, review="Breathtakingly beautiful painting. The level of detail in the dots is stunning! Delivery was very secure."),
            Review(user_id=customer_user.id, product_id=p2.id, rating=4, review="Very rich taste, completely different from factory-produced honeys. Smells like the wild forest. Will buy again!"),
            Review(user_id=customer_user.id, product_id=p4.id, rating=5, review="High-quality bamboo build. Keeps water cool and looks extremely elegant on my desk. Highly recommended eco alternative.")
        ]
        db.add_all(reviews)
        db.commit()
        
        print("Database successfully seeded with realistic sample data!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {str(e)}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
