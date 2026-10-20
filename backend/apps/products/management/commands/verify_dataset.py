from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db.models import Avg, Min, Max, Count
from apps.products.models import Product
from apps.reviews.models import Review
from services.currency import format_inr


class Command(BaseCommand):
    help = 'Verifies database data integrity and outputs dataset statistics.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Running SmartBuy AI Database Verification...\n"))

        checks_passed = True
        verification_results = []

        # 1. Product count
        prod_count = Product.objects.count()
        p1_pass = prod_count > 0
        verification_results.append(("Product Count (>0)", f"{prod_count} products", p1_pass))
        if not p1_pass:
            checks_passed = False

        # 2. Review count
        rev_count = Review.objects.count()
        p2_pass = rev_count > 0
        verification_results.append(("Review Count (>0)", f"{rev_count} reviews", p2_pass))
        if not p2_pass:
            checks_passed = False

        # 3. Unique IDs
        prod_ids_count = Product.objects.values('product_id').distinct().count()
        p3_prod_pass = (prod_ids_count == prod_count)
        verification_results.append(("Unique Product IDs", f"{prod_ids_count}/{prod_count}", p3_prod_pass))
        if not p3_prod_pass:
            checks_passed = False

        rev_ids_count = Review.objects.values('review_id').distinct().count()
        p3_rev_pass = (rev_ids_count == rev_count)
        verification_results.append(("Unique Review IDs", f"{rev_ids_count}/{rev_count}", p3_rev_pass))
        if not p3_rev_pass:
            checks_passed = False

        # 4. Orphan reviews
        valid_product_ids = set(Product.objects.values_list('product_id', flat=True))
        orphan_reviews_count = Review.objects.exclude(product_id__in=valid_product_ids).count()
        p4_pass = (orphan_reviews_count == 0)
        verification_results.append(("Orphan Reviews (0 expected)", f"{orphan_reviews_count} orphans found", p4_pass))
        if not p4_pass:
            checks_passed = False

        # 5. Invalid ratings
        invalid_prod_ratings = Product.objects.filter(rating__lt=Decimal('0.00')) | Product.objects.filter(rating__gt=Decimal('5.00'))
        p5_prod_pass = (invalid_prod_ratings.count() == 0)
        verification_results.append(("Product Ratings Bounded [0..5]", f"{invalid_prod_ratings.count()} invalid", p5_prod_pass))
        if not p5_prod_pass:
            checks_passed = False

        invalid_rev_ratings = Review.objects.filter(rating__lt=Decimal('1.00')) | Review.objects.filter(rating__gt=Decimal('5.00'))
        p5_rev_pass = (invalid_rev_ratings.count() == 0)
        verification_results.append(("Review Ratings Bounded [1..5]", f"{invalid_rev_ratings.count()} invalid", p5_rev_pass))
        if not p5_rev_pass:
            checks_passed = False

        # 6. Invalid prices
        invalid_prices = Product.objects.filter(price__lte=Decimal('0.00'))
        p6_pass = (invalid_prices.count() == 0)
        verification_results.append(("Prices Positive (>0)", f"{invalid_prices.count()} invalid", p6_pass))
        if not p6_pass:
            checks_passed = False

        # 7. Invalid RAM
        invalid_ram = Product.objects.filter(ram_gb__lte=0)
        p7_pass = (invalid_ram.count() == 0)
        verification_results.append(("RAM Positive (>0)", f"{invalid_ram.count()} invalid", p7_pass))
        if not p7_pass:
            checks_passed = False

        # 8. Invalid storage
        invalid_storage = Product.objects.filter(storage_gb__lte=0)
        p8_pass = (invalid_storage.count() == 0)
        verification_results.append(("Storage Positive (>0)", f"{invalid_storage.count()} invalid", p8_pass))
        if not p8_pass:
            checks_passed = False

        # 9. Invalid weights
        invalid_weight = Product.objects.filter(weight_kg__lte=Decimal('0.00'))
        p9_pass = (invalid_weight.count() == 0)
        verification_results.append(("Weight Positive (>0)", f"{invalid_weight.count()} invalid", p9_pass))
        if not p9_pass:
            checks_passed = False

        # 10. Product review_count consistency
        mismatch_count = 0
        actual_rev_counts = dict(Review.objects.values('product_id').annotate(c=Count('review_id')).values_list('product_id', 'c'))
        for prod in Product.objects.all():
            actual = actual_rev_counts.get(prod.product_id, 0)
            if prod.review_count != actual:
                mismatch_count += 1

        p10_pass = (mismatch_count == 0)
        verification_results.append(("Product review_count Consistency", f"{mismatch_count} mismatches", p10_pass))
        if not p10_pass:
            checks_passed = False

        # Print Verification Table
        self.stdout.write("=" * 65)
        self.stdout.write(f"{'Check Name':<38} | {'Details':<16} | {'Status':<6}")
        self.stdout.write("=" * 65)
        for name, details, status in verification_results:
            status_str = self.style.SUCCESS("PASS") if status else self.style.ERROR("FAIL")
            self.stdout.write(f"{name:<38} | {details:<16} | {status_str}")
        self.stdout.write("=" * 65)

        if checks_passed:
            self.stdout.write(self.style.SUCCESS("\nOVERALL VERIFICATION STATUS: PASS\n"))
        else:
            self.stdout.write(self.style.ERROR("\nOVERALL VERIFICATION STATUS: FAIL\n"))

        # Calculate dataset statistics directly from PostgreSQL
        if prod_count > 0:
            brands = list(Product.objects.values_list('brand', flat=True).distinct().order_by('brand'))
            segments = list(Product.objects.values_list('product_segment', flat=True).distinct().order_by('product_segment'))
            avg_prod_rating = Product.objects.aggregate(Avg('rating'))['rating__avg'] or 0.0
            avg_rev_rating = Review.objects.aggregate(Avg('rating'))['rating__avg'] or 0.0

            price_stats = Product.objects.aggregate(Min('price'), Max('price'))
            ram_stats = Product.objects.aggregate(Min('ram_gb'), Max('ram_gb'))
            storage_stats = Product.objects.aggregate(Min('storage_gb'), Max('storage_gb'))
            verified_count = Review.objects.filter(verified_purchase=True).count()
            unverified_count = rev_count - verified_count
            date_stats = Review.objects.aggregate(Min('review_date'), Max('review_date'))

            self.stdout.write("SMARTBUY AI DATASET STATISTICS")
            self.stdout.write("==============================")
            self.stdout.write(f"\nProducts:\n{prod_count}")
            self.stdout.write(f"\nReviews:\n{rev_count}")
            self.stdout.write(f"\nBrands ({len(brands)}):\n" + ", ".join(brands))
            self.stdout.write(f"\nProduct Segments ({len(segments)}):\n" + ", ".join(segments))
            self.stdout.write(f"\nAverage Product Rating:\n{avg_prod_rating:.2f} / 5.00")
            self.stdout.write(f"\nAverage Review Rating:\n{avg_rev_rating:.2f} / 5.00")
            min_p_formatted = format_inr(price_stats['price__min'], include_symbol=False)
            max_p_formatted = format_inr(price_stats['price__max'], include_symbol=False)
            self.stdout.write(f"\nPrice Range:\n{min_p_formatted} - {max_p_formatted}")
            self.stdout.write(f"\nRAM Range:\n{ram_stats['ram_gb__min']} GB - {ram_stats['ram_gb__max']} GB")
            self.stdout.write(f"\nStorage Range:\n{storage_stats['storage_gb__min']} GB - {storage_stats['storage_gb__max']} GB")
            self.stdout.write(f"\nVerified Purchases:\n{verified_count} verified ({verified_count/rev_count*100:.1f}%), {unverified_count} unverified")
            self.stdout.write(f"\nReview Date Range:\n{date_stats['review_date__min']} to {date_stats['review_date__max']}\n")
