import csv
import os
from datetime import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.conf import settings
from apps.products.models import Product
from apps.reviews.models import Review


class Command(BaseCommand):
    help = 'Imports customer reviews from a CSV file into the PostgreSQL database.'

    def add_arguments(self, parser):
        parser.add_argument(
            'csv_file',
            nargs='?',
            default='data/reviews.csv',
            type=str,
            help='Path to the reviews CSV file (default: data/reviews.csv)'
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

        self.stdout.write(self.style.NOTICE(f"Starting review import from: {csv_file_path}"))

        expected_columns = {
            'review_id', 'product_id', 'rating', 'review_title',
            'review_text', 'review_date', 'verified_purchase', 'helpful_votes'
        }

        total_rows = 0
        imported_count = 0
        updated_count = 0
        skipped_count = 0
        failed_count = 0
        duplicate_count = 0
        errors = []

        # Cache product IDs for quick validation
        existing_product_ids = set(Product.objects.values_list('product_id', flat=True))

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
                    review_id = row.get('review_id', '').strip()
                    product_id = row.get('product_id', '').strip()

                    if not review_id:
                        failed_count += 1
                        err = f"Row {row_idx}: Missing review_id"
                        errors.append(err)
                        self.stdout.write(self.style.WARNING(err))
                        continue

                    if not product_id or product_id not in existing_product_ids:
                        failed_count += 1
                        err = f"Row {row_idx} (ID: {review_id}): Product ID '{product_id}' does not exist in Product table"
                        errors.append(err)
                        self.stdout.write(self.style.WARNING(err))
                        continue

                    try:
                        rating_val = Decimal(row['rating'].strip())
                        if not (Decimal('1.00') <= rating_val <= Decimal('5.00')):
                            raise ValueError(f"rating must be between 1 and 5 (got {rating_val})")

                        review_text = row.get('review_text', '').strip()
                        if not review_text:
                            raise ValueError("review_text must not be empty")

                        review_title = row.get('review_title', '').strip()

                        # Parse date
                        review_date = None
                        raw_date = row.get('review_date', '').strip()
                        if raw_date:
                            review_date = datetime.strptime(raw_date, '%Y-%m-%d').date()

                        # Parse boolean verified_purchase
                        raw_vp = str(row.get('verified_purchase', '')).strip().lower()
                        verified_purchase = raw_vp in ('true', '1', 't', 'yes')

                        # Parse helpful_votes
                        helpful_votes = 0
                        raw_hv = row.get('helpful_votes', '').strip()
                        if raw_hv:
                            helpful_votes = max(0, int(raw_hv))

                        defaults = {
                            'product_id': product_id,
                            'rating': rating_val,
                            'review_title': review_title,
                            'review_text': review_text,
                            'review_date': review_date,
                            'verified_purchase': verified_purchase,
                            'helpful_votes': helpful_votes,
                        }

                        with transaction.atomic():
                            obj, created = Review.objects.update_or_create(
                                review_id=review_id,
                                defaults=defaults
                            )

                        if created:
                            imported_count += 1
                        else:
                            updated_count += 1
                            duplicate_count += 1

                    except Exception as e:
                        failed_count += 1
                        err_msg = f"Row {row_idx} (ID: {review_id}): {str(e)}"
                        errors.append(err_msg)
                        self.stdout.write(self.style.WARNING(err_msg))

        except Exception as e:
            raise CommandError(f"Failed to read CSV file: {str(e)}")

        self.stdout.write("\n" + "=" * 30)
        self.stdout.write("Review Import Summary")
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
            self.stdout.write(self.style.SUCCESS("Review import completed successfully!"))
