# SmartBuy AI — Data Dictionary (Phase 3: Dataset Analysis & Schema Alignment)

---

## 1. Overview

This Data Dictionary explains every field in the aligned SmartBuy AI database tables (`products`, `reviews`, and `requirements`) in clear, plain language.

---

## 2. Product Table (`products`)

The `products` table stores technical specifications, pricing, brand details, and review aggregates for laptop products.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `product_id` | Text (Primary Key) | Unique string code assigned to each laptop in the dataset (e.g., `"LAP0001"`). |
| `product_name` | Text | Full commercial product name (e.g., `"Dell Inspiron 15 (i3-1215U, 16GB/512GB)"`). |
| `brand` | Text | Manufacturer name (e.g., `"Dell"`, `"HP"`, `"Lenovo"`, `"Apple"`). |
| `category` | Text | Top-level product category classification (defaults to `"Laptop"`). |
| `product_segment` | Text | Market segment classification from dataset (e.g., `"Budget"`, `"Gaming"`, `"Ultrabook"`). |
| `price` | Decimal | Numeric selling price of the laptop in Indian Rupees (₹) (must be zero or positive). |
| `currency` | Text | Three-letter ISO code specifying price currency (defaults to `"INR"`). |
| `original_price` | Decimal | List price or MRP before discounts (optional). |
| `processor` | Text | Full original processor description string (e.g., `"Intel Core i3-1215U"`). |
| `processor_brand` | Text | Processor manufacturer name (optional; e.g., `"Intel"`, `"AMD"`, `"Apple"`). |
| `processor_model` | Text | Processor model designation (optional; e.g., `"Core i5-1235U"`). |
| `cpu_cores` | Integer | Total number of CPU processing cores (e.g., `6`, `8`, `12`, `16`, `24`). |
| `ram_gb` | Integer | Installed system memory capacity in gigabytes (e.g., `8`, `16`, `32`). |
| `storage_type` | Text | Primary storage technology (e.g., `"SSD"`). |
| `storage_gb` | Integer | Total storage drive capacity in gigabytes (e.g., `256`, `512`, `1024`, `2048`). |
| `gpu` | Text | Graphics card or graphics processor name (e.g., `"NVIDIA GeForce RTX 4060 8GB"`). |
| `gpu_type` | Text | Classification of graphics architecture (`"Integrated"` or `"Dedicated"`). |
| `display_size` | Decimal | Screen diagonal size measurement in inches (e.g., `14.00`, `15.60`). |
| `display_resolution` | Text | Screen display resolution in pixels (e.g., `"1920x1080"`, `"2560x1600"`). |
| `display_type` | Text | Screen panel display technology (e.g., `"IPS"`, `"OLED"`, `"Mini-LED"`, `"Liquid Retina"`). |
| `refresh_rate` | Integer | Display screen refresh rate in Hertz (e.g., `60`, `120`, `144`, `165`, `240`). |
| `weight_kg` | Decimal | Total laptop weight in kilograms (e.g., `1.45`, `2.50`). |
| `battery_wh` | Decimal | Battery energy rating in Watt-hours (e.g., `45.0`, `75.0`, `99.0`). |
| `battery_life` | Decimal | Estimated battery endurance in hours (e.g., `7.0`, `12.5`). |
| `operating_system` | Text | Pre-installed operating system (e.g., `"Windows 11 Home"`, `"macOS"`). |
| `release_year` | Integer | Model market release year (e.g., `2022`, `2023`, `2024`). |
| `rating` | Decimal | Average customer review rating score on a scale from `0.00` to `5.00`. |
| `review_count` | Integer | Total count of published customer reviews for this product. |
| `warranty` | Text | Terms and duration of warranty coverage (optional). |
| `product_description` | Text | Descriptive overview text highlighting product capabilities (optional). |
| `image_url` | Text (URL) | Web URL link to the product photo image asset (optional). |
| `created_at` | Timestamp | Timestamp when the product record was created. |
| `updated_at` | Timestamp | Timestamp when the product record was last updated. |

---

## 3. Review Table (`reviews`)

The `reviews` table stores individual user feedback entries associated with laptop products.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `review_id` | Text (Primary Key) | Unique string code assigned to each review (e.g., `"REV00001"`). |
| `product` | Foreign Key | Reference code identifying the target laptop (links to `products.product_id`). |
| `rating` | Decimal | Rating score assigned by the reviewer on a scale from `1.00` to `5.00` stars. |
| `review_title` | Text | Headline title of the review (e.g., `"Mixed feelings"`, `"Highly recommend"`). |
| `review_text` | Text | Full narrative body content of the review feedback. |
| `review_date` | Date | Published calendar date of the review (`YYYY-MM-DD`). |
| `verified_purchase` | Boolean | `True` if purchase was verified by retailer; otherwise `False`. |
| `helpful_votes` | Integer | Total number of helpful community votes received (e.g., `19`). |
| `created_at` | Timestamp | Timestamp when the review record was added. |

---

## 4. Requirement Table (`requirements`)

The `requirements` table records buyer preferences collected for product recommendations.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `requirement_id` | Integer (Primary Key) | Unique auto-incrementing ID. |
| `user` | Foreign Key | Reference to user account (nullable for guest users). |
| `category` | Text | Product category requested (defaults to `"Laptop"`). |
| `budget_min` | Decimal | Minimum target budget. |
| `budget_max` | Decimal | Maximum target budget. |
| `use_case` | Text | Primary user workflow (e.g., `"Gaming"`, `"Coding"`). |
| `minimum_ram` | Integer | Required minimum RAM capacity in GB. |
| `minimum_storage` | Integer | Required minimum storage capacity in GB. |
| `preferred_storage_type`| Text | Desired storage technology. |
| `battery_priority` | Text | Battery life priority level. |
| `performance_priority` | Text | Performance priority level. |
| `weight_priority` | Text | Portability / weight priority level. |
| `brand_preference` | Text | Preferred manufacturer brand. |
| `raw_user_query` | Text | Raw natural language query prompt. |
| `created_at` | Timestamp | Creation timestamp. |
