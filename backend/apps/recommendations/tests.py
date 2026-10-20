from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from apps.products.models import Product
from apps.requirements.models import Requirement
from apps.recommendations.models import RecommendationResult
from services.recommendation_engine import RecommendationEngine


class RecommendationEngineTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create controlled test products with INR prices
        self.p1 = Product.objects.create(
            product_id="LAP_TEST_1",
            product_name="Budget Programmer Laptop",
            brand="Lenovo",
            category="Laptop",
            product_segment="Everyday",
            price=Decimal("58100.00"),  # ₹58,100 ($700 * 83)
            currency="INR",
            ram_gb=16,
            storage_gb=512,
            storage_type="SSD",
            processor="AMD Ryzen 5 7530U",
            cpu_cores=6,
            gpu="AMD Radeon 680M",
            gpu_type="Integrated",
            display_size=Decimal("15.60"),
            display_resolution="1920x1080",
            weight_kg=Decimal("1.40"),
            battery_life=Decimal("10.0"),
            operating_system="Windows 11",
            rating=Decimal("4.20"),
            review_count=10
        )

        self.p2 = Product.objects.create(
            product_id="LAP_TEST_2",
            product_name="Heavy Gaming Laptop",
            brand="ASUS",
            category="Laptop",
            product_segment="Gaming",
            price=Decimal("149400.00"),  # ₹1,49,400 ($1800 * 83)
            currency="INR",
            ram_gb=32,
            storage_gb=1024,
            storage_type="SSD",
            processor="Intel Core i7-13700H",
            cpu_cores=14,
            gpu="NVIDIA GeForce RTX 4060",
            gpu_type="Dedicated",
            display_size=Decimal("16.00"),
            display_resolution="2560x1600",
            refresh_rate=165,
            weight_kg=Decimal("2.40"),
            battery_life=Decimal("5.0"),
            operating_system="Windows 11",
            rating=Decimal("4.80"),
            review_count=15
        )

        self.p3 = Product.objects.create(
            product_id="LAP_TEST_3",
            product_name="Low RAM Budget Laptop",
            brand="Lenovo",
            category="Laptop",
            product_segment="Budget",
            price=Decimal("33200.00"),  # ₹33,200 ($400 * 83)
            currency="INR",
            ram_gb=8,
            storage_gb=256,
            storage_type="SSD",
            processor="Intel Core i3-1215U",
            cpu_cores=4,
            gpu="Intel UHD",
            gpu_type="Integrated",
            display_size=Decimal("14.00"),
            display_resolution="1920x1080",
            weight_kg=Decimal("1.60"),
            battery_life=Decimal("6.0"),
            operating_system="Windows 11",
            rating=Decimal("3.50"),
            review_count=5
        )

    def test_budget_hard_constraint_inr(self):
        req = Requirement.objects.create(
            category="Laptop",
            budget_max=Decimal("80000.00"),
            minimum_ram=16
        )
        res = RecommendationEngine.generate_recommendations(req)
        self.assertEqual(res['total_candidates'], 1)
        self.assertEqual(res['recommendations'][0]['product_id'], 'LAP_TEST_1')

    def test_ram_hard_constraint(self):
        req = Requirement.objects.create(
            category="Laptop",
            budget_max=Decimal("160000.00"),
            minimum_ram=16
        )
        res = RecommendationEngine.generate_recommendations(req)
        p_ids = [r['product_id'] for r in res['recommendations']]
        self.assertIn('LAP_TEST_1', p_ids)
        self.assertIn('LAP_TEST_2', p_ids)
        self.assertNotIn('LAP_TEST_3', p_ids)  # 8GB rejected

    def test_storage_hard_constraint(self):
        req = Requirement.objects.create(
            category="Laptop",
            budget_max=Decimal("160000.00"),
            minimum_storage=512
        )
        res = RecommendationEngine.generate_recommendations(req)
        p_ids = [r['product_id'] for r in res['recommendations']]
        self.assertIn('LAP_TEST_1', p_ids)
        self.assertIn('LAP_TEST_2', p_ids)
        self.assertNotIn('LAP_TEST_3', p_ids)  # 256GB rejected

    def test_brand_preference_bonus(self):
        req = Requirement.objects.create(
            category="Laptop",
            budget_max=Decimal("160000.00"),
            minimum_ram=16,
            brand_preference="Lenovo"
        )
        res = RecommendationEngine.generate_recommendations(req)
        self.assertEqual(res['recommendations'][0]['product_id'], 'LAP_TEST_1')
        self.assertIn("Matches your preferred brand (Lenovo)", res['recommendations'][0]['explanation']['positive'])

    def test_battery_priority_influence(self):
        req = Requirement.objects.create(
            category="Laptop",
            budget_max=Decimal("160000.00"),
            minimum_ram=16,
            battery_priority="high"
        )
        res = RecommendationEngine.generate_recommendations(req)
        self.assertEqual(res['recommendations'][0]['product_id'], 'LAP_TEST_1')

    def test_weight_priority_influence(self):
        req = Requirement.objects.create(
            category="Laptop",
            budget_max=Decimal("160000.00"),
            minimum_ram=16,
            weight_priority="high"
        )
        res = RecommendationEngine.generate_recommendations(req)
        self.assertEqual(res['recommendations'][0]['product_id'], 'LAP_TEST_1')

    def test_no_results_handling(self):
        req = Requirement.objects.create(
            category="Laptop",
            budget_max=Decimal("25000.00"),  # No laptop under ₹25,000
            minimum_ram=32
        )
        res = RecommendationEngine.generate_recommendations(req)
        self.assertEqual(res['total_candidates'], 0)
        self.assertEqual(len(res['recommendations']), 0)
        self.assertTrue(len(res['suggestions']) > 0)

    def test_score_bounded_and_deterministic(self):
        req = Requirement.objects.create(
            category="Laptop",
            budget_max=Decimal("120000.00"),
            use_case="Programming",
            minimum_ram=16,
            minimum_storage=512
        )
        res1 = RecommendationEngine.generate_recommendations(req)
        res2 = RecommendationEngine.generate_recommendations(req)

        self.assertEqual(res1['recommendations'], res2['recommendations'])
        for rec in res1['recommendations']:
            self.assertTrue(0.0 <= rec['match_score'] <= 100.0)

    def test_post_recommendations_api_valid(self):
        req = Requirement.objects.create(
            category="Laptop",
            budget_max=Decimal("80000.00"),
            minimum_ram=16
        )
        response = self.client.post('/api/v1/recommendations/', {'requirement_id': req.requirement_id, 'limit': 5}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('recommendation_id', response.data)
        self.assertEqual(response.data['total_candidates'], 1)

    def test_post_recommendations_api_invalid_req_id(self):
        response = self.client.post('/api/v1/recommendations/', {'requirement_id': 99999}, format='json')
        self.assertEqual(response.status_code, 404)

    def test_get_recommendation_detail_api(self):
        req = Requirement.objects.create(category="Laptop", budget_max=Decimal("80000.00"))
        res_post = self.client.post('/api/v1/recommendations/', {'requirement_id': req.requirement_id}, format='json')
        rec_id = res_post.data['recommendation_id']

        res_get = self.client.get(f'/api/v1/recommendations/{rec_id}/')
        self.assertEqual(res_get.status_code, 200)
        self.assertEqual(res_get.data['recommendation_id'], rec_id)
