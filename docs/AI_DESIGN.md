# SmartBuy AI — Step 7: AI Natural-Language Requirement Understanding Design

---

## 1. Overview & Architecture

The **AI Natural-Language Requirement Understanding Layer** in SmartBuy AI translates unformatted, natural-language shopping queries into strict, validated, structured JSON requirement specifications (`Requirement` model format).

### Pipeline Flow

```text
User Natural Language Query (e.g. "Laptop for coding under ₹80k with 16GB RAM")
       ↓
AI Requirement Parser (services.ai.AIService / RuleBasedRequirementParser)
       ↓
Strict JSON Output
       ↓
Backend DRF Validation (services.ai.schemas)
       ↓
Persisted Requirement Profile (apps.requirements.models.Requirement)
       ↓
Existing Deterministic Recommendation Engine (services.recommendation_engine)
       ↓
Ranked Laptop Recommendations & Explanations
```

### Core Architectural Principles
1. **Separation of Concerns**: The AI is ONLY responsible for natural language comprehension.
2. **No Direct Database Access**: The AI does NOT touch PostgreSQL, update Product models, or rank products.
3. **Deterministic Matching**: Product matching and ranking remain 100% driven by PostgreSQL queries and the deterministic recommendation engine.
4. **Backend Validation**: AI output is never trusted directly; it passes through strict DRF and business rule validation before model instantiation.

---

## 2. Dedicated AI Service Layer (`backend/services/ai/`)

```text
backend/services/ai/
├── __init__.py           # Package exports (AIService, RuleBasedRequirementParser, etc.)
├── ai_service.py         # Provider abstraction (AIService) with LLM & fallback logic
├── requirement_parser.py # Rule-based deterministic NLP requirement parser
├── prompts.py            # System prompts & JSON output schema instructions
└── schemas.py            # Domain rules & backend validation logic
```

### Provider Abstraction & Credential Security
- **Server-Side Credentials**: `AI_API_KEY` is loaded exclusively on the Django backend via `python-decouple`. Secrets are NEVER sent to the React frontend.
- **Provider Fallback**: If `AI_API_KEY` is unconfigured, unreachable, or times out, `AIService` seamlessly falls back to `RuleBasedRequirementParser` so the system operates reliably without breaking.

---

## 3. Strict AI Output JSON Schema

All natural-language queries produce JSON conforming strictly to this format:

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

### Field Value Boundaries
- **`status`**: `"clear"` or `"needs_clarification"`
- **`category`**: `"Laptop"` (MVP supported category)
- **`use_case`**: `"Programming"`, `"Gaming"`, `"Everyday"`, `"Professional"`, or `null`
- **`preferred_storage_type`**: `"SSD"`, `"HDD"`, `"eMMC"`, or `null`
- **`battery_priority` / `performance_priority` / `weight_priority`**: `"low"`, `"medium"`, `"high"`, or `null`
- **`brand_preference`**: `"Acer"`, `"Apple"`, `"ASUS"`, `"Dell"`, `"HP"`, `"Lenovo"`, `"LG"`, `"Microsoft"`, `"MSI"`, `"Razer"`, `"Samsung"`, or `null`

---

## 4. Indian Rupee (INR / ₹) Budget Parsing Standard

All budget understanding operates strictly in **Indian Rupees (INR / ₹)**:

| User Expression | Parsed `budget_min` (₹) | Parsed `budget_max` (₹) |
| :--- | :--- | :--- |
| `"under ₹80,000"` / `"80k"` / `"80 thousand"` | `null` | `80,000` |
| `"under 1 lakh"` | `null` | `1,00,000` |
| `"around 1.5 lakhs"` | `null` | `1,50,000` |
| `"70k to 1 lakh"` / `"between ₹70,000 and ₹1,00,000"` | `70,000` | `1,00,000` |

---

## 5. API Endpoints

### 5.1 Understand Requirements API
- **Endpoint**: `POST /api/v1/ai/understand-requirements/`
- **Request**:
  ```json
  {
    "query": "I need a laptop for programming under ₹80,000 with at least 16GB RAM and 512GB SSD"
  }
  ```
- **Response (200 OK)**:
  Returns structured AI understanding JSON payload.

### 5.2 Smart Search API (End-to-End Pipeline)
- **Endpoint**: `POST /api/v1/smartbuy/search/`
- **Request**:
  ```json
  {
    "query": "I am a computer science student and I need a laptop for programming under ₹80,000 with 16GB RAM, 512GB SSD, good battery life, lightweight, prefer Lenovo."
  }
  ```
- **Response (200 OK)**:
  Returns natural language understanding, saved PostgreSQL Requirement instance, and ranked product recommendations with match scores and explanations.

---

## 6. Testing & Mocks

All 42 backend unit tests run in isolation with mocked AI provider calls (`unittest.mock.patch`):
- `test_basic_programming_understanding`: Validates spec extraction for programming use case.
- `test_storage_extraction`: Validates TB to GB conversion (1TB -> 1024GB).
- `test_gaming_understanding`: Validates gaming intent & high performance priority.
- `test_inr_currency_expressions`: Tests `80k`, `1 lakh`, and range expressions.
- `test_brand_preference`: Tests brand extraction.
- `test_ambiguous_query_clarification`: Tests vague query handling.
- `test_unsupported_requirement`: Tests unsupported feature array extraction.
- `test_invalid_budget_range`: Tests rejection of invalid range (`min > max`).
- `test_end_to_end_smart_search_pipeline`: Verifies full end-to-end integration.

---

## 7. AI Product Q&A System ("Ask This Laptop")

### 7.1 Architecture & Grounding Principle
- **Explanation Layer Only**: The AI engine synthesizes answers from database specs and precomputed review insights (`ProductReviewInsight`).
- **Endpoint**: `POST /api/v1/products/{product_id}/ask/`
- **Data Grounding**:
  - Specs source of truth: PostgreSQL `Product` table (prices in INR).
  - Opinions source of truth: PostgreSQL `ProductReviewInsight` table.
  - No raw review context is sent to the LLM; only precomputed review intelligence is included.

### 7.2 Safety & Prompt Protection
- Out-of-scope queries (weather, writing code, general trivia) return `"status": "unsupported"`.
- Prompt injection attempts are neutralized safely without exposing internal prompts or keys.
- Fallback to deterministic `RuleBasedProductQAEngine` when no LLM API key is present or on API timeout.

