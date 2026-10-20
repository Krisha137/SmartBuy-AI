# SmartBuy AI — Data Import & Verification (Phase 4)

---

## 1. Overview

This document details the data import commands, validation rules, duplicate handling, transaction safety, idempotency guarantees, and data verification procedures for **SmartBuy AI** (Phase 4).

PostgreSQL serves as the **runtime source of truth**. The initial CSV datasets (`data/products.csv` and `data/reviews.csv`) are ingested into PostgreSQL via Django management commands. The application does not read CSV files during runtime operations.

---

## 2. Dataset Files

| Dataset File | Target Model | Record Count | Description |
| :--- | :--- | :--- | :--- |
| `data/products.csv` | `apps.products.models.Product` | 76 | Laptop product specs, prices, ratings |
| `data/reviews.csv` | `apps.reviews.models.Review` | 1,142 | Customer ratings, reviews, helpful votes |

---

## 3. CSV Column Mapping & Data Conversion

### 3.1 Products (`data/products.csv` → `Product` Model)

| CSV Column | Django Field | Data Type / Conversion | Default / Handling |
| :--- | :--- | :--- | :--- |
| `product_id` | `product_id` | `CharField(50, PK)` | Preserves exact ID (e.g., `"LAP0001"`) |
| `product_name` | `product_name` | `CharField(255)` | Direct text |
| `brand` | `brand` | `CharField(100)` | Direct text |
| `category` | `product_segment` | `CharField(100)` | Market segment (e.g., `"Gaming"`) |
| *(default)* | `category` | `CharField(100)` | Set to `'Laptop'` |
| `price_usd` | `price` | `DecimalField(12, 2)` | Converted to INR (`round(price_usd * 83)`) |
| *(default)* | `currency` | `CharField(3)` | Set to `'INR'` |
| `ram_gb` | `ram_gb` | `PositiveIntegerField` | Integer |
| `storage_gb` | `storage_gb` | `PositiveIntegerField` | Integer |
| `storage_type` | `storage_type` | `CharField(50)` | Direct text |
| `processor` | `processor` | `CharField(150)` | Full processor string |
| `cpu_cores` | `cpu_cores` | `PositiveIntegerField` | Integer |
| `gpu` | `gpu` | `CharField(100)` | Direct text |
| `gpu_type` | `gpu_type` | `CharField(50)` | `"Integrated"` / `"Dedicated"` |
| `display_size_inch` | `display_size` | `DecimalField(4, 2)` | Inches |
| `display_resolution` | `display_resolution` | `CharField(50)` | Direct text |
| `display_type` | `display_type` | `CharField(50)` | `"IPS"`, `"OLED"`, etc. |
| `refresh_rate_hz` | `refresh_rate` | `PositiveIntegerField` | Refresh rate in Hz |
| `weight_kg` | `weight_kg` | `DecimalField(4, 2)` | Kilograms |
| `battery_wh` | `battery_wh` | `DecimalField(5, 1)` | Watt-hours |
| `battery_life_hours` | `battery_life` | `DecimalField(4, 1)` | Hours |
| `operating_system` | `operating_system` | `CharField(100)` | Direct text |
| `release_year` | `release_year` | `PositiveIntegerField` | Year |
| `rating` | `rating` | `DecimalField(3, 2)` | Scale `0.00` - `5.00` |
| `review_count` | `review_count` | `PositiveIntegerField` | Review count |

### 3.2 Reviews (`data/reviews.csv` → `Review` Model)

| CSV Column | Django Field | Data Type / Conversion | Default / Handling |
| :--- | :--- | :--- | :--- |
| `review_id` | `review_id` | `CharField(50, PK)` | Preserves exact ID (e.g., `"REV00001"`) |
| `product_id` | `product` | `ForeignKey(Product)` | References `Product.product_id` |
| `rating` | `rating` | `DecimalField(3, 2)` | Scale `1.00` - `5.00` |
| `review_title` | `review_title` | `CharField(255)` | Review headline |
| `review_text` | `review_text` | `TextField` | Body text |
| `review_date` | `review_date` | `DateField` | Parsed `YYYY-MM-DD` |
| `verified_purchase` | `verified_purchase` | `BooleanField` | Parsed boolean |
| `helpful_votes` | `helpful_votes` | `PositiveIntegerField` | Vote count |

---

## 4. Management Commands

### 4.1 Product Import Command
```bash
python manage.py import_products data/products.csv
```

* **Validation Rules**:
  * `product_id`, `product_name`, and `brand` must not be empty.
  * `price_usd >= 0`
  * `ram_gb > 0`, `storage_gb > 0`, `display_size > 0`, `weight_kg > 0`
  * `0 <= rating <= 5`
  * `review_count >= 0`

### 4.2 Review Import Command
```bash
python manage.py import_reviews data/reviews.csv
```

* **Validation Rules**:
  * `review_id` and `review_text` must not be empty.
  * `product_id` must exist in `Product` table.
  * `1 <= rating <= 5`
  * `review_date` formatted as `YYYY-MM-DD`

### 4.3 Data Verification Command
```bash
python manage.py verify_dataset
```

* Performs 10 database integrity checks and outputs dataset statistics.

---

## 5. Idempotency & Duplicate Handling

* Both import commands use Django `update_or_create` based on primary keys (`product_id` and `review_id`).
* Running the import multiple times is **100% idempotent**:
  * First run: Creates 76 products and 1,142 reviews.
  * Subsequent runs: Updates existing records, reporting `0 created` and `0 duplicates inserted`.

---

## 6. Transaction Safety & Error Handling

* Row operations are executed inside `transaction.atomic()` blocks.
* Invalid rows are caught, logged with line numbers and IDs, recorded in the failure count, and do not crash the remaining import execution.

---

## 7. Verification Results & Example Output

```text
=================================================================
Check Name                             | Details          | Status
=================================================================
Product Count (>0)                     | 76 products      | PASS
Review Count (>0)                      | 1142 reviews     | PASS
Unique Product IDs                     | 76/76            | PASS
Unique Review IDs                      | 1142/1142        | PASS
Orphan Reviews (0 expected)            | 0 orphans found  | PASS
Product Ratings Bounded [0..5]         | 0 invalid        | PASS
Review Ratings Bounded [1..5]          | 0 invalid        | PASS
Prices Positive (>0)                   | 0 invalid        | PASS
RAM Positive (>0)                      | 0 invalid        | PASS
Storage Positive (>0)                  | 0 invalid        | PASS
Weight Positive (>0)                   | 0 invalid        | PASS
Product review_count Consistency       | 0 mismatches     | PASS
=================================================================

OVERALL VERIFICATION STATUS: PASS
```
