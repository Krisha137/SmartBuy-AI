# SmartBuy AI — Step 11: Professional React Frontend Documentation

## 1. Overview

The **SmartBuy AI React Frontend** is a modern, responsive, component-driven user interface built with **React 19**, **Vite**, **Tailwind CSS v4**, **React Router v7**, and **Axios**.

### Architecture & Grounding Principle
- **Presentation & Interaction Layer**: The frontend consumes the existing Django REST Framework APIs (`/api/v1/`).
- **No Duplicate Logic**: React does not compute recommendation scores, review sentiment, AI requirement parsing, or exchange rate conversions. The backend is the single source of truth.
- **INR Currency Standard**: All prices and monetary filters use Indian Rupees (`₹` / `INR`).

---

## 2. Folder Structure

```text
frontend/
├── src/
│   ├── api/                     # Centralized API service layer
│   │   ├── client.js            # Axios client with base URL & error interceptors
│   │   ├── products.js          # Catalog & spec endpoints
│   │   ├── recommendations.js   # Deterministic recommendation endpoints
│   │   ├── ai.js                # AI Smart Search & Product Q&A endpoints
│   │   ├── reviews.js           # Reviews & Review Intelligence endpoints
│   │   └── comparison.js        # Multi-product comparison matrix endpoint
│   │
│   ├── components/
│   │   ├── common/              # Global UI elements
│   │   │   ├── Header.jsx       # Global navbar with search & mobile drawer
│   │   │   ├── Footer.jsx       # Footer with branding & tech stack
│   │   │   ├── LoadingSkeleton.jsx  # Animated skeleton loaders
│   │   │   ├── ErrorState.jsx   # Error callout component
│   │   │   └── EmptyState.jsx   # Empty state UI
│   │   │
│   │   ├── products/            # Product presentation
│   │   │   ├── ProductCard.jsx  # Catalog product card
│   │   │   ├── ProductGrid.jsx  # Grid wrapper
│   │   │   ├── SpecGrid.jsx     # Detailed technical specifications grid
│   │   │   └── FilterSidebar.jsx# Catalog sidebar filters
│   │   │
│   │   ├── recommendations/     # AI Search & Recommendation components
│   │   │   ├── ProductRecommendationCard.jsx # Rank badge, score %, explanations, trade-offs
│   │   │   └── RequirementSummaryBadge.jsx   # AI-interpreted requirements badge
│   │   │
│   │   ├── reviews/             # Review Intelligence components
│   │   │   ├── ReviewIntelligenceCard.jsx # Sentiment bars, positive/negative themes
│   │   │   └── ReviewCard.jsx   # Individual verified customer reviews
│   │   │
│   │   ├── qa/                  # AI Product Q&A components
│   │   │   ├── AskLaptopPanel.jsx   # Q&A panel with grounded evidence display
│   │   │   └── SuggestedQuestions.jsx # Clickable suggestion pills
│   │   │
│   │   └── comparison/          # Comparison components
│   │       ├── ComparisonBar.jsx    # Floating sticky comparison drawer
│   │       └── ComparisonTable.jsx  # Side-by-side comparison matrix
│   │
│   ├── context/
│   │   └── ComparisonContext.jsx # Global comparison selection state (max 4 products)
│   │
│   ├── pages/                   # Application Routes
│   │   ├── Home.jsx             # Hero section, AI input, quick examples
│   │   ├── SearchResults.jsx    # Smart search results & interpreted requirements
│   │   ├── Explore.jsx          # Catalog browsing, filtering, sorting, pagination
│   │   ├── ProductDetails.jsx   # Full product page (specs, review intel, Q&A, reviews)
│   │   ├── Compare.jsx          # Side-by-side product comparison
│   │   └── NotFound.jsx         # 404 page
│   │
│   ├── utils/
│   │   └── formatters.js        # `formatINR()`, `formatRating()`, `formatPercentage()`
│   │
│   ├── App.jsx                  # Main router & provider wrapper
│   ├── index.css                # Tailwind imports & keyframes
│   └── main.jsx                 # Entry point
│
├── .env                         # Local environment configuration
├── .env.example                 # Template environment variables
├── package.json                 # Dependencies & build scripts
└── vite.config.js               # Vite plugin configuration
```

---

## 3. Routes & User Journey

| Route | Page | Purpose |
|---|---|---|
| `/` | `Home` | Hero search box ("Tell us what you need"), quick example pills, feature highlights |
| `/search` | `SearchResults` | Natural-language AI Smart Search results (`POST /api/v1/smartbuy/search/`) |
| `/explore` | `Explore` | Browse full catalog (`GET /api/v1/products/`) with filters & sorting |
| `/products/:productId` | `ProductDetails` | Technical specs, precomputed review intelligence, Q&A panel, customer reviews |
| `/compare` | `Compare` | Side-by-side comparison matrix (`POST /api/v1/products/compare/`) |
| `*` | `NotFound` | 404 fallback page |

---

## 4. Development & Production Commands

### Start Frontend Local Dev Server:
```bash
cd frontend
npm run dev
```

### Production Build Verification:
```bash
cd frontend
npm run build
```

---

## 5. Visual Channels & Trust Model

The UI visually distinguishes three types of information:
1. **Product Facts** (Blue/Slate): Direct PostgreSQL specifications (RAM, Storage, Price in INR).
2. **AI Requirement Understanding** (Indigo/Purple): Interpreted user query goals.
3. **Customer Feedback** (Emerald/Rose): Precomputed sentiment analysis & review theme extractions.
