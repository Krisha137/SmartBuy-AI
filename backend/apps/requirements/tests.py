from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from apps.requirements.models import Requirement
from services.inr_parser import extract_inr_budget, parse_inr_expression


class RequirementAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_requirement_valid_inr(self):
        data = {
            "category": "Laptop",
            "budget_min": 50000,
            "budget_max": 80000,
            "use_case": "Programming",
            "minimum_ram": 16,
            "minimum_storage": 512,
            "preferred_storage_type": "SSD",
            "battery_priority": "high",
            "performance_priority": "high",
            "weight_priority": "medium",
            "brand_preference": "Lenovo",
            "raw_user_query": "I need a Lenovo laptop for programming under ₹80,000 with 16GB RAM and good battery."
        }
        response = self.client.post('/api/requirements/', data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('requirement_id', response.data)
        self.assertEqual(response.data['category'], 'Laptop')
        self.assertEqual(Decimal(response.data['budget_max']), Decimal('80000.00'))

    def test_create_requirement_invalid_budget(self):
        data = {
            "category": "Laptop",
            "budget_min": 100000,
            "budget_max": 50000
        }
        response = self.client.post('/api/requirements/', data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)

    def test_inr_expression_parser(self):
        self.assertEqual(parse_inr_expression("₹50,000"), 50000)
        self.assertEqual(parse_inr_expression("50000 rupees"), 50000)
        self.assertEqual(parse_inr_expression("50k"), 50000)
        self.assertEqual(parse_inr_expression("50 thousand"), 50000)
        self.assertEqual(parse_inr_expression("1 lakh"), 100000)
        self.assertEqual(parse_inr_expression("1.5 lakh"), 150000)
        self.assertEqual(parse_inr_expression("₹1,00,000"), 100000)
        self.assertEqual(parse_inr_expression("100000 INR"), 100000)

    def test_extract_inr_budget_from_natural_language(self):
        # "I need a laptop for programming under ₹80,000"
        b_min1, b_max1 = extract_inr_budget("I need a laptop for programming under ₹80,000")
        self.assertIsNone(b_min1)
        self.assertEqual(b_max1, 80000)

        # "I need a laptop under 80k"
        b_min2, b_max2 = extract_inr_budget("I need a laptop under 80k")
        self.assertIsNone(b_min2)
        self.assertEqual(b_max2, 80000)

        # "I need a gaming laptop between ₹70,000 and ₹1 lakh"
        b_min3, b_max3 = extract_inr_budget("I need a gaming laptop between ₹70,000 and ₹1 lakh")
        self.assertEqual(b_min3, 70000)
        self.assertEqual(b_max3, 100000)

        # "I need a laptop around 60k"
        b_min4, b_max4 = extract_inr_budget("I need a laptop around 60k")
        self.assertEqual(b_max4, 60000)

    def test_get_requirement_detail(self):
        req = Requirement.objects.create(
            category="Laptop",
            budget_min=Decimal("50000.00"),
            budget_max=Decimal("80000.00"),
            use_case="Coding"
        )
        response = self.client.get(f'/api/requirements/{req.requirement_id}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['requirement_id'], req.requirement_id)
