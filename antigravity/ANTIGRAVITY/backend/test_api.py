import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add current path to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app
from app.database.connection import Base, engine

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    # Setup test DB tables
    Base.metadata.create_all(bind=engine)
    yield
    # Clean up test database file if needed (SQLite fallback will remain for demo)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["portal"] == "Tribal E-Marketplace"

def test_auth_registration_and_login():
    # 1. Register a new customer
    register_payload = {
        "name": "Test Customer",
        "email": "test_customer@tribal.com",
        "password": "testpassword123",
        "phone": "9999911111",
        "role": "customer"
    }
    
    # Check if user already exists (clear from past run if any)
    response = client.post("/api/auth/register", json=register_payload)
    if response.status_code == 400:
         # Email already exists, verify login works
         pass
    else:
        assert response.status_code == 201
        assert response.json()["email"] == "test_customer@tribal.com"
        
    # 2. Login
    login_payload = {
        "email": "test_customer@tribal.com",
        "password": "testpassword123"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "customer"
    
    # Store token for subsequent tests
    token = data["access_token"]
    return token

def test_rbac_controls():
    # Customer trying to create a category (requires Admin)
    # 1. Get customer token
    login_payload = {
        "email": "test_customer@tribal.com",
        "password": "testpassword123"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    customer_token = login_res.json()["access_token"]
    
    # 2. Make post to category endpoint
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = client.post("/api/categories/", json={"name": "Forbidden Category", "description": "test"}, headers=headers)
    assert response.status_code == 403  # Forbidden for customer role

def test_product_filtering():
    # Verify we can filter products by query
    response = client.get("/api/products/?search=Honey")
    assert response.status_code == 200
    products = response.json()
    for p in products:
        assert "Honey" in p["name"] or "Honey" in p["description"]

def test_cart_operations():
    # 1. Login to get token
    login_res = client.post("/api/auth/login", json={"email": "test_customer@tribal.com", "password": "testpassword123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Fetch products to get a valid ID
    prod_res = client.get("/api/products/")
    assert prod_res.status_code == 200
    products = prod_res.json()
    assert len(products) > 0
    target_product_id = products[0]["id"]
    
    # 3. Add item to cart
    cart_payload = {
        "product_id": target_product_id,
        "quantity": 1
    }
    response = client.post("/api/cart/items", json=cart_payload, headers=headers)
    assert response.status_code == 200
    cart_data = response.json()
    assert len(cart_data["items"]) > 0
    assert cart_data["items"][0]["product_id"] == target_product_id

if __name__ == "__main__":
    import uvicorn
    # Execute standalone pytest runner
    pytest.main([__file__])
