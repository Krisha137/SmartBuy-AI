# SmartBuy AI — Deterministic Recommendation Engine (Phase 6)

> **Disclaimer**: This is a prototype recommendation model. Its match scores are calculated strictly from database attribute heuristics and do not represent an objective or benchmark industry rating.

---

## 1. Overview & Architecture

The **SmartBuy AI Recommendation Engine** evaluates buyer requirements against actual laptop product records in PostgreSQL without using an LLM or external AI API.

### Pipeline Flow

```
Requirement (PostgreSQL)
       ↓
Hard Constraint Filtering (PostgreSQL ORM)
       ↓
Candidate Products Pool
       ↓
Feature Normalization (0.0 to 1.0 scale)
       ↓
Weighted Multi-Factor Scoring Engine
       ↓
Ranked Recommendations & Machine-Generated Explanations / Trade-offs
       ↓
Persisted Recommendation Result (PostgreSQL)
```

The database is the **sole runtime source of truth**. The engine does not invent or assume missing product specifications.

---

## 2. Hard Constraint Filtering

Before scoring, non-negotiable hard constraints are applied via PostgreSQL ORM queries:

1. **Category**: `category__iexact=requirement.category` (Defaults to `'Laptop'`).
2. **Maximum Budget**: `price <= requirement.budget_max` (in INR / ₹).
3. **Minimum Budget**: `price >= requirement.budget_min` (when provided).
4. **Minimum RAM**: `ram_gb >= requirement.minimum_ram` (when provided).
5. **Minimum Storage**: `storage_gb >= requirement.minimum_storage` (when provided).
6. **Preferred Storage Type**: `storage_type__iexact=requirement.preferred_storage_type` (when provided).

*Note*: **Brand Preference is NOT a hard constraint**. Brand preference is evaluated during soft-preference scoring so users receive high-matching options even if non-preferred brands offer strong alternatives.

---

## 3. Scoring System & Weight Configuration

Products satisfying all hard constraints are scored on a scale from **0.0 to 100.0**.

### Central Weight Configuration (`RECOMMENDATION_WEIGHTS`)

```python
RECOMMENDATION_WEIGHTS = {
    "requirement": 0.40,  # Requirement satisfaction (Price headroom + spec fulfillment)
    "performance": 0.20,  # CPU cores, RAM capacity, GPU type
    "battery": 0.15,      # Battery endurance (hours)
    "weight": 0.10,       # Portability / lightweight design
    "storage": 0.05,      # Storage headroom above minimum
    "brand": 0.05,        # Brand preference match
    "rating": 0.05        # Customer review rating
}
```

---

## 4. Feature Normalization & Sub-Scores

To prevent attributes with large numeric scales (e.g. storage GB) from dominating smaller scale attributes (e.g. weight in kg), features are normalized across the candidate pool:

* **Higher is Better** (RAM, Storage, Battery Life, Rating):
  $$\text{Normalized} = \frac{\text{value} - \text{min}}{\text{max} - \text{min}}$$
* **Lower is Better** (Weight in kg):
  $$\text{Normalized} = \frac{\text{max} - \text{value}}{\text{max} - \text{min}}$$

### Priority Weight Adjustments
* **Battery Priority**: `high` increases battery weight to `0.18`; `low` reduces it to `0.05` (reallocating headroom to requirement satisfaction).
* **Weight Priority**: `high` increases weight factor to `0.15`; `low` reduces it to `0.03`.

---

## 5. Use-Case Heuristics

1. **Programming**: Evaluates RAM ($\ge 16$ GB), CPU cores ($\ge 6$), SSD storage, and processor capabilities.
2. **Gaming**: Evaluates Dedicated GPU architecture, high refresh rate ($\ge 120$ Hz), and RAM ($\ge 16$ GB).
3. **Everyday**: Evaluates price value, battery endurance ($\ge 7$ hours), and moderate weight.
4. **Professional**: Evaluates high screen resolution, premium display panel (OLED / IPS), RAM ($\ge 16$ GB), and build quality.

---

## 6. Machine-Generated Explanations & Trade-Offs

Explanations are created deterministically by inspecting actual product fields against requirement targets:

### Positive Highlights
* `"Fits within your maximum budget of ₹83,000.00 (₹77,107.00)"`
* `"Meets your 16GB RAM requirement (16GB installed)"`
* `"Provides 1024GB SSD storage (meets 512GB requirement)"`
* `"Matches your preferred brand (Lenovo)"`
* `"Long battery life (9.7 hours) matches your high battery priority"`

### Transparent Trade-Offs
* `"Brand is Samsung (preferred: Lenovo)"`
* `"Weight (1.99 kg) is heavier than a lightweight preference (under 1.5 kg)"`
* `"Integrated graphics card may limit high-end gaming performance"`

---

## 7. No-Result Handling

If zero products satisfy the hard constraints:
* The engine returns `total_candidates = 0`.
* Provides explicit, actionable suggestions to the user (e.g., *"Consider increasing your maximum budget above ₹X"*, *"Consider reducing minimum RAM requirement below Y GB"*).
* Does **not** return invalid products that violate hard constraints.

---

## 8. Persisted Recommendation API

* `POST /api/v1/recommendations/`: Evaluates a stored `Requirement`, calculates recommendations, saves the result to PostgreSQL in `RecommendationResult`, and returns the ranked list with match scores and explanations.
* `GET /api/v1/recommendations/{recommendation_id}/`: Retrieves a previously stored recommendation result.
