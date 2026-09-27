# SmartBuy AI — Architecture

---

## System Architecture

SmartBuy AI follows a **layered architecture** with strict separation of concerns. The AI layer never controls the database; the database never sends data directly to the AI. Each layer has one clearly defined responsibility.

```
┌──────────────────────────────────────────────────────────────┐
│                         USER                                 │
│              (browser — React frontend)                      │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTPS / REST JSON
┌───────────────────────────▼──────────────────────────────────┐
│                    REACT FRONTEND                             │
│                  Vite + React.js                              │
│   Components → Pages → Hooks → Axios (API client)           │
└───────────────────────────┬──────────────────────────────────┘
                            │ REST API calls
┌───────────────────────────▼──────────────────────────────────┐
│                  DJANGO REST FRAMEWORK                        │
│                    (API Gateway)                             │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │accounts  │ │products  │ │reviews   │ │comparisons    │  │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├───────────────┤  │
│  │wishlist  │ │cart      │ │orders    │ │requirements   │  │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├───────────────┤  │
│  │recommendations      │ │ai (proxy)│                   │  │
│  └──────────────────────┘ └──────────┘                   │  │
│                                                              │
│  services/ — shared business logic (reusable utilities)     │
└────────────────┬─────────────────────┬────────────────────── ┘
                 │                     │
    ┌────────────▼──────┐   ┌──────────▼────────────────────┐
    │    PostgreSQL     │   │         AI LAYER               │
    │  (source of truth)│   │      (LLM API — Phase 5+)     │
    │                   │   │                               │
    │  Product data     │   │  Input: user natural language  │
    │  User accounts    │   │  Output: structured JSON reqs  │
    │  Reviews          │   │                               │
    │  Orders etc.      │   └──────────┬────────────────────┘
    └────────────┬──────┘              │ structured requirements
                 │                     │
    ┌────────────▼─────────────────────▼────────────────────┐
    │              RECOMMENDATION ENGINE                     │
    │  - Receives structured requirements (JSON)            │
    │  - Queries PostgreSQL for matching products           │
    │  - Scores and ranks products                          │
    │  - Returns ranked list with match scores              │
    └───────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route-level page components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Axios API client functions
│   ├── store/            # State management (Context / Redux)
│   ├── utils/            # Utility functions
│   └── App.jsx           # Root component + routing
├── public/
└── vite.config.js
```

**Communication:** React talks to the Django backend exclusively via REST API (Axios). No direct database access from the frontend.

---

## Backend Architecture

```
backend/
├── config/               # Django project (settings, urls, wsgi, asgi)
├── apps/
│   ├── accounts/         # User registration, login, JWT, profiles
│   ├── products/         # Product catalog (Laptop models in MVP)
│   ├── requirements/     # Parsed/structured user requirements
│   ├── recommendations/  # Recommendation engine & scoring
│   ├── reviews/          # Product reviews and sentiment
│   ├── comparisons/      # Side-by-side comparison logic
│   ├── wishlist/         # User wishlist
│   ├── cart/             # Shopping cart
│   ├── orders/           # Order placement & tracking
│   └── ai/               # Thin proxy to LLM API (prompt building, parsing)
└── services/             # Shared services used across apps
```

Each `app/` follows the standard Django structure:
```
app_name/
├── models.py
├── serializers.py
├── views.py
├── urls.py
├── admin.py
└── tests.py
```

---

## Database Layer

**Database:** PostgreSQL 14+

PostgreSQL is the **single source of truth** for all product information.

Key design principles:
- All product specifications are stored in structured, normalized tables
- No product data is generated or modified by the AI layer
- The AI only reads structured data (via the recommendation engine)
- Migrations are managed by Django's ORM

**Planned tables (to be created in Phase 2+):**

| Table | Description |
|---|---|
| `users` | User accounts (via Django auth) |
| `laptops` | Laptop product catalog with full specs |
| `reviews` | User reviews per product |
| `wishlists` | User wishlist items |
| `cart_items` | Shopping cart contents |
| `orders` | Order records |
| `order_items` | Individual items within an order |
| `user_requirements` | Stored parsed requirements per session |

---

## AI Layer

**Status:** Planned for Phase 5

The AI layer is a thin service that:
1. Receives raw user natural language input
2. Sends it to an LLM API (e.g., Gemini, GPT-4, Claude)
3. Parses the LLM response into a **structured requirements JSON**
4. Returns the structured JSON to the recommendation engine

**What the AI does NOT do:**
- Query the database
- Generate or invent product specifications
- Make final product decisions
- Return products directly to the user

**Structured requirements format (planned):**
```json
{
  "category": "laptop",
  "max_price": 70000,
  "min_ram": 16,
  "use_case": ["programming", "development"],
  "weight_preference": "lightweight",
  "battery_priority": "high",
  "os_preference": null
}
```

---

## Recommendation Layer

The recommendation engine:
1. Receives structured requirements JSON
2. Queries PostgreSQL for products in the given category
3. Scores each product against each requirement (weighted scoring)
4. Ranks products by total match score
5. Returns ranked products with per-requirement match explanations

**The engine does NOT:**
- Call the LLM API
- Write to the database
- Modify product data

---

## Data Flow

### Natural Language Search Flow

```
User types: "I need a laptop under ₹70,000 for programming"
        ↓
  React Frontend
        ↓ POST /api/search/
  Django (requirements app)
        ↓ calls AI layer
  AI Layer → LLM API
        ↓ returns structured JSON
  Recommendation Engine
        ↓ queries PostgreSQL
  PostgreSQL → matching products
        ↓ scored & ranked
  Django serializer
        ↓ JSON response
  React Frontend → display results
```

### Authentication Flow

```
User registers / logs in
        ↓ POST /api/auth/login/
  Django (accounts app)
        ↓ validates credentials
  PostgreSQL (users table)
        ↓ generates JWT tokens
  Access Token + Refresh Token
        ↓ returned to client
  React stores tokens (httpOnly cookie or localStorage)
        ↓ includes token in future requests
  Django validates token on each protected endpoint
```

---

## Communication Between Components

| From | To | Protocol | Format |
|---|---|---|---|
| React Frontend | Django DRF | HTTPS REST | JSON |
| Django apps | PostgreSQL | Django ORM | SQL (internal) |
| Django AI app | LLM API | HTTPS | JSON (prompt/response) |
| AI Layer | Recommendation Engine | Function call | Structured Python dict / JSON |
| Recommendation Engine | PostgreSQL | Django ORM | SQL (internal) |

---

*Last updated: Phase 1 — Project Foundation*
