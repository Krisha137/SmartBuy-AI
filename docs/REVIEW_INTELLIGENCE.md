# SmartBuy AI — Step 8: Review Intelligence Design

---

## 1. Overview & Architecture

**Review Intelligence** analyzes real customer reviews in PostgreSQL (`Review` model) to extract evidence-based customer opinions, sentiment distribution, key laptop themes, strengths, concerns, and confidence levels.

### Core Separation of Concerns

```text
Product Specifications (RAM, Storage, GPU, Price)
       ↓
PostgreSQL Product Table

Customer Opinions (Sentiment, Themes, Strengths, Concerns)
       ↓
PostgreSQL Review Table & Review Intelligence
```

### Precomputed Offline Batch Architecture

To ensure high API performance and zero dynamic LLM cost during user browsing:
```text
Customer Reviews Imported (data/reviews.csv -> 1,142 records)
       ↓
Management Command (python manage.py analyze_reviews)
       ↓
Review Intelligence Engine (services.review_intelligence)
       ↓
Stored Insight Records (ReviewAnalysis, ReviewThemeAnalysis, ProductReviewInsight)
       ↓
Fast REST API Read (GET /api/v1/products/{product_id}/review-intelligence/)
```

---

## 2. Review Intelligence Service Layer (`backend/services/review_intelligence/`)

```text
backend/services/review_intelligence/
├── __init__.py           # Package exports
├── schemas.py            # Laptop themes list, theme keywords & confidence thresholds
├── sentiment.py          # SentimentClassifier (positive, neutral, negative, empty)
├── theme_extractor.py    # ThemeExtractor (associates themes & theme sentiments)
├── aggregation.py        # InsightAggregator (stats, percentages, confidence & summary)
└── review_analyzer.py    # ReviewAnalyzer (orchestrator for single/batch product analysis)
```

---

## 3. Laptop Theme Taxonomy (`LAPTOP_THEMES`)

Central, maintainable list of 20 laptop themes defined in `schemas.py`:
- `Performance`
- `Battery`
- `Display`
- `Build Quality`
- `Keyboard`
- `Trackpad`
- `Thermals`
- `Heating`
- `Fan Noise`
- `Portability`
- `Design`
- `Value for Money`
- `Gaming`
- `Software`
- `Operating System`
- `Connectivity`
- `Storage`
- `RAM`
- `Customer Support`
- `Other`

---

## 4. Deterministic Confidence Calculation

Confidence reflects review evidence volume and consistency:

| Total Reviews | Confidence Level | Rationale |
| :--- | :--- | :--- |
| **0 to 4 reviews** | `low` | Limited review volume available for reliable claims |
| **5 to 19 reviews** | `medium` | Moderate evidence pool providing useful sentiment guidance |
| **20+ reviews** | `high` | Robust review volume supporting high-confidence claims |

---

## 5. Database Schema

### `ReviewAnalysis` (`review_analyses` table)
- `review`: OneToOne with `Review`
- `sentiment`: `'positive'`, `'neutral'`, `'negative'`, or `'empty'`

### `ReviewThemeAnalysis` (`review_theme_analyses` table)
- `review_analysis`: ForeignKey to `ReviewAnalysis`
- `theme`: CharField (e.g. `'Performance'`, `'Fan Noise'`)
- `sentiment`: `'positive'` or `'negative'`

### `ProductReviewInsight` (`product_review_insights` table)
- `product`: OneToOne with `Product`
- `total_reviews`: PositiveIntegerField
- `average_rating`: DecimalField(3, 2)
- `verified_review_count`: PositiveIntegerField
- `verified_review_percentage`: DecimalField(5, 2)
- `positive_percentage` / `neutral_percentage` / `negative_percentage`: DecimalField(5, 2)
- `confidence`: `'low'`, `'medium'`, or `'high'`
- `summary`: TextField (evidence-based text summary)
- `positive_themes` / `negative_themes`: JSONField (array of theme mention counts)

---

## 6. API Endpoint

### Review Intelligence API
- **URL**: `GET /api/v1/products/{product_id}/review-intelligence/`
- **Response Example (200 OK)**:
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
      {"theme": "Value for Money", "mention_count": 13},
      {"theme": "Display", "mention_count": 10},
      {"theme": "Battery", "mention_count": 6}
    ],
    "negative_themes": [
      {"theme": "Heating", "mention_count": 4},
      {"theme": "Fan Noise", "mention_count": 1}
    ]
  }
  ```

---

## 7. Management Command (`analyze_reviews`)

```bash
python manage.py analyze_reviews [--batch-size 50] [--product-id LAP0023]
```

- **Idempotency**: Executing multiple times reuses existing analyses without creating duplicate database records.
