import csv
import os
from decimal import Decimal
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.conf import settings
from apps.products.models import Product
from services.currency import usd_to_inr


class Command(BaseCommand):
    help = 'Imports products from a CSV file into the PostgreSQL database.'

    def add_arguments(self, parser):
        parser.add_argument(
            'csv_file',
            nargs='?',
            default='data/products.csv',
            type=str,
            help='Path to the products CSV file (default: data/products.csv)'
        )

    def handle(self, *args, **options):
        csv_file_path = options['csv_file']

        # Resolve relative paths relative to BASE_DIR or current directory
        if not os.path.isabs(csv_file_path):
            possible_path = os.path.join(settings.BASE_DIR.parent, csv_file_path)
            if os.path.exists(possible_path):
                csv_file_path = possible_path
            elif os.path.exists(os.path.join(settings.BASE_DIR, csv_file_path)):
                csv_file_path = os.path.join(settings.BASE_DIR, csv_file_path)

        if not os.path.exists(csv_file_path):
            raise CommandError(f"CSV file not found at path: {csv_file_path}")

        self.stdout.write(self.style.NOTICE(f"Starting product import from: {csv_file_path}"))

        expected_columns = {
            'product_id', 'product_name', 'brand', 'category', 'price_usd',
            'ram_gb', 'storage_gb', 'storage_type', 'processor', 'cpu_cores',
            'gpu', 'gpu_type', 'display_size_inch', 'display_resolution',
            'display_type', 'refresh_rate_hz', 'weight_kg', 'battery_wh',
            'battery_life_hours', 'operating_system', 'release_year',
            'rating', 'review_count'
        }

        total_rows = 0
        imported_count = 0
        updated_count = 0
        skipped_count = 0
        failed_count = 0
        duplicate_count = 0
        errors = []

        try:
            with open(csv_file_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)

                # Validate column headers
                file_columns = set(reader.fieldnames or [])
                missing_columns = expected_columns - file_columns
                if missing_columns:
                    raise CommandError(f"Missing required CSV columns: {', '.join(missing_columns)}")

                for row_idx, row in enumerate(reader, start=2):
                    total_rows += 1
                    product_id = row.get('product_id', '').strip()

                    if not product_id:
                        failed_count += 1
                        err = f"Row {row_idx}: Missing product_id"
                        errors.append(err)
                        self.stdout.write(self.style.WARNING(err))
                        continue

                    try:
                        # Data validation and parsing
                        product_name = row.get('product_name', '').strip()
                        brand = row.get('brand', '').strip()
                        category_segment = row.get('category', '').strip()

                        if not product_name or not brand:
                            raise ValueError("product_name and brand must not be empty")

                        price_usd = Decimal(row['price_usd'].strip())
                        if price_usd < Decimal('0.00'):
                            raise ValueError(f"price_usd must be >= 0 (got {price_usd})")

                        price_inr = Decimal(str(usd_to_inr(price_usd)))

                        ram_gb = int(row['ram_gb'].strip())
                        if ram_gb <= 0:
                            raise ValueError(f"ram_gb must be > 0 (got {ram_gb})")

                        storage_gb = int(row['storage_gb'].strip())
                        if storage_gb <= 0:
                            raise ValueError(f"storage_gb must be > 0 (got {storage_gb})")

                        display_size = Decimal(row['display_size_inch'].strip())
                        if display_size <= Decimal('0.00'):
                            raise ValueError(f"display_size_inch must be > 0 (got {display_size})")

                        weight_kg = Decimal(row['weight_kg'].strip())
                        if weight_kg <= Decimal('0.00'):
                            raise ValueError(f"weight_kg must be > 0 (got {weight_kg})")

                        rating = Decimal(row['rating'].strip())
                        if not (Decimal('0.00') <= rating <= Decimal('5.00')):
                            raise ValueError(f"rating must be between 0 and 5 (got {rating})")

                        review_count = int(row['review_count'].strip())
                        if review_count < 0:
                            raise ValueError(f"review_count must be >= 0 (got {review_count})")

                        cpu_cores = int(row['cpu_cores'].strip()) if row.get('cpu_cores', '').strip() else None
                        refresh_rate = int(row['refresh_rate_hz'].strip()) if row.get('refresh_rate_hz', '').strip() else 60
                        battery_wh = Decimal(row['battery_wh'].strip()) if row.get('battery_wh', '').strip() else None
                        battery_life = Decimal(row['battery_life_hours'].strip()) if row.get('battery_life_hours', '').strip() else None
                        release_year = int(row['release_year'].strip()) if row.get('release_year', '').strip() else None

                        defaults = {
                            'product_name': product_name,
                            'brand': brand,
                            'category': 'Laptop',
                            'product_segment': category_segment,
                            'price': price_inr,
                            'currency': 'INR',
                            'ram_gb': ram_gb,
                            'storage_gb': storage_gb,
                            'storage_type': row.get('storage_type', '').strip(),
                            'processor': row.get('processor', '').strip(),
                            'cpu_cores': cpu_cores,
                            'gpu': row.get('gpu', '').strip(),
                            'gpu_type': row.get('gpu_type', '').strip(),
                            'display_size': display_size,
                            'display_resolution': row.get('display_resolution', '').strip(),
                            'display_type': row.get('display_type', '').strip(),
                            'refresh_rate': refresh_rate,
                            'weight_kg': weight_kg,
                            'battery_wh': battery_wh,
                            'battery_life': battery_life,
                            'operating_system': row.get('operating_system', '').strip(),
                            'release_year': release_year,
                            'rating': rating,
                            'review_count': review_count,
                        }

                        with transaction.atomic():
                            obj, created = Product.objects.update_or_create(
                                product_id=product_id,
                                defaults=defaults
                            )

                        if created:
                            imported_count += 1
                        else:
                            updated_count += 1
                            duplicate_count += 1

                    except Exception as e:
                        failed_count += 1
                        err_msg = f"Row {row_idx} (ID: {product_id}): {str(e)}"
                        errors.append(err_msg)
                        self.stdout.write(self.style.WARNING(err_msg))

        except Exception as e:
            raise CommandError(f"Failed to read CSV file: {str(e)}")

        self.stdout.write("\n" + "=" * 30)
        self.stdout.write("Product Import Summary")
        self.stdout.write("=" * 30)
        self.stdout.write(f"Total rows:  {total_rows}")
        self.stdout.write(f"Imported:    {imported_count}")
        self.stdout.write(f"Updated:     {updated_count}")
        self.stdout.write(f"Skipped:     {skipped_count}")
        self.stdout.write(f"Failed:      {failed_count}")
        self.stdout.write(f"Duplicates:  {duplicate_count}")
        self.stdout.write("=" * 30)

        if failed_count > 0:
            self.stdout.write(self.style.ERROR(f"Completed with {failed_count} row errors."))
        else:
            self.stdout.write(self.style.SUCCESS("Product import completed successfully!"))
