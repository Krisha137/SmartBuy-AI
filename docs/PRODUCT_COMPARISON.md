# SmartBuy AI — Step 9: Product Comparison System Design

---

## 1. Overview & Architecture

The **Product Comparison System** provides a neutral, evidence-based, side-by-side comparison of **2 to 4 laptop products**.

It evaluates:
1. PostgreSQL Product Specifications
2. INR Pricing (`₹`) & Price Gap Calculations
3. Precomputed Review Intelligence (Sentiment & Theme Feedback)
4. Optional Deterministic Recommendation Fit (Match Scores & Hard Constraints)
5. Objective Trade-Off & Difference Analysis

### Core Principles
- **Neutrality**: Comparison answers *"How are these products different?"* without declaring subjective "winners" or "#1 overall" choices.
- **Zero Hallucination**: Missing attributes are returned as `null` ("Not available"). Specifications come exclusively from PostgreSQL `Product` data.
- **Strict Input Validation**: Comparison requires 2 to 4 unique, valid product IDs. Requests with 1 product or 5+ products return `400 Bad Request`. Duplicate product IDs return `400 Bad Request`. Non-existent product IDs return `404 Not Found`.

---

## 2. Dynamic Pipeline Architecture

```text
Product IDs (2 to 4) [+ Optional requirement_id]
        ↓
PostgreSQL Product Records
        ↓
Specification Matrix & Factual Attribute Comparison

        +

Precomputed Review Intelligence (ProductReviewInsight)
        ↓
Review Statistics, Sentiment Percentages & Themes

        +

Optional Recommendation Fit (RecommendationEngine)
        ↓
Match Score & Hard Constraint Validation (Budget, RAM, Storage, Category)

        ↓

Difference Detector & Factual Tradeoff Analyzer (services.comparison)
        ↓
Structured API Response (POST /api/v1/products/compare/)
```

---

## 3. Service Layer Structure (`backend/services/comparison/`)

```text
backend/services/comparison/
├── __init__.py           # Package exports
├── schemas.py            # Input validation rules (2-4 unique product IDs)
├── difference_detector.py# Price gap & differing specification detector
├── tradeoff_analyzer.py # Factual, objective trade-off highlight generator
└── comparator.py         # ProductComparator pipeline orchestrator
```

---

## 4. API Endpoint Specification

### Product Comparison API
- **URL**: `POST /api/v1/products/compare/`
- **Authentication**: None

#### Request Body:
```json
{
  "product_ids": [
    "LAP0023",
    "LAP0068",
    "LAP0052"
  ],
  "requirement_id": 1
}
```

#### Success Response (`200 OK`):
```json
{
  "products": [
    {
      "product_id": "LAP0023",
      "product_name": "Lenovo IdeaPad 5 (7530U, 16GB/1024GB)",
      "brand": "Lenovo",
      "product_segment": "Everyday",
      "release_year": 2023,
      "price": 77107,
      "price_formatted": "₹77,107",
      "currency": "INR",
      "rating": 3.8,
      "review_count": 17
    }
  ],
  "specifications_matrix": {
    "basic": { ... },
    "pricing": { ... },
    "performance": { ... },
    "memory_storage": { ... },
    "graphics": { ... },
    "display": { ... },
    "battery": { ... },
    "portability": { ... },
    "operating_system": { ... }
  },
  "differences": {
    "price_difference": {
      "min_price": 66317,
      "min_price_formatted": "₹66,317",
      "max_price": 126077,
      "max_price_formatted": "₹1,26,077",
      "price_gap": 59760,
      "price_gap_formatted": "₹59,760"
    },
    "has_differing_specs": true,
    "differing_specifications": [ ... ]
  },
  "review_intelligence": { ... },
  "recommendation_fit": {
    "LAP0023": {
      "score": 58.1,
      "rank": 1,
      "hard_constraints": {
        "category_match": true,
        "budget_match": true,
        "ram_match": true,
        "storage_match": true
      },
      "explanations": { ... }
    }
  },
  "trade_offs": {
    "LAP0023": {
      "advantages": ["Highest storage capacity (1024GB SSD)"],
      "tradeoffs": ["Integrated graphics processor (Intel Iris Xe Graphics)"]
    }
  }
}
```

---

## 5. Performance & Non-Persistence Choice

- Comparisons are generated dynamically on demand without creating redundant database records.
- Product retrieval uses optimized bulk querying (`Product.objects.filter(product_id__in=product_ids)`).
- Review Intelligence metrics are read directly from precomputed `ProductReviewInsight` records, ensuring sub-50ms API responses.
