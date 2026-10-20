# SmartBuy AI — Step 10: AI Product Q&A ("Ask This Laptop")

## 1. Overview

The **AI Product Q&A System** enables users to ask natural-language questions about a specific laptop product (e.g., *"Is this laptop good for programming?"*, *"What are the main customer complaints?"*, *"How is the battery life according to reviews?"*, *"Is it under ₹80,000?"*).

### Core Principle
- **Explanation Layer Only**: The AI engine acts purely as an explanation and synthesis layer. It is **NOT** the source of product truth.
- **Strict Grounding Hierarchy**:
  1. **Product Specifications** → PostgreSQL `Product` table (Source of Truth for specs & prices in INR).
  2. **Customer Opinions** → Precomputed `ProductReviewInsight` (Source of Truth for review feedback, positive/negative themes, sentiment).
  3. **Natural-Language Synthesis** → `ProductQAService` (Combines facts & insights into grounded answers with evidence).

---

## 2. API Endpoint

`POST /api/v1/products/{product_id}/ask/`

### Request Header & Body
```json
Content-Type: application/json

{
  "question": "Is this laptop good for programming and what do customers say about its main weaknesses?"
}
```

### Success Response (`200 OK`)
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

### Out-of-Scope Response (`200 OK`)
```json
{
  "status": "unsupported",
  "answer": "I can answer questions about this laptop's specifications and customer feedback."
}
```

### Invalid Input Response (`400 Bad Request`)
```json
{
  "error": "Question cannot be empty or whitespace only."
}
```

### Non-Existent Product (`404 Not Found`)
```json
{
  "detail": "Product with ID 'LAP9999' not found."
}
```

---

## 3. Grounded Context & Data Sources

For every valid question, the Django backend retrieves:
1. **`Product` model**:
   - `product_name`, `brand`, `price` (in INR), `currency` (`"INR"`), `ram_gb`, `storage_gb`, `storage_type`, `processor`, `cpu_cores`, `gpu`, `gpu_type`, `display_size`, `display_resolution`, `refresh_rate`, `weight_kg`, `battery_life`, `battery_wh`, `operating_system`.
2. **`ProductReviewInsight` model**:
   - Precomputed `summary`, `positive_themes` (e.g. Performance, Display), `negative_themes` (e.g. Heating, Fan Noise).

No raw reviews (out of 1,142) are sent to the AI provider. Only precomputed review intelligence is included, eliminating token bloat and hallucination risks.

---

## 4. Question Validation & Scope Control

1. **Validation Rules**:
   - `question` is required, must be a string.
   - Whitespace is trimmed.
   - Empty strings or whitespace-only queries rejected (`400 Bad Request`).
   - Maximum length limit: 500 characters (`400 Bad Request`).
2. **Product Validation**:
   - Product existence checked in PostgreSQL before calling AI (`404 Not Found` if missing).
3. **Out-of-Scope Classification**:
   - Unrelated questions (weather, general programming script requests, trivia) detected and answered with `"status": "unsupported"`.
4. **Prompt Injection Protection**:
   - Questions containing prompt extraction attempts ("ignore previous instructions", "reveal system prompt") are safely neutralized without exposing system instructions or secrets.

---

## 5. Confidence Calculation

Confidence is determined deterministically based on supporting evidence:
- **`high`**: Directly supported by exact database product specs (e.g., RAM, storage, price in INR) or strong positive/negative review theme matches.
- **`medium`**: Combines product specs and review intelligence with moderate evidence.
- **`low`**: Answer has limited evidence or asks about unrecorded product attributes (returns `"I don't have enough information in the available product data to answer that."`).

---

## 6. Currency Standard

- All prices are strictly in **Indian Rupees (INR / ₹)**.
- USD (`$`) is completely eliminated.
