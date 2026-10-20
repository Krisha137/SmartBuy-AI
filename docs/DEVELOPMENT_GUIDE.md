# SmartBuy AI — Development Guide

---

## Prerequisites

Before starting, ensure the following are installed on your machine:

| Tool | Version | Notes |
|---|---|---|
| Python | 3.10+ | [python.org](https://python.org) |
| pip | Latest | Bundled with Python |
| PostgreSQL | 14+ | [postgresql.org](https://postgresql.org) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Bundled with Node.js |
| Git | Any | [git-scm.com](https://git-scm.com) |

---

## Backend Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd smartbuy-ai
```

### 2. Create the PostgreSQL Database

Open your PostgreSQL client (psql, pgAdmin, or DBeaver) and run:

```sql
CREATE DATABASE smartbuy_ai;
```

### 3. Create and Activate a Virtual Environment

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate — Windows (PowerShell)
venv\Scripts\Activate.ps1

# Activate — Windows (Command Prompt)
venv\Scripts\activate.bat

# Activate — macOS / Linux
source venv/bin/activate
```

### 4. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Copy the example env file to `.env` at the project root and edit it:

```bash
# From the project root
cp .env.example .env
```

Edit `.env`:

```env
SECRET_KEY=your-django-secret-key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smartbuy_ai
AI_API_KEY=your-api-key-here
DJANGO_ENV=development
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### 6. Run Migrations

```bash
python manage.py migrate
```

### 7. Create a Superuser (optional, for Django admin)

```bash
python manage.py createsuperuser
```

### 8. Start the Django Development Server

```bash
python manage.py runserver
```

Django will be available at: **http://localhost:8000**

Django admin panel: **http://localhost:8000/admin/**

---

## Frontend Setup

### 1. Install Node Dependencies

```bash
cd frontend
npm install
```

### 2. Start the Vite Development Server

```bash
npm run dev
```

React frontend will be available at: **http://localhost:5173**

---

## Running Both Simultaneously

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
venv\Scripts\activate   # Windows
python manage.py runserver
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

---

## Project Development Phases

The project is built phase by phase. Each phase has a clear scope and deliverables.

---

### ✅ Phase 1 — Project Foundation
- Django project structure (`config/`, `apps/`, `services/`)
- React app scaffold (Vite)
- PostgreSQL connection configured

### ✅ Phase 2 — Database Foundation
- PostgreSQL `smartbuy_ai` database setup
- Product, Review, Requirement models

### ✅ Phase 3 — Dataset Analysis & Schema Alignment
- Approved `data/products.csv` (76 products) and `data/reviews.csv` (1,142 reviews) dataset mapping

### ✅ Phase 4 — Data Import & Verification
- `import_products`, `import_reviews`, and `verify_dataset` management commands

### ✅ Phase 5 — REST API Endpoints & Contract
- Exposing stable DRF REST APIs for products, categories, segments, brands, reviews, requirements

### ✅ Phase 6 — Deterministic Recommendation Engine
- Multi-factor candidate filtering, spec normalization, weighted scoring, machine explanations

### ✅ Step 7 — AI Natural-Language Requirement Understanding
- AI service abstraction (`AIService`), deterministic rule-based NLP parser (`RuleBasedRequirementParser`), INR budget parsing, strict JSON validation, server-side credential security, and smart search integration endpoints.

### ✅ Step 8 — Review Intelligence
- Hybrid AI/NLP review analysis service (`services.review_intelligence`), models (`ReviewAnalysis`, `ReviewThemeAnalysis`, `ProductReviewInsight`), offline precomputation management command (`analyze_reviews`), evidence-based theme extraction, deterministic confidence scoring, and REST API (`GET /api/v1/products/{product_id}/review-intelligence/`).

### ✅ Step 9 — Product Comparison System
- Neutral side-by-side product comparison service (`services.comparison`), 2–4 laptop product limit, INR price gap calculation, spec matrix, precomputed review intelligence integration, optional recommendation fit scoring, difference detection, factual trade-off analyzer, and REST API (`POST /api/v1/products/compare/`).

### ✅ Step 10 — AI Product Q&A ("Ask This Laptop")
- Factual evidence-based product Q&A service (`services.ai.product_qa`), strict grounding on database specs and precomputed review intelligence (`ProductReviewInsight`), out-of-scope question classification, prompt injection protection, deterministic rule-based Q&A engine (`RuleBasedProductQAEngine`), zero hallucination, and REST API (`POST /api/v1/products/{product_id}/ask/`).

### ✅ Step 11 — Professional React Frontend
- Component-driven React 19 + Vite + Tailwind CSS v4 frontend, complete API integration (`apiClient`), INR price formatting, search page, recommendations view, product detail view with SpecGrid & ReviewIntelligenceCard, AI Product Q&A panel, sticky comparison drawer, and side-by-side comparison matrix page.



---

### ⏳ Phase 7 — React Frontend (Core UI)

**Goal:** Build the user-facing React application.

**Deliverables:**
- Search page (natural language input)
- Results page (ranked recommendations)
- Product detail page
- Comparison page
- Responsive design

---

### ⏳ Phase 8 — Wishlist, Cart & Orders

**Goal:** Add e-commerce transaction features.

**Deliverables:**
- Wishlist management endpoints and UI
- Cart management endpoints and UI
- Order placement and tracking

---

### ⏳ Phase 9 — Review Analysis

**Goal:** Add AI-powered review summarization.

**Deliverables:**
- `apps/reviews/` — review CRUD
- LLM-powered sentiment analysis
- Review summary per product
- Review display in frontend

---

### ⏳ Phase 10 — Deployment

**Goal:** Deploy the full application.

**Deliverables:**
- Backend: Django on Gunicorn + Nginx
- Frontend: Static build served via Nginx or CDN
- PostgreSQL in production
- Environment secrets management
- CI/CD pipeline (GitHub Actions)

---

## Useful Django Commands

```bash
# Check for configuration issues
python manage.py check

# Create a new app
python manage.py startapp app_name

# Make migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Open Django shell
python manage.py shell

# Collect static files (production)
python manage.py collectstatic
```

---

## Project Conventions

| Convention | Rule |
|---|---|
| Branch names | `feature/phase-N-description` |
| Commit messages | `feat:`, `fix:`, `docs:`, `chore:` prefix |
| API versioning | All endpoints under `/api/v1/` |
| Environment | Never commit `.env`, never hardcode secrets |
| App structure | Each app is self-contained with its own `urls.py` |

---

*Last updated: Phase 1 — Project Foundation*
