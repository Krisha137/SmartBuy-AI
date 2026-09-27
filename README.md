# SmartBuy AI

> An intelligent e-commerce shopping assistant powered by AI — describe what you need in plain language and get smart, explainable product recommendations.

---

## 🛍️ Project Description

SmartBuy AI bridges the gap between how people **think about products** and how e-commerce traditionally **searches for them**. Instead of filling in filters, users describe their needs naturally:

> *"I need a lightweight laptop for programming under ₹70,000 with 16GB RAM and good battery life."*

The system understands the intent, maps it to structured requirements, queries real product data from the database, and returns ranked recommendations with clear explanations.

---

## ✨ Features Planned

- 🔍 **Natural Language Search** — describe needs in plain language
- 📋 **Structured Requirement Extraction** — AI converts prose to structured criteria
- 🎯 **Smart Product Matching** — scored against real product data in PostgreSQL
- 💡 **Explainable Recommendations** — "why this product matches your needs"
- ⚖️ **Product Comparison** — side-by-side comparison of shortlisted products
- ⭐ **Review Analysis** — AI-summarized sentiment from user reviews
- ❤️ **Wishlist & Cart** — save and manage selected products
- 📦 **Orders** — place and track orders
- 🔐 **JWT Authentication** — secure user accounts

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Backend | Python, Django, Django REST Framework |
| Database | PostgreSQL |
| Frontend | React.js (Vite) |
| AI | LLM API (integrated in a later phase) |
| Data Processing | Pandas, NumPy |
| Authentication | JWT (djangorestframework-simplejwt) |
| API Testing | Postman |
| Version Control | Git |

---

## 🏗️ Project Architecture

```
React Frontend
      ↕ REST API (JSON)
Django Backend (DRF)
      ↕
PostgreSQL Database
      ↑
Recommendation Engine  ←  Structured Requirements  ←  AI Layer (LLM)
```

**Key rule:** The AI layer never touches the database directly. It only produces structured requirements that the recommendation engine uses to query PostgreSQL.

---

## 📁 Project Structure

```
smartbuy-ai/
├── backend/
│   ├── config/          # Django project settings
│   ├── apps/            # Feature applications
│   │   ├── accounts/    # User auth & profiles
│   │   ├── products/    # Product catalog
│   │   ├── requirements/# Parsed user requirements
│   │   ├── recommendations/ # Matching engine
│   │   ├── reviews/     # Product reviews
│   │   ├── comparisons/ # Product comparison
│   │   ├── wishlist/    # User wishlist
│   │   ├── cart/        # Shopping cart
│   │   ├── orders/      # Order management
│   │   └── ai/          # AI integration layer
│   ├── services/        # Shared business logic
│   ├── manage.py
│   └── requirements.txt
├── frontend/            # React + Vite app
├── data/                # Raw / seed data
├── docs/                # Documentation
├── .env.example         # Environment variable template
├── .gitignore
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Git

### Backend

```bash
# 1. Clone the repo
git clone <repo-url>
cd smartbuy-ai

# 2. Create and activate virtual environment
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp ../.env.example ../.env
# Edit .env with your real values

# 5. Create the PostgreSQL database
# In psql: CREATE DATABASE smartbuy_ai;

# 6. Run migrations
python manage.py migrate

# 7. Start the server
python manage.py runserver
# → http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 🗺️ Development Phases

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | Project foundation & architecture | ✅ Current |
| **Phase 2** | Database models — Laptops product catalog | ⏳ Planned |
| **Phase 3** | REST API endpoints (CRUD) | ⏳ Planned |
| **Phase 4** | JWT Authentication | ⏳ Planned |
| **Phase 5** | AI integration & requirement extraction | ⏳ Planned |
| **Phase 6** | Recommendation engine | ⏳ Planned |
| **Phase 7** | React frontend — core UI | ⏳ Planned |
| **Phase 8** | Wishlist, Cart, Orders | ⏳ Planned |
| **Phase 9** | Review analysis | ⏳ Planned |
| **Phase 10** | Deployment | ⏳ Planned |

---

## 📄 Documentation

- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Development Guide](docs/DEVELOPMENT_GUIDE.md)

---

## 📜 License

MIT
