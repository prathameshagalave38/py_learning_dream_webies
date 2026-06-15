# Tribal E-Marketplace Portal

An authentic, production-ready, full-stack e-commerce web platform designed for tribal communities to list and sell their handicrafts, artwork, organic goods, and forest produce directly to consumers.

---

## 🌟 Project Overview

This application acts as a direct-to-consumer bridge, matching remote tribal artisans with global customers. By bypassing intermediate traders, the portal supports rural livelihood development and preserves heritage techniques.

---

## 🛠️ Technology Stack

- **Frontend:** Semantic HTML5, Vanilla CSS3 (custom HSL variables, light/dark modes, glassmorphism), Vanilla JavaScript ES6, and Charting via HTML5 Canvas.
- **Backend:** FastAPI (Python 3.10+), Pydantic v2 input validations, JWT authentication, and Role-Based Access Control (RBAC).
- **Database:** PostgreSQL (with automated SQLite database fallback for portable local testing).
- **Deployment:** Docker containerization, Nginx reverse proxies, Docker Compose.

---

## 📂 Project Directory Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/          # REST Endpoint Routers (auth, products, cart, etc.)
│   │   ├── auth/         # JWT and password encryption helpers
│   │   ├── database/     # SQLAlchemy connection engines and seed builders
│   │   ├── models/       # SQLAlchemy relational database tables
│   │   ├── schemas/      # Pydantic validation schemas
│   │   ├── services/     # Recommendations, shipping estimators, email simulators
│   │   └── utils/        # Disk file write utilities
│   ├── uploads/          # Vendor product uploaded images directory
│   ├── main.py           # App server entrypoint
│   ├── requirements.txt  # Python requirements
│   ├── test_api.py       # Automated integration test suite
│   └── Dockerfile        # Container specifications
├── frontend/
│   ├── assets/
│   │   ├── css/          # Premium theme styling (styles.css)
│   │   └── js/           # App engine scripts (api.js, app.js, cart.js, etc.)
│   ├── index.html        # Welcome Home page
│   ├── products.html     # Marketplace catalog & comparisons
│   ├── cart.html         # Checkout summaries & payment simulators
│   └── dashboard.html    # Unified user portal (Customer/Vendor/Admin layouts)
├── docker-compose.yml    # App + Database orchestrator
├── nginx.conf            # Proxy router configuration rules
├── DEPLOYMENT.md         # Deployment & Seed setups
└── README.md             # Project documentation (this file)
```

---

## 🚀 Getting Started

To run the application locally or deploy it to a production cluster:
- For rapid local testing and development steps, see [DEPLOYMENT.md](file:///c:/Users/prathamesh%20agalave/OneDrive/Desktop/New%20folder/DEPLOYMENT.md).
- To run integration test checks:
  ```bash
  python -m pytest backend/test_api.py
  ```
