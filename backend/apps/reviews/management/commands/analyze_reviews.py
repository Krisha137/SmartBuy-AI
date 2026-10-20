from django.core.management.base import BaseCommand
from services.review_intelligence import ReviewAnalyzer


class Command(BaseCommand):
    help = 'Precomputes review intelligence (sentiment, themes, and aggregated insights) for all laptop products in PostgreSQL.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--batch-size',
            type=int,
            default=50,
            help='Batch size for processing reviews (default: 50)'
        )
        parser.add_argument(
            '--product-id',
            type=str,
            default=None,
            help='Optional specific product_id to analyze (default: analyze all)'
        )

    def handle(self, *args, **options):
        batch_size = options['batch_size']
        product_id = options['product_id']

        analyzer = ReviewAnalyzer()

        if product_id:
            self.stdout.write(self.style.NOTICE(f"Starting review analysis for product: {product_id}"))
            from apps.products.models import Product
            try:
                product = Product.objects.get(product_id=product_id)
                res = analyzer.analyze_product_reviews(product, batch_size=batch_size)
                self.stdout.write(self.style.SUCCESS(
                    f"Product {product_id} analyzed: {res['analyzed']} analyzed, {res['skipped']} skipped, {res['failures']} failures."
                ))
            except Product.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Product '{product_id}' not found."))
            return

        self.stdout.write(self.style.NOTICE("Starting batch review intelligence analysis across all products..."))

        report = analyzer.analyze_all_products(batch_size=batch_size)

        self.stdout.write("\n" + "=" * 40)
        self.stdout.write("Review Intelligence Analysis Summary")
        self.stdout.write("=" * 40)
        self.stdout.write(f"Total Products:         {report['total_products']}")
        self.stdout.write(f"Total Reviews:          {report['total_reviews']}")
        self.stdout.write(f"Reviews Analyzed:       {report['reviews_analyzed']}")
        self.stdout.write(f"Reviews Skipped/Reused: {report['reviews_skipped']}")
        self.stdout.write(f"Analysis Failures:      {report['analysis_failures']}")
        self.stdout.write(f"Products with Insights: {report['products_with_insights']}")
        self.stdout.write("=" * 40)

        if report['analysis_failures'] > 0:
            self.stdout.write(self.style.ERROR(f"Completed with {report['analysis_failures']} analysis failures."))
        else:
            self.stdout.write(self.style.SUCCESS("Review intelligence analysis completed successfully!"))
