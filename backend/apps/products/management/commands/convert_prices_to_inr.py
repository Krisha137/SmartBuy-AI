from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.products.models import Product
from services.currency import USD_TO_INR_RATE, usd_to_inr


class Command(BaseCommand):
    help = 'Idempotently converts stored Product prices from USD to INR (1 USD = 83 INR).'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting database currency migration (USD -> INR)..."))

        products = Product.objects.all()
        total_count = len(products)
        converted_count = 0
        already_inr_count = 0

        with transaction.atomic():
            for p in products:
                if p.currency != 'INR':
                    # Convert USD to INR
                    old_price_usd = p.price
                    new_price_inr = Decimal(str(usd_to_inr(old_price_usd)))
                    p.price = new_price_inr

                    if p.original_price is not None:
                        p.original_price = Decimal(str(usd_to_inr(p.original_price)))

                    p.currency = 'INR'
                    p.save()
                    converted_count += 1
                else:
                    already_inr_count += 1

        self.stdout.write("=" * 45)
        self.stdout.write("Currency Migration Summary")
        self.stdout.write("=" * 45)
        self.stdout.write(f"Total Products:       {total_count}")
        self.stdout.write(f"Converted to INR:     {converted_count}")
        self.stdout.write(f"Already INR (Skipped): {already_inr_count}")
        self.stdout.write("=" * 45)
        self.stdout.write(self.style.SUCCESS("Database currency migration completed successfully!"))
