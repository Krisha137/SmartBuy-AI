"""
Main Review Analyzer orchestration module for SmartBuy AI Review Intelligence.
Precomputes review-level sentiment and product-level aggregated insights.
"""

import logging
from apps.products.models import Product
from apps.reviews.models import Review, ReviewAnalysis, ReviewThemeAnalysis
from .sentiment import SentimentClassifier
from .theme_extractor import ThemeExtractor
from .aggregation import InsightAggregator

logger = logging.getLogger(__name__)


class ReviewAnalyzer:
    """
    Orchestrates batch processing and precomputation of Review Intelligence.
    Safe and idempotent for repeated runs.
    """

    def __init__(self):
        self.sentiment_classifier = SentimentClassifier()
        self.theme_extractor = ThemeExtractor()
        self.aggregator = InsightAggregator()

    def analyze_product_reviews(self, product, batch_size=50) -> dict:
        """
        Analyzes all reviews for a single product idempotently.
        """
        reviews = Review.objects.filter(product=product)
        analyzed_count = 0
        skipped_count = 0
        failure_count = 0

        for review in reviews:
            try:
                # Classify review sentiment
                sentiment = self.sentiment_classifier.classify_review(
                    review.review_title,
                    review.review_text,
                    float(review.rating)
                )

                # Create or update ReviewAnalysis idempotently
                analysis_obj, created = ReviewAnalysis.objects.update_or_create(
                    review=review,
                    defaults={'sentiment': sentiment}
                )

                # Extract theme mentions
                themes = self.theme_extractor.extract_themes(
                    review.review_title,
                    review.review_text
                )

                # Delete old themes to maintain idempotency
                ReviewThemeAnalysis.objects.filter(review_analysis=analysis_obj).delete()

                # Bulk create theme mentions
                theme_objs = [
                    ReviewThemeAnalysis(
                        review_analysis=analysis_obj,
                        theme=t['theme'],
                        sentiment=t['sentiment']
                    )
                    for t in themes
                ]
                if theme_objs:
                    ReviewThemeAnalysis.objects.bulk_create(theme_objs, ignore_conflicts=True)

                if created:
                    analyzed_count += 1
                else:
                    skipped_count += 1

            except Exception as e:
                logger.error(f"Error analyzing review {review.review_id}: {e}")
                failure_count += 1

        # Aggregate product-level insight
        insight = self.aggregator.aggregate_product_insight(product)

        return {
            "product_id": product.product_id,
            "total_reviews": reviews.count(),
            "analyzed": analyzed_count,
            "skipped": skipped_count,
            "failures": failure_count,
            "insight_generated": bool(insight)
        }

    def analyze_all_products(self, batch_size=50) -> dict:
        """
        Analyzes reviews across all 76 products in PostgreSQL.
        """
        products = Product.objects.all()
        total_products = products.count()
        total_reviews = Review.objects.count()

        total_analyzed = 0
        total_skipped = 0
        total_failures = 0
        products_with_insights = 0

        for product in products:
            res = self.analyze_product_reviews(product, batch_size=batch_size)
            total_analyzed += res["analyzed"]
            total_skipped += res["skipped"]
            total_failures += res["failures"]
            if res["insight_generated"]:
                products_with_insights += 1

        return {
            "total_products": total_products,
            "total_reviews": total_reviews,
            "reviews_analyzed": total_analyzed,
            "reviews_skipped": total_skipped,
            "analysis_failures": total_failures,
            "products_with_insights": products_with_insights
        }
