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

### ✅ Phase 1 — Project Foundation (Current)

**Goal:** Set up the project skeleton so every future phase has a solid, consistent base.

**Deliverables:**
- Django project structure (`config/`, `apps/`, `services/`)
- React app scaffold (Vite)
- PostgreSQL connection configured
- Documentation (`PROJECT_OVERVIEW.md`, `ARCHITECTURE.md`, `DEVELOPMENT_GUIDE.md`)
- Git initialized with `.gitignore`
- `README.md`

---

### ⏳ Phase 2 — Database Models

**Goal:** Define and migrate all core database models for the Laptop product category.

**Deliverables:**
- `apps/products/models.py` — Laptop model with all specification fields
- `apps/accounts/models.py` — Custom User model
- Django migrations
- Django admin registration for all models
- Seed data script for sample laptops

---

### ⏳ Phase 3 — REST API Endpoints

**Goal:** Expose all product and user data via DRF REST API.

**Deliverables:**
- Product list / detail endpoints
- Serializers for all models
- API versioning (`/api/v1/`)
- Pagination and filtering
- Postman collection

---

### ⏳ Phase 4 — JWT Authentication

**Goal:** Secure the API with JWT-based authentication.

**Deliverables:**
- User registration endpoint
- Login / logout endpoints
- Token refresh endpoint
- Protected routes (middleware)
- Frontend auth flow (token storage, auto-refresh)

---

### ⏳ Phase 5 — AI Integration

**Goal:** Integrate the LLM API to extract structured requirements from user input.

**Deliverables:**
- `apps/ai/` — LLM API client
- Prompt engineering for requirement extraction
- Structured requirements schema
- `apps/requirements/models.py` — stored requirements per session
- API endpoint: `POST /api/ai/parse-requirements/`

---

### ⏳ Phase 6 — Recommendation Engine

**Goal:** Build the recommendation engine that scores products against requirements.

**Deliverables:**
- `apps/recommendations/` — scoring logic
- Weighted scoring algorithm
- Match explanation generator
- API endpoint: `POST /api/recommendations/`

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
