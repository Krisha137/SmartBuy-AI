# SmartBuy AI — Dataset Mapping (Phase 3: Dataset Analysis & Schema Alignment)

---

## 1. Overview

This document specifies the dataset analysis and schema alignment mapping between the approved CSV datasets (`data/products.csv` and `data/reviews.csv`) and the PostgreSQL / Django REST Framework data models for **SmartBuy AI**.

---

## 2. Programmatic Data Quality Findings

All 12 data quality verification checks were executed programmatically against `data/products.csv` (76 products) and `data/reviews.csv` (1,142 reviews):

| Quality Rule | Target Condition | Verification Result | Notes |
| :--- | :--- | :--- | :--- |
| **Rule 1** | Product IDs must be unique | **PASSED (True)** | 76 unique product IDs (`LAP0001` - `LAP0076`) |
| **Rule 2** | Review IDs must be unique | **PASSED (True)** | 1,142 unique review IDs (`REV00001` - `REV01142`) |
| **Rule 3** | Review `product_id` FK integrity | **PASSED (True)** | Every review maps to a valid `product_id` |
| **Rule 4** | Product ratings bounded | **PASSED (True)** | All product ratings between `0.0` and `5.0` |
| **Rule 5** | Review ratings bounded | **PASSED (True)** | All review ratings between `1` and `5` |
| **Rule 6** | Product prices positive | **PASSED (True)** | All `price_usd` > `0` |
| **Rule 7** | RAM positive | **PASSED (True)** | All `ram_gb` > `0` |
| **Rule 8** | Storage positive | **PASSED (True)** | All `storage_gb` > `0` |
| **Rule 9** | Weight positive | **PASSED (True)** | All `weight_kg` > `0` |
| **Rule 10** | Required product fields non-empty | **PASSED (True)** | No missing values in core product attributes |
| **Rule 11** | Required review fields non-empty | **PASSED (True)** | No missing values in core review attributes |
| **Rule 12** | Product `review_count` matches reviews | **PASSED (True)** | Sum of reviews per product matches `review_count` |

---

## 3. Product Dataset Mapping (`data/products.csv` → `Product` Model)

| CSV Column | Django Field | Data Type / Constraints | Transformation Required | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `product_id` | `product_id` | `CharField(max_length=50, primary_key=True)` | Direct primary key string mapping | E.g., `"LAP0001"` |
| `product_name` | `product_name` | `CharField(max_length=255)` | Direct text mapping | E.g., `"Dell Inspiron 15..."` |
| `brand` | `brand` | `CharField(max_length=100)` | Direct text mapping | E.g., `"Dell"`, `"Apple"` |
| `category` | `product_segment` | `CharField(max_length=100)` | Map dataset category to product segment | E.g., `"Budget"`, `"Gaming"` |
| *(default)* | `category` | `CharField(max_length=100, default='Laptop')` | High-level category default | Set to `"Laptop"` for MVP |
| `price_usd` | `price` | `DecimalField(max_digits=12, decimal_places=2)` | USD converted to INR (`price_usd * 83`) | Converted stored price in INR |
| *(default)* | `currency` | `CharField(max_length=3, default='INR')` | Default currency tag | Set to `"INR"` |
| `ram_gb` | `ram_gb` | `PositiveIntegerField()` | Direct numeric mapping | E.g., `16` |
| `storage_gb` | `storage_gb` | `PositiveIntegerField()` | Direct numeric mapping | E.g., `512` |
| `storage_type` | `storage_type` | `CharField(max_length=50)` | Direct text mapping | E.g., `"SSD"` |
| `processor` | `processor` | `CharField(max_length=150)` | Preserves full original string | E.g., `"Intel Core i3-1215U"` |
| `cpu_cores` | `cpu_cores` | `PositiveIntegerField(null=True, blank=True)` | NEW field mapping | E.g., `6`, `8`, `12` |
| `gpu` | `gpu` | `CharField(max_length=100)` | Direct text mapping | E.g., `"NVIDIA GeForce RTX 4060"` |
| `gpu_type` | `gpu_type` | `CharField(max_length=50, blank=True)` | NEW field mapping | E.g., `"Integrated"`, `"Dedicated"` |
| `display_size_inch` | `display_size` | `DecimalField(max_digits=4, decimal_places=2)` | Direct numeric mapping | E.g., `15.60` |
| `display_resolution` | `display_resolution` | `CharField(max_length=50)` | Direct text mapping | E.g., `"1920x1080"` |
| `display_type` | `display_type` | `CharField(max_length=50, blank=True)` | NEW field mapping | E.g., `"IPS"`, `"OLED"` |
| `refresh_rate_hz` | `refresh_rate` | `PositiveIntegerField(default=60)` | Direct numeric mapping | E.g., `60`, `120`, `144` |
| `weight_kg` | `weight_kg` | `DecimalField(max_digits=4, decimal_places=2)` | Direct numeric mapping | E.g., `1.99` |
| `battery_wh` | `battery_wh` | `DecimalField(max_digits=5, decimal_places=1, null=True)` | NEW field mapping | Watt-hour rating, e.g., `57.0` |
| `battery_life_hours` | `battery_life` | `DecimalField(max_digits=4, decimal_places=1, null=True)` | Direct numeric mapping | Hours rating, e.g., `8.2` |
| `operating_system` | `operating_system` | `CharField(max_length=100)` | Direct text mapping | E.g., `"Windows 11 Home"` |
| `release_year` | `release_year` | `PositiveIntegerField(null=True, blank=True)` | NEW field mapping | Release year, e.g., `2023` |
| `rating` | `rating` | `DecimalField(max_digits=3, decimal_places=2, default=0)` | Direct numeric rating | Scale `0.00` - `5.00` |
| `review_count` | `review_count` | `PositiveIntegerField(default=0)` | Direct count mapping | Number of reviews |

---

## 4. Review Dataset Mapping (`data/reviews.csv` → `Review` Model)

| CSV Column | Django Field | Data Type / Constraints | Transformation Required | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `review_id` | `review_id` | `CharField(max_length=50, primary_key=True)` | Direct primary key string mapping | E.g., `"REV00001"` |
| `product_id` | `product` | `ForeignKey(Product, on_delete=CASCADE)` | Foreign key string reference | Maps to `products.product_id` |
| `rating` | `rating` | `DecimalField(max_digits=3, decimal_places=2)` | Direct numeric rating | Scale `1.00` - `5.00` |
| `review_title` | `review_title` | `CharField(max_length=255, blank=True)` | NEW field mapping | E.g., `"Mixed feelings"` |
| `review_text` | `review_text` | `TextField()` | Direct text mapping | Review body content |
| `review_date` | `review_date` | `DateField(null=True, blank=True)` | Date parsing (`YYYY-MM-DD`) | E.g., `2026-01-08` |
| `verified_purchase` | `verified_purchase` | `BooleanField(default=False)` | Boolean parsing (`True`/`False`) | Verified purchase badge |
| `helpful_votes` | `helpful_votes` | `PositiveIntegerField(default=0)` | NEW field mapping | E.g., `19` |

---

## 5. Architectural & Schema Decisions

### 5.1 Currency Handling
* The original CSV dataset prices are specified in USD (`price_usd`).
* For the Indian market requirement, product prices are converted to Indian Rupees (INR / ₹) during database import using a fixed conversion rate of `1 USD = ₹83.00 INR` (`round(price_usd * 83)`).
* The stored `currency` field is set to `'INR'`. The raw source CSV `data/products.csv` preserves `price_usd` for historical data traceability.

### 5.2 Category vs. Product Segment Handling
* The broad product category for the MVP is **Laptop** (`category` = `'Laptop'`).
* The dataset column `category` contains market segments (`Budget`, `Everyday`, `Gaming`, `Premium/Professional`, `Professional`, `Ultrabook`).
* These values are preserved in a new field named `product_segment` (`CharField`), allowing precise filter capabilities without obscuring the top-level product category.

### 5.3 Processor Specification
* The dataset contains a unified `processor` string (e.g. `"Intel Core i3-1215U"`).
* A new `processor` field (`CharField(max_length=150)`) preserves the complete string supplied by the dataset.
* `processor_brand` and `processor_model` are retained as optional fields on the model for granular filtering.

### 5.4 Retained Optional / Future Fields
The following pre-existing fields were preserved as nullable/optional for future catalog expansion:
* `original_price`: For list/MRP prices and discount calculation.
* `warranty`: For vendor warranty terms.
* `product_description`: For extended narrative marketing descriptions.
* `image_url`: For product picture links.
