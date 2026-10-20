from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from django.contrib.auth.models import User
from apps.products.models import Product
from apps.requirements.models import Requirement
from apps.reviews.models import Review, ProductReviewInsight
from services.review_intelligence import ReviewAnalyzer
from services.comparison import ProductComparator


class ProductComparisonTests(TestCase):
    """
    Test suite for Step 9: Product Comparison System.
    """

    def setUp(self):
        self.client = APIClient()
        self.compare_url = reverse('product-compare')

        # Create 4 test laptop products in PostgreSQL
        self.p1 = Product.objects.create(
            product_id="LAP0023",
            product_name="Lenovo IdeaPad 5 (7530U, 16GB/1024GB)",
            brand="Lenovo",
            category="Laptop",
            product_segment="Everyday",
            price=Decimal("77107.00"),
            currency="INR",
            ram_gb=16,
            storage_gb=1024,
            storage_type="SSD",
            processor="AMD Ryzen 5 7530U",
            cpu_cores=6,
            gpu="Intel Iris Xe Graphics",
            gpu_type="Integrated",
            display_size=Decimal("14.00"),
            display_resolution="1920x1200",
            display_type="IPS",
            refresh_rate=60,
            weight_kg=Decimal("1.54"),
            battery_wh=Decimal("50.0"),
            battery_life=Decimal("7.4"),
            operating_system="Windows 11 Home",
            release_year=2023,
            rating=Decimal("3.80"),
            review_count=17
        )

        self.p2 = Product.objects.create(
            product_id="LAP0068",
            product_name="HP Pavilion 14 (i5-1335U, 16GB/512GB)",
            brand="HP",
            category="Laptop",
            product_segment="Everyday",
            price=Decimal("66317.00"),
            currency="INR",
            ram_gb=16,
            storage_gb=512,
            storage_type="SSD",
            processor="Intel Core i5-1335U",
            cpu_cores=10,
            gpu="Intel Iris Xe Graphics",
            gpu_type="Integrated",
            display_size=Decimal("14.00"),
            display_resolution="1920x1080",
            display_type="IPS",
            refresh_rate=60,
            weight_kg=Decimal("1.41"),
            battery_wh=Decimal("43.0"),
            battery_life=Decimal("6.5"),
            operating_system="Windows 11 Home",
            release_year=2023,
            rating=Decimal("4.10"),
            review_count=12
        )

        self.p3 = Product.objects.create(
            product_id="LAP0052",
            product_name="Apple MacBook Air 13 (Apple M3, 16GB/512GB)",
            brand="Apple",
            category="Laptop",
            product_segment="Ultrabook",
            price=Decimal("126077.00"),
            currency="INR",
            ram_gb=16,
            storage_gb=512,
            storage_type="SSD",
            processor="Apple M3",
            cpu_cores=8,
            gpu="Apple M3 10-core GPU",
            gpu_type="Integrated",
            display_size=Decimal("13.60"),
            display_resolution="2560x1664",
            display_type="Liquid Retina",
            refresh_rate=60,
            weight_kg=Decimal("1.24"),
            battery_wh=Decimal("52.6"),
            battery_life=Decimal("15.0"),
            operating_system="macOS",
            release_year=2023,
            rating=Decimal("4.90"),
            review_count=14
        )

        self.p4 = Product.objects.create(
            product_id="LAP0015",
            product_name="ASUS ROG Strix G16 (i7-13650HX, 32GB/1024GB)",
            brand="ASUS",
            category="Laptop",
            product_segment="Gaming",
            price=Decimal("149400.00"),
            currency="INR",
            ram_gb=32,
            storage_gb=1024,
            storage_type="SSD",
            processor="Intel Core i7-13650HX",
            cpu_cores=14,
            gpu="NVIDIA GeForce RTX 4060",
            gpu_type="Dedicated",
            display_size=Decimal("16.00"),
            display_resolution="2560x1600",
            display_type="IPS",
            refresh_rate=165,
            weight_kg=Decimal("2.50"),
            battery_wh=Decimal("90.0"),
            battery_life=Decimal("5.0"),
            operating_system="Windows 11 Home",
            release_year=2023,
            rating=Decimal("4.70"),
            review_count=25
        )

        # Precompute Review Intelligence for p1
        Review.objects.create(
            review_id="REV_CMP1", product=self.p1, rating=Decimal("5.00"),
            review_text="Great performance and screen display!", verified_purchase=True
        )
        ReviewAnalyzer().analyze_product_reviews(self.p1)

        # Create sample requirement for fit tests
        self.requirement = Requirement.objects.create(
            category="Laptop",
            budget_max=Decimal("80000.00"),
            use_case="Programming",
            minimum_ram=16,
            minimum_storage=512,
            preferred_storage_type="SSD"
        )

    # Test 1 — Two product comparison
    def test_two_product_comparison(self):
        payload = {"product_ids": ["LAP0023", "LAP0068"]}
        response = self.client.post(self.compare_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['products']), 2)
        self.assertIn("specifications_matrix", response.data)
        self.assertIn("differences", response.data)
        self.assertIn("trade_offs", response.data)

    # Test 2 — Four product comparison
    def test_four_product_comparison(self):
        payload = {"product_ids": ["LAP0023", "LAP0068", "LAP0052", "LAP0015"]}
        response = self.client.post(self.compare_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['products']), 4)

    # Test 3 — One product validation (min 2 required)
    def test_one_product_validation(self):
        payload = {"product_ids": ["LAP0023"]}
        response = self.client.post(self.compare_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # Test 4 — Five products validation (max 4 allowed)
    def test_five_product_validation(self):
        payload = {"product_ids": ["LAP0023", "LAP0068", "LAP0052", "LAP0015", "LAP0099"]}
        response = self.client.post(self.compare_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # Test 5 — Duplicate product IDs validation
    def test_duplicate_product_ids(self):
        payload = {"product_ids": ["LAP0023", "LAP0023"]}
        response = self.client.post(self.compare_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # Test 6 — Invalid product ID (404)
    def test_invalid_product_id(self):
        payload = {"product_ids": ["LAP0023", "LAP9999"]}
        response = self.client.post(self.compare_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # Test 7 — INR price comparison formatting
    def test_inr_price_comparison(self):
        payload = {"product_ids": ["LAP0023", "LAP0068"]}
        response = self.client.post(self.compare_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        p1_data = next(p for p in response.data['products'] if p['product_id'] == "LAP0023")
        self.assertEqual(p1_data['currency'], "INR")
        self.assertEqual(p1_data['price'], 77107)
        self.assertIn("₹", p1_data['price_formatted'])

    # Test 8 — Missing product specification handling
    def test_missing_product_specification(self):
        p_missing = Product.objects.create(
            product_id="LAP0088",
            product_name="Incomplete Laptop",
            brand="Generic",
            category="Laptop",
            price=Decimal("30000.00"),
            currency="INR",
            ram_gb=8,
            storage_gb=256,
            storage_type="SSD",
            processor="Celeron",
            gpu="Integrated",
            display_size=Decimal("14.00"),
            display_resolution="1366x768",
            weight_kg=Decimal("1.80"),
            operating_system="DOS",
            battery_wh=None,   # Null optional field
            battery_life=None  # Null optional field
        )
        payload = {"product_ids": ["LAP0023", "LAP0088"]}
        response = self.client.post(self.compare_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        b_data = response.data['specifications_matrix']['battery']['LAP0088']
        self.assertIsNone(b_data['battery_wh'])
        self.assertIsNone(b_data['battery_life'])

    # Test 9 — Review intelligence integration
    def test_review_intelligence_integration(self):
        payload = {"product_ids": ["LAP0023", "LAP0068"]}
        response = self.client.post(self.compare_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("LAP0023", response.data['review_intelligence'])
        ri = response.data['review_intelligence']['LAP0023']
        self.assertIn("review_statistics", ri)
        self.assertIn("summary", ri)

    # Test 10 — Requirement integration (valid requirement_id)
    def test_requirement_fit_integration(self):
        payload = {
            "product_ids": ["LAP0023", "LAP0068"],
            "requirement_id": self.requirement.requirement_id
        }
        response = self.client.post(self.compare_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data['recommendation_fit'])
        self.assertIn("LAP0023", response.data['recommendation_fit'])
        fit = response.data['recommendation_fit']['LAP0023']
        self.assertIn("score", fit)
        self.assertTrue(fit['hard_constraints']['budget_match'])

    # Test 11 — No requirement (recommendation_fit == null)
    def test_no_requirement_fit(self):
        payload = {"product_ids": ["LAP0023", "LAP0068"]}
        response = self.client.post(self.compare_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data['recommendation_fit'])

    # Test 12 — Differences & Trade-offs analysis
    def test_tradeoffs_and_differences(self):
        payload = {"product_ids": ["LAP0023", "LAP0068"]}
        response = self.client.post(self.compare_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        diffs = response.data['differences']
        self.assertTrue(diffs['has_differing_specs'])
        self.assertIsNotNone(diffs['price_difference'])

        tradeoffs = response.data['trade_offs']
        self.assertIn("LAP0023", tradeoffs)
        self.assertIn("LAP0068", tradeoffs)

    # Test 13 — Security: Unauthorized user cannot access another user's saved requirement comparison
    def test_unauthorized_user_cannot_access_another_users_requirement(self):
        user1 = User.objects.create_user(username='compare_user1', password='pass123user')
        user2 = User.objects.create_user(username='compare_user2', password='pass123user')

        user1_req = Requirement.objects.create(
            user=user1,
            category='Laptop',
            budget_min=Decimal('50000.00'),
            budget_max=Decimal('90000.00'),
            use_case='Programming'
        )

        payload = {
            "product_ids": ["LAP0023", "LAP0068"],
            "requirement_id": user1_req.requirement_id
        }

        # 1. User 2 attempting to access User 1's requirement -> 403 Forbidden
        self.client.force_authenticate(user=user2)
        res_forbidden = self.client.post(self.compare_url, payload, format='json')
        self.assertEqual(res_forbidden.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(res_forbidden.data['error']['code'], 'FORBIDDEN')

        # 2. Unauthenticated guest attempting to access User 1's requirement -> 401 Unauthorized
        self.client.force_authenticate(user=None)
        res_unauth = self.client.post(self.compare_url, payload, format='json')
        self.assertEqual(res_unauth.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(res_unauth.data['error']['code'], 'UNAUTHORIZED')

        # 3. Owner User 1 accessing own requirement -> 200 OK
        self.client.force_authenticate(user=user1)
        res_ok = self.client.post(self.compare_url, payload, format='json')
        self.assertEqual(res_ok.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(res_ok.data['recommendation_fit'])

    # Test 14 — Security: Nonexistent requirement_id returns 404
    def test_nonexistent_requirement_id_returns_404(self):
        payload = {
            "product_ids": ["LAP0023", "LAP0068"],
            "requirement_id": 999999
        }
        response = self.client.post(self.compare_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
