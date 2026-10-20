from decimal import Decimal
from datetime import date
from django.test import TestCase
from rest_framework.test import APIClient
from apps.products.models import Product
from apps.reviews.models import Review, ReviewAnalysis, ReviewThemeAnalysis, ProductReviewInsight
from services.review_intelligence import (
    ReviewAnalyzer, SentimentClassifier, ThemeExtractor, InsightAggregator
)


class ReviewAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.p1 = Product.objects.create(
            product_id="LAP0001",
            product_name="Dell Inspiron 15",
            brand="Dell",
            category="Laptop",
            product_segment="Budget",
            price=Decimal("43077.00"),
            currency="INR",
            ram_gb=16,
            storage_gb=512,
            storage_type="SSD",
            processor="Intel Core i3",
            gpu="Intel UHD",
            display_size=Decimal("15.60"),
            display_resolution="1920x1080",
            weight_kg=Decimal("2.00"),
            operating_system="Windows 11",
            rating=Decimal("3.50"),
            review_count=2
        )
        self.r1 = Review.objects.create(
            review_id="REV00001",
            product=self.p1,
            rating=Decimal("3.00"),
            review_title="Mixed feelings",
            review_text="Good for basic tasks, though a few things could be better.",
            review_date=date(2026, 1, 8),
            verified_purchase=True,
            helpful_votes=19
        )
        self.r2 = Review.objects.create(
            review_id="REV00002",
            product=self.p1,
            rating=Decimal("4.00"),
            review_title="Very happy",
            review_text="Battery easily lasts a full workday.",
            review_date=date(2024, 10, 25),
            verified_purchase=True,
            helpful_votes=1
        )

    def test_get_product_reviews_valid(self):
        response = self.client.get('/api/products/LAP0001/reviews/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(len(response.data['results']), 2)

    def test_get_product_reviews_invalid_product(self):
        response = self.client.get('/api/products/INVALID_PRODUCT/reviews/')
        self.assertEqual(response.status_code, 404)

    def test_ordering_reviews(self):
        response = self.client.get('/api/products/LAP0001/reviews/?ordering=-helpful_votes')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['results'][0]['review_id'], 'REV00001')

    def test_filter_reviews_by_theme(self):
        # Create an analysis with Battery theme for r2
        analysis = ReviewAnalysis.objects.create(review=self.r2, sentiment='positive')
        ReviewThemeAnalysis.objects.create(review_analysis=analysis, theme='Battery', sentiment='positive')

        # Test filter by theme Battery
        response = self.client.get('/api/products/LAP0001/reviews/?theme=Battery')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['review_id'], 'REV00002')
        self.assertEqual(response.data['results'][0]['sentiment'], 'positive')
        self.assertEqual(len(response.data['results'][0]['themes']), 1)
        self.assertEqual(response.data['results'][0]['themes'][0]['theme'], 'Battery')

    def test_filter_reviews_by_nonexistent_theme(self):
        response = self.client.get('/api/products/LAP0001/reviews/?theme=NonexistentTheme')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 0)


class ReviewIntelligenceTests(TestCase):
    """
    Test suite for Step 8: Review Intelligence.
    """

    def setUp(self):
        self.client = APIClient()
        self.product = Product.objects.create(
            product_id="LAP0099",
            product_name="Test Gaming Laptop",
            brand="ASUS",
            category="Laptop",
            product_segment="Gaming",
            price=Decimal("95000.00"),
            currency="INR",
            ram_gb=16,
            storage_gb=1024,
            storage_type="SSD",
            processor="AMD Ryzen 7",
            gpu="NVIDIA RTX 4060",
            display_size=Decimal("15.60"),
            display_resolution="1920x1080",
            weight_kg=Decimal("2.30"),
            operating_system="Windows 11",
            rating=Decimal("4.50"),
            review_count=5
        )

    def create_test_product(self, pid, name):
        return Product.objects.create(
            product_id=pid,
            product_name=name,
            brand="Dell",
            category="Laptop",
            product_segment="Everyday",
            price=Decimal("50000.00"),
            currency="INR",
            ram_gb=16,
            storage_gb=512,
            storage_type="SSD",
            processor="Intel i5",
            gpu="Integrated",
            display_size=Decimal("14.00"),
            display_resolution="1920x1080",
            weight_kg=Decimal("1.50"),
            operating_system="Windows 11",
            rating=Decimal("4.00"),
            review_count=5
        )

    # Test 1 — Review statistics
    def test_review_statistics(self):
        Review.objects.create(
            review_id="REV_T1", product=self.product, rating=Decimal("5.00"),
            review_title="Excellent", review_text="Great performance!", verified_purchase=True, helpful_votes=10
        )
        Review.objects.create(
            review_id="REV_T2", product=self.product, rating=Decimal("4.00"),
            review_title="Good", review_text="Nice screen display.", verified_purchase=True, helpful_votes=5
        )
        Review.objects.create(
            review_id="REV_T3", product=self.product, rating=Decimal("2.00"),
            review_title="Loud fan", review_text="Fan noise is loud and gets heating.", verified_purchase=False, helpful_votes=2
        )

        analyzer = ReviewAnalyzer()
        res = analyzer.analyze_product_reviews(self.product)
        self.assertEqual(res['total_reviews'], 3)

        insight = ProductReviewInsight.objects.get(product=self.product)
        self.assertEqual(insight.total_reviews, 3)
        self.assertEqual(float(insight.average_rating), 3.67)
        self.assertEqual(insight.verified_review_count, 2)
        self.assertEqual(float(insight.verified_review_percentage), 66.67)

    # Test 2 — Sentiment classification
    def test_sentiment_classification(self):
        classifier = SentimentClassifier()
        s_pos = classifier.classify_review("Superb laptop", "Blazing fast performance and great display", 5.0)
        s_neg = classifier.classify_review("Terrible", "Poor quality, hot heating and loud noise", 1.0)
        s_neu = classifier.classify_review("Okay", "Decent for price but loud fan", 3.0)
        s_emp = classifier.classify_review("", "", 4.0)

        self.assertEqual(s_pos, "positive")
        self.assertEqual(s_neg, "negative")
        self.assertIn(s_neu, ["neutral", "negative", "positive"])
        self.assertEqual(s_emp, "empty")

    # Test 3 — Theme extraction
    def test_theme_extraction(self):
        extractor = ThemeExtractor()
        themes = extractor.extract_themes("Awesome speed", "Great performance and vibrant display, but heating is an issue.")
        theme_names = [t['theme'] for t in themes]
        self.assertIn("Performance", theme_names)
        self.assertIn("Display", theme_names)
        self.assertIn("Heating", theme_names)

    # Test 4 — Product-level aggregation
    def test_product_level_aggregation(self):
        Review.objects.create(
            review_id="REV_AG1", product=self.product, rating=Decimal("5.00"),
            review_text="Blazing fast speed and great display.", verified_purchase=True
        )
        Review.objects.create(
            review_id="REV_AG2", product=self.product, rating=Decimal("1.00"),
            review_text="Worst terrible experience bad quality.", verified_purchase=False
        )

        analyzer = ReviewAnalyzer()
        analyzer.analyze_product_reviews(self.product)

        insight = ProductReviewInsight.objects.get(product=self.product)
        total_pct = insight.positive_percentage + insight.neutral_percentage + insight.negative_percentage
        self.assertEqual(float(total_pct), 100.0)

    # Test 5 — Confidence thresholds
    def test_confidence_thresholds(self):
        p_low = self.create_test_product("P_LOW", "Low Product")
        for i in range(3):
            Review.objects.create(review_id=f"REV_L{i}", product=p_low, rating=Decimal("4.00"), review_text="Good laptop.")

        p_high = self.create_test_product("P_HIGH", "High Product")
        for i in range(21):
            Review.objects.create(review_id=f"REV_H{i}", product=p_high, rating=Decimal("4.00"), review_text="Great performance.")

        analyzer = ReviewAnalyzer()
        analyzer.analyze_product_reviews(p_low)
        analyzer.analyze_product_reviews(p_high)

        ins_low = ProductReviewInsight.objects.get(product=p_low)
        ins_high = ProductReviewInsight.objects.get(product=p_high)

        self.assertEqual(ins_low.confidence, "low")
        self.assertEqual(ins_high.confidence, "high")

    # Test 6 — Idempotent analysis
    def test_idempotent_analysis(self):
        Review.objects.create(review_id="REV_ID1", product=self.product, rating=Decimal("5.00"), review_text="Awesome battery.")
        analyzer = ReviewAnalyzer()

        r1 = analyzer.analyze_product_reviews(self.product)
        self.assertEqual(r1['analyzed'], 1)
        count1 = ReviewAnalysis.objects.filter(review__product=self.product).count()

        r2 = analyzer.analyze_product_reviews(self.product)
        self.assertEqual(r2['analyzed'], 0)
        self.assertEqual(r2['skipped'], 1)
        count2 = ReviewAnalysis.objects.filter(review__product=self.product).count()

        self.assertEqual(count1, count2)

    # Test 7 — Product with no reviews
    def test_product_with_no_reviews(self):
        p_empty = self.create_test_product("P_EMPTY", "Empty Product")
        aggregator = InsightAggregator()
        insight = aggregator.aggregate_product_insight(p_empty)

        self.assertEqual(insight.total_reviews, 0)
        self.assertEqual(insight.confidence, "low")
        self.assertEqual(insight.summary, "No review data is currently available.")

    # Test 8 — Conflicting reviews
    def test_conflicting_reviews(self):
        for i in range(3):
            Review.objects.create(review_id=f"REV_CP{i}", product=self.product, rating=Decimal("5.00"), review_text="Great battery backup.")
        for i in range(2):
            Review.objects.create(review_id=f"REV_CN{i}", product=self.product, rating=Decimal("1.00"), review_text="Battery drain issue.")

        analyzer = ReviewAnalyzer()
        analyzer.analyze_product_reviews(self.product)

        insight = ProductReviewInsight.objects.get(product=self.product)
        self.assertIn("Battery feedback is mixed.", insight.summary)

    # Test 9 — Verified purchase percentage
    def test_verified_purchase_percentage(self):
        Review.objects.create(review_id="REV_VP1", product=self.product, rating=Decimal("5.00"), review_text="Good", verified_purchase=True)
        Review.objects.create(review_id="REV_VP2", product=self.product, rating=Decimal("4.00"), review_text="Nice", verified_purchase=False)

        aggregator = InsightAggregator()
        insight = aggregator.aggregate_product_insight(self.product)

        self.assertEqual(insight.verified_review_count, 1)
        self.assertEqual(float(insight.verified_review_percentage), 50.0)

    # Test 10 — Helpful votes handling
    def test_helpful_votes_handling(self):
        r = Review.objects.create(
            review_id="REV_HV1", product=self.product, rating=Decimal("2.00"),
            review_text="Poor battery drain.", helpful_votes=150
        )
        classifier = SentimentClassifier()
        s = classifier.classify_review(r.review_title, r.review_text, float(r.rating))
        self.assertEqual(s, "negative")

    # Test 11 — Review Intelligence API
    def test_review_intelligence_api_endpoint(self):
        Review.objects.create(
            review_id="REV_API1", product=self.product, rating=Decimal("5.00"),
            review_text="Excellent laptop performance and display.", verified_purchase=True
        )
        analyzer = ReviewAnalyzer()
        analyzer.analyze_product_reviews(self.product)

        url = f"/api/v1/products/{self.product.product_id}/review-intelligence/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['product_id'], self.product.product_id)
        self.assertEqual(response.data['review_statistics']['total_reviews'], 1)
        self.assertEqual(response.data['review_statistics']['verified_review_count'], 1)
        self.assertIn('confidence', response.data)
        self.assertIn('summary', response.data)
        self.assertIn('positive_themes', response.data)
        self.assertIn('negative_themes', response.data)

    def test_review_intelligence_api_invalid_product(self):
        url = "/api/v1/products/NON_EXISTENT_ID/review-intelligence/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)
