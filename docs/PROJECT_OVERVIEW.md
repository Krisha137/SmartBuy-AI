# SmartBuy AI — Project Overview

## Project Name
**SmartBuy AI** — Intelligent E-Commerce Shopping Assistant

---

## Problem Statement

Traditional e-commerce search engines require users to know exactly what they want and express it through rigid filter forms (brand, RAM, price range, etc.). This creates friction for users who:

- Are not technically literate (don't know the difference between i5 and Ryzen 5)
- Have a budget and general use case but don't know which specifications match their needs
- Want personalized guidance rather than a list of 500 filter results
- Need a human-like assistant to explain *why* a product suits them

---

## Proposed Solution

SmartBuy AI allows users to describe their needs in **plain, conversational language**. The system:

1. Parses the user's description using an LLM to extract structured requirements
2. Queries a verified product catalog stored in PostgreSQL
3. Scores and ranks products against the extracted requirements
4. Returns recommendations with transparent, human-readable explanations
5. Allows users to compare products, ask follow-up questions, and manage a wishlist/cart/orders

---

## Main Objectives

1. Enable natural language product discovery
2. Provide explainable, trustworthy recommendations (grounded in real product data)
3. Separate AI logic from data logic to ensure reliability
4. Build a modular, extensible backend that can support multiple product categories
5. Deliver a responsive, user-friendly React frontend
6. Support secure user accounts with JWT authentication

---

## Target Users

| User Type | Description |
|---|---|
| **General Consumers** | People who know what they want to accomplish but not which product to buy |
| **Budget-Conscious Buyers** | Users who need the best value within a price range |
| **First-Time Buyers** | Users buying a product category for the first time |
| **Research-Oriented Buyers** | Users who want detailed comparisons and review summaries |

---

## Core Features

| Feature | Description |
|---|---|
| Natural Language Search | Describe needs in plain text |
| Requirement Extraction | AI converts description to structured requirements |
| Product Matching | Score products against requirements |
| Explainable Recommendations | Clear reasons for each recommendation |
| Product Comparison | Side-by-side comparison of multiple products |
| Review Analysis | AI-summarized review sentiment |
| Wishlist | Save products for later |
| Cart | Add products to cart |
| Orders | Place and track orders |
| User Authentication | JWT-secured user accounts |

---

## Technology Stack

| Component | Technology |
|---|---|
| Backend Framework | Django + Django REST Framework |
| Language | Python 3.10+ |
| Database | PostgreSQL 14+ |
| Frontend | React.js (Vite) |
| AI Layer | LLM API (phase 5+) |
| Data Processing | Pandas, NumPy |
| Authentication | JWT via djangorestframework-simplejwt |
| CORS | django-cors-headers |
| Environment Config | python-decouple |
| Version Control | Git |

---

## High-Level Architecture

```
┌─────────────────────────────────────────┐
│              React Frontend             │
│         (Vite + React.js)               │
└──────────────────┬──────────────────────┘
                   │ HTTP / REST (JSON)
┌──────────────────▼──────────────────────┐
│           Django REST Framework         │
│         (DRF API endpoints)             │
├─────────────────────────────────────────┤
│  apps/  accounts | products | reviews   │
│         wishlist | cart | orders        │
│         requirements | recommendations  │
│         comparisons | ai                │
├─────────────────────────────────────────┤
│         services/ (shared logic)        │
└───────────┬──────────────┬─────────────┘
            │              │
   ┌────────▼──────┐  ┌────▼──────────────┐
   │  PostgreSQL   │  │    AI Layer        │
   │  (source of   │  │ (LLM API — later) │
   │   truth)      │  └────────────────────┘
   └───────────────┘          │
                              │ structured requirements only
                    ┌─────────▼──────────┐
                    │ Recommendation     │
                    │ Engine             │
                    └────────────────────┘
```

**Architecture rules enforced:**
- The AI layer does NOT write to the database
- The AI layer does NOT invent product specs
- PostgreSQL is the single source of truth for all product data
- The recommendation engine receives only structured data

---

*Last updated: Phase 1 — Project Foundation*
