# SmartBuy AI — REST API Contract (Phase 5)

---

## 1. Overview & API Stability Rules

This document specifies the official, stable REST API Contract for **SmartBuy AI**.

### ⚠️ API Stability Rules
1. **Endpoint Immutability**: URLs, HTTP methods, and field names defined in this contract are stable interfaces consumed by the React UI, Recommendation Engine, AI services, and external clients.
2. **Backward Compatibility**: Existing endpoint routes, field keys, or HTTP methods must not be renamed, removed, or changed.
3. **Future Extension**: New capabilities will be introduced via optional fields, query parameters, or backward-compatible routes.
4. **Versioning Readiness**: All endpoints are accessible at both `/api/` and `/api/v1/`.

---

## 2. API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products/` | List products with filtering, search, pagination, and ordering | None (AllowAny) |
| `GET` | `/api/products/{product_id}/` | Retrieve full details of a specific laptop product | None (AllowAny) |
| `GET` | `/api/categories/` | List distinct high-level product categories | None (AllowAny) |
| `GET` | `/api/product-segments/` | List distinct product market segments | None (AllowAny) |
| `GET` | `/api/brands/` | List distinct laptop manufacturers/brands | None (AllowAny) |
| `GET` | `/api/products/{product_id}/reviews/` | List reviews for a specific product | None (AllowAny) |
| `POST` | `/api/requirements/` | Submit a structured requirement profile | None (AllowAny) |
| `GET` | `/api/requirements/{requirement_id}/` | Retrieve a stored requirement profile | None (AllowAny) |
| `POST` | `/api/v1/recommendations/` | Generate ranked laptop recommendations for a requirement | None (AllowAny) |
| `GET` | `/api/v1/recommendations/{recommendation_id}/` | Retrieve stored recommendation result by ID | None (AllowAny) |
| `POST` | `/api/v1/ai/understand-requirements/` | Parse natural-language query into structured JSON requirement | None (AllowAny) |
| `POST` | `/api/v1/smartbuy/search/` | End-to-end pipeline: NL Query → AI Understanding → Requirement → Ranked Recommendations | None (AllowAny) |
| `GET` | `/api/v1/products/{product_id}/review-intelligence/` | Retrieve evidence-based review statistics, sentiment distribution, and themes | None (AllowAny) |
| `POST` | `/api/v1/products/compare/` | Side-by-side comparison of 2 to 4 laptops with specs, INR pricing, review intelligence, and trade-offs | None (AllowAny) |

---

## 3. Detailed Endpoint Specifications

### 3.1 Product List API

* **URL**: `GET /api/products/`
* **Authentication**: None
* **Pagination**: Standard PageNumberPagination (20 items per page).

#### Query Parameters:
* **Exact Filters**: `brand`, `product_segment`, `ram_gb`, `storage_gb`, `storage_type`, `gpu_type`, `operating_system`, `release_year`
* **Range Filters**: `min_price`, `max_price`, `min_ram`, `min_storage`, `min_rating`, `max_weight`, `min_battery_life`
* **Search**: `search` (searches `product_name`, `brand`, `processor`, `gpu`, `product_segment`)
* **Ordering**: `ordering` (`price`, `-price`, `rating`, `-rating`, `weight_kg`, `-weight_kg`, `battery_life`, `-battery_life`)
* **Pagination**: `page` (integer, default `1`)

#### Example Request:
```http
GET /api/products/?brand=Apple&min_ram=16&ordering=-rating HTTP/1.1
Host: localhost:8000
```

#### Success Response (200 OK):
```json
{
  "count": 8,
  "next": null,
  "previous": null,
  "results": [
    {
      "product_id": "LAP0052",
      "product_name": "Apple MacBook Air 13 (Apple M3, 16GB/512GB)",
      "brand": "Apple",
      "category": "Laptop",
      "product_segment": "Ultrabook",
      "price": "126077.00",
      "currency": "INR",
      "ram_gb": 16,
      "storage_gb": 512,
      "storage_type": "SSD",
      "processor": "Apple M3",
      "cpu_cores": 8,
      "gpu": "Apple M3 10-core GPU",
      "gpu_type": "Integrated",
      "display_size": "13.60",
      "display_resolution": "2560x1664",
      "display_type": "Liquid Retina",
      "refresh_rate": 60,
      "weight_kg": "1.24",
      "battery_wh": "52.6",
      "battery_life": "15.0",
      "operating_system": "macOS",
      "release_year": 2023,
      "rating": "4.90",
      "review_count": 14,
      "original_price": null,
      "warranty": "",
      "product_description": "",
      "image_url": null,
      "created_at": "2026-09-29T05:38:00Z",
      "updated_at": "2026-09-29T05:38:00Z"
    }
  ]
}
```

---

### 3.2 Product Detail API

* **URL**: `GET /api/products/{product_id}/`
* **Authentication**: None

#### Example Request:
```http
GET /api/products/LAP0001/ HTTP/1.1
```

#### Success Response (200 OK):
```json
{
  "product_id": "LAP0001",
  "product_name": "Dell Inspiron 15 (i3-1215U, 16GB/512GB)",
  "brand": "Dell",
  "category": "Laptop",
  "product_segment": "Budget",
  "price": "43077.00",
  "currency": "INR",
  "ram_gb": 16,
  "storage_gb": 512,
  "storage_type": "SSD",
  "processor": "Intel Core i3-1215U",
  "cpu_cores": 6,
  "gpu": "Intel UHD Graphics",
  "gpu_type": "Integrated",
  "display_size": "15.60",
  "display_resolution": "1920x1080",
  "display_type": "IPS",
  "refresh_rate": 60,
  "weight_kg": "2.00",
  "battery_wh": "45.0",
  "battery_life": "7.0",
  "operating_system": "Windows 11 Home",
  "release_year": 2022,
  "rating": "3.20",
  "review_count": 20,
  "original_price": null,
  "warranty": "",
  "product_description": "",
  "image_url": null,
  "created_at": "2026-09-29T05:38:00Z",
  "updated_at": "2026-09-29T05:38:00Z"
}
```

#### Error Response (404 Not Found):
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Product with ID 'LAP9999' not found."
  }
}
```

---

### 3.3 Categories API

* **URL**: `GET /api/categories/`

#### Success Response (200 OK):
```json
{
  "categories": [
    "Laptop"
  ],
  "count": 1
}
```

---

### 3.4 Product Segments API

* **URL**: `GET /api/product-segments/`

#### Success Response (200 OK):
```json
{
  "product_segments": [
    "Budget",
    "Everyday",
    "Gaming",
    "Premium/Professional",
    "Professional",
    "Ultrabook"
  ],
  "count": 6
}
```

---

### 3.5 Brands API

* **URL**: `GET /api/brands/`

#### Success Response (200 OK):
```json
{
  "brands": [
    "Acer",
    "Apple",
    "ASUS",
    "Dell",
    "HP",
    "Lenovo",
    "LG",
    "Microsoft",
    "MSI",
    "Razer",
    "Samsung"
  ],
  "count": 11
}
```

---

### 3.6 Product Reviews API

* **URL**: `GET /api/products/{product_id}/reviews/`
* **Query Parameters**: `ordering` (`-review_date`, `-helpful_votes`, `-rating`, `rating`), `page`

#### Success Response (200 OK):
```json
{
  "count": 20,
  "next": null,
  "previous": null,
  "results": [
    {
      "review_id": "REV00001",
      "product_id": "LAP0001",
      "rating": "3.00",
      "review_title": "Mixed feelings",
      "review_text": "Good for basic tasks, though a few things could be better. Performance is snappy, apps open instantly. Battery life is disappointing, need the charger constantly.",
      "review_date": "2026-01-08",
      "verified_purchase": true,
      "helpful_votes": 19,
      "created_at": "2026-09-29T05:38:00Z"
    }
  ]
}
```

---

### 3.7 Requirement Submission API

* **URL**: `POST /api/requirements/`

#### Request Body:
```json
{
  "category": "Laptop",
  "budget_min": 500,
  "budget_max": 1000,
  "use_case": "Programming",
  "minimum_ram": 16,
  "minimum_storage": 512,
  "preferred_storage_type": "SSD",
  "battery_priority": "high",
  "performance_priority": "high",
  "weight_priority": "medium",
  "brand_preference": "Lenovo",
  "raw_user_query": "I need a Lenovo laptop for programming with 16GB RAM and good battery."
}
```

#### Success Response (201 Created):
```json
{
  "requirement_id": 1,
  "user": null,
  "category": "Laptop",
  "budget_min": "500.00",
  "budget_max": "1000.00",
  "use_case": "Programming",
  "minimum_ram": 16,
  "minimum_storage": 512,
  "preferred_storage_type": "SSD",
  "battery_priority": "high",
  "performance_priority": "high",
  "weight_priority": "medium",
  "brand_preference": "Lenovo",
  "raw_user_query": "I need a Lenovo laptop for programming with 16GB RAM and good battery.",
  "created_at": "2026-09-29T05:40:00Z"
}
```

#### Validation Error Response (400 Bad Request):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data.",
    "details": {
      "budget_max": [
        "Maximum budget cannot be less than minimum budget."
      ]
    }
  }
}
```

---

### 3.8 Requirement Detail API

* **URL**: `GET /api/requirements/{requirement_id}/`

#### Success Response (200 OK):
```json
{
  "requirement_id": 1,
  "user": null,
  "category": "Laptop",
  "budget_min": "500.00",
  "budget_max": "1000.00",
  "use_case": "Programming",
  "minimum_ram": 16,
  "minimum_storage": 512,
  "preferred_storage_type": "SSD",
  "battery_priority": "high",
  "performance_priority": "high",
  "weight_priority": "medium",
  "brand_preference": "Lenovo",
  "raw_user_query": "I need a Lenovo laptop for programming with 16GB RAM and good battery.",
  "created_at": "2026-09-29T05:40:00Z"
}
```

---

### 3.9 Generate Recommendations API

* **URL**: `POST /api/v1/recommendations/`
* **Authentication**: None

#### Request Body:
```json
{
  "requirement_id": 1,
  "limit": 5
}
```

#### Success Response (200 OK):
```json
{
  "recommendation_id": 1,
  "requirement_id": 1,
  "total_candidates": 10,
  "recommendations": [
    {
      "product_id": "LAP0023",
      "rank": 1,
      "match_score": 59.1,
      "product": {
        "product_id": "LAP0023",
        "product_name": "Lenovo IdeaPad 5 (7530U, 16GB/1024GB)",
        "brand": "Lenovo",
        "category": "Laptop",
        "product_segment": "Everyday",
        "price": "77107.00",
        "currency": "INR",
        "ram_gb": 16,
        "storage_gb": 1024,
        "storage_type": "SSD",
        "processor": "AMD Ryzen 5 7530U",
        "cpu_cores": 6,
        "gpu": "Intel Iris Xe Graphics",
        "gpu_type": "Integrated",
        "display_size": "14.00",
        "display_resolution": "1920x1200",
        "display_type": "IPS",
        "refresh_rate": 60,
        "weight_kg": "1.54",
        "battery_wh": "50.0",
        "battery_life": "7.4",
        "operating_system": "Windows 11 Home",
        "release_year": 2023,
        "rating": "3.80",
        "review_count": 17
      },
      "explanation": {
        "positive": [
          "Fits within your maximum budget of ₹83,000.00 (₹77,107.00)",
          "Meets your 16GB RAM requirement (16GB installed)",
          "Provides 1024GB SSD storage (meets 512GB requirement)",
          "Matches your preferred brand (Lenovo)",
          "Excellent for programming with 16GB RAM and 6-core AMD Ryzen 5 7530U"
        ],
        "tradeoffs": []
      }
    }
  ]
}
```

#### Error Response (404 Not Found):
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Requirement with ID '9999' not found."
  }
}
```

---

### 3.10 Retrieve Recommendation Result API

* **URL**: `GET /api/v1/recommendations/{recommendation_id}/`
* **Authentication**: None

#### Success Response (200 OK):
```json
{
  "recommendation_id": 1,
  "created_at": "2026-09-29T06:03:00Z",
  "requirement_id": 1,
  "total_candidates": 10,
  "recommendations": [...]
}
```

---

### 3.11 AI Natural-Language Requirement Understanding API

* **URL**: `POST /api/v1/ai/understand-requirements/`
* **Authentication**: None

#### Request Body:
```json
{
  "query": "I need a laptop for programming under ₹80,000 with at least 16GB RAM and 512GB SSD"
}
```

#### Success Response (200 OK):
```json
{
  "status": "clear",
  "requirements": {
    "category": "Laptop",
    "budget_min": null,
    "budget_max": 80000,
    "use_case": "Programming",
    "minimum_ram": 16,
    "minimum_storage": 512,
    "preferred_storage_type": "SSD",
    "battery_priority": "high",
    "performance_priority": "high",
    "weight_priority": "high",
    "brand_preference": "Lenovo"
  },
  "unsupported_requirements": [],
  "clarification_questions": []
}
```

---

### 3.12 Smart Search End-to-End API

* **URL**: `POST /api/v1/smartbuy/search/`
* **Authentication**: None

#### Request Body:
```json
{
  "query": "I am a computer science student and I need a laptop for programming under ₹80,000. 16GB RAM, 512GB SSD, good battery, lightweight. Prefer Lenovo."
}
```

#### Success Response (200 OK):
```json
{
  "status": "clear",
  "query": "I am a computer science student...",
  "requirement": {
    "requirement_id": 1,
    "category": "Laptop",
    "budget_max": "80000.00",
    "use_case": "Programming",
    "minimum_ram": 16,
    "minimum_storage": 512,
    "preferred_storage_type": "SSD",
    "battery_priority": "high",
    "weight_priority": "high",
    "brand_preference": "Lenovo"
  },
  "understanding": { ... },
  "recommendation": {
    "recommendation_id": 1,
    "total_candidates": 10,
    "recommendations": [...]
  }
}
```

---

### 3.13 Review Intelligence API

* **URL**: `GET /api/v1/products/{product_id}/review-intelligence/`
* **Authentication**: None

#### Success Response (200 OK):
```json
{
  "product_id": "LAP0023",
  "review_statistics": {
    "total_reviews": 17,
    "average_rating": 3.76,
    "verified_review_count": 16,
    "verified_review_percentage": 94.12
  },
  "sentiment": {
    "positive": 70.59,
    "neutral": 5.88,
    "negative": 23.53
  },
  "confidence": "medium",
  "summary": "Customers generally praise this laptop. Reviewers frequently highlight the value for money and display. Some reviewers mention concerns regarding heating and fan noise.",
  "positive_themes": [
    {
      "theme": "Value for Money",
      "mention_count": 13
    },
    {
      "theme": "Display",
      "mention_count": 10
    }
  ],
  "negative_themes": [
    {
      "theme": "Heating",
      "mention_count": 4
    }
  ],
  "latest_review_date": "2026-02-15",
  "updated_at": "2026-09-30T10:07:50Z"
}
```

---

### 3.14 Product Comparison API

* **URL**: `POST /api/v1/products/compare/`
* **Authentication**: None

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

#### Success Response (200 OK):
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

### 3.15 AI Product Q&A API ("Ask This Laptop")

* **URL**: `POST /api/v1/products/{product_id}/ask/`
* **Authentication**: None

#### Request Body:
```json
{
  "question": "Is this laptop good for programming and what do customers say about its main weaknesses?"
}
```

#### Success Response (200 OK):
```json
{
  "status": "success",
  "product": {
    "product_id": "LAP0023",
    "product_name": "Lenovo IdeaPad 5 (7530U, 16GB/1024GB)",
    "price": 77107,
    "currency": "INR"
  },
  "question": "Is this laptop good for programming and what do customers say about its main weaknesses?",
  "answer": "This laptop is well-suited for programming and software development because it features 16GB RAM, a AMD Ryzen 5 7530U processor, and a 1024GB SSD. Customer feedback also highlights: Performance is praised in customer reviews.",
  "evidence": {
    "product_facts": [
      "16GB RAM",
      "1024GB SSD",
      "AMD Ryzen 5 7530U Processor"
    ],
    "review_insights": [
      "Performance is praised in customer reviews."
    ]
  },
  "confidence": "high"
}
```

#### Out-of-Scope Response (200 OK):
```json
{
  "status": "unsupported",
  "answer": "I can answer questions about this laptop's specifications and customer feedback."
}
```

#### Validation Error Response (400 Bad Request):
```json
{
  "error": "Question cannot be empty or whitespace only."
}
```

#### Product Not Found Response (404 Not Found):
```json
{
  "detail": "Product with ID 'LAP9999' not found."
}
```

---

## 4. Standardized Error Format


All error responses return a standardized JSON structure without exposing stack traces or filesystem paths:

```json
{
  "error": {
    "code": "NOT_FOUND | VALIDATION_ERROR | INTERNAL_SERVER_ERROR",
    "message": "Human-readable summary message.",
    "details": {}
  }
}
```

---

## 5. CORS & Security

* CORS is configured using `django-cors-headers` driven by `CORS_ALLOWED_ORIGINS` in `.env`.
* Development environments support `http://localhost:5173` and `http://localhost:3000`.
* All user input parameters undergo DRF serializer validation preventing raw SQL injection or invalid state mutations.
