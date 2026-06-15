# Deployment Guide - Tribal E-Marketplace Portal

This guide provides steps to install, seed, run, and deploy the Tribal E-Marketplace Portal application locally or in a production-ready containerized environment.

---

## 1. Quick Local Execution (Zero-Setup)

For quick development or evaluation, the FastAPI backend automatically falls back to an SQLite database file (`tribal_marketplace.db`) if no PostgreSQL configurations are detected, and seeds it with categories, admin accounts, mock sellers, products, and reviews on launch.

### Prerequisites
- Python 3.10 or higher
- Web Browser

### Setup Steps
1. Navigate to the project root directory.
2. Install python dependencies:
   ```bash
   python -m pip install -r backend/requirements.txt
   ```
3. Launch the FastAPI server:
   ```bash
   python -m uvicorn backend.main:app --reload --port 8000
   ```
4. Access the application:
   - Open `frontend/index.html` in your web browser.
   - Access Swagger API documentation at `http://localhost:8000/docs`.

---

## 2. PostgreSQL Configuration

To deploy using a persistent PostgreSQL database:
1. Setup a PostgreSQL server instance.
2. Set the `DATABASE_URL` environment variable:
   ```bash
   # Windows (PowerShell)
   $env:DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   
   # Linux / macOS
   export DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   ```
3. Restart the FastAPI server. The database tables will be automatically generated on startup, and seed data will be populated if the database tables are empty.

---

## 3. Docker Compose Deployment (Recommended for Production)

Docker Compose bundles the PostgreSQL database, Nginx reverse proxy, and FastAPI backend into isolated container groups.

### Prerequisites
- Docker Engine & Docker Compose

### Setup Steps
1. Navigate to the project root directory.
2. Fire up the docker services:
   ```bash
   docker-compose up --build -d
   ```
3. This command boots up:
   - `db`: PostgreSQL container on port `5432`.
   - `web`: FastAPI backend API container on port `8000`.
   - The persistent uploads directory is mapped to `backend/uploads/` on the host machine.
4. Mount the frontend assets folder within your Nginx configurations or access the static HTML/CSS files locally. The API endpoints point to `http://localhost:8000/api` natively.

---

## 4. Default Seed Accounts

The database contains the following built-in profiles for manual testing:

| Role | Email Address | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@tribalportal.com` | `admin123` | Approves vendor applications, manages categories. |
| **Customer** | `customer@tribalportal.com` | `customer123` | Regular buyer. Can browse, add to cart, checkout. |
| **Vendor (Gond)** | `vendor_gond@tribalportal.com` | `vendor123` | Approved artisan. Can add listings, track stats. |
| **Vendor (Warli)** | `vendor_warli@tribalportal.com` | `vendor123` | Approved artisan. Can edit price, manage stock. |
| **Vendor (Pending)** | `vendor_pending@tribalportal.com` | `vendor123` | Pending seller. Cannot list products until approved by Admin. |
