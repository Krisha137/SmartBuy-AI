from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from apps.products.models import Product
from apps.wishlist.models import Wishlist


class WishlistTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username="user1", email="user1@example.com", password="Password123!")
        self.user2 = User.objects.create_user(username="user2", email="user2@example.com", password="Password123!")

        self.p1 = Product.objects.create(
            product_id="LAP0001",
            product_name="Dell Inspiron 15",
            brand="Dell",
            category="Laptop",
            price=Decimal("43077.00"),
            currency="INR",
            ram_gb=16,
            storage_gb=512,
            storage_type="SSD",
            processor="Intel Core i3",
            display_size=Decimal("15.60"),
            weight_kg=Decimal("1.80"),
            battery_wh=Decimal("50.0"),
            battery_life=Decimal("8.0"),
            rating=Decimal("3.80")
        )
        self.p2 = Product.objects.create(
            product_id="LAP0002",
            product_name="Apple MacBook Air",
            brand="Apple",
            category="Laptop",
            price=Decimal("126077.00"),
            currency="INR",
            ram_gb=16,
            storage_gb=512,
            storage_type="SSD",
            processor="Apple M2",
            display_size=Decimal("13.60"),
            weight_kg=Decimal("1.24"),
            battery_wh=Decimal("52.6"),
            battery_life=Decimal("15.0"),
            rating=Decimal("4.80")
        )



    def test_wishlist_unauthenticated_denied(self):
        response = self.client.get('/api/v1/wishlist/')
        self.assertEqual(response.status_code, 401)

    def test_add_to_wishlist(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post('/api/v1/wishlist/', {'product_id': 'LAP0001'}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Wishlist.objects.filter(user=self.user1).count(), 1)

    def test_add_to_wishlist_duplicate_prevention(self):
        self.client.force_authenticate(user=self.user1)
        res1 = self.client.post('/api/v1/wishlist/', {'product_id': 'LAP0001'}, format='json')
        self.assertEqual(res1.status_code, 201)

        res2 = self.client.post('/api/v1/wishlist/', {'product_id': 'LAP0001'}, format='json')
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(Wishlist.objects.filter(user=self.user1).count(), 1)

    def test_remove_from_wishlist(self):
        self.client.force_authenticate(user=self.user1)
        Wishlist.objects.create(user=self.user1, product=self.p1)
        response = self.client.delete('/api/v1/wishlist/LAP0001/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Wishlist.objects.filter(user=self.user1).count(), 0)

    def test_user_cannot_access_other_user_wishlist(self):
        Wishlist.objects.create(user=self.user1, product=self.p1)

        self.client.force_authenticate(user=self.user2)
        response = self.client.get('/api/v1/wishlist/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['items']), 0)

    def test_user_cannot_delete_other_user_wishlist(self):
        Wishlist.objects.create(user=self.user1, product=self.p1)

        self.client.force_authenticate(user=self.user2)
        response = self.client.delete('/api/v1/wishlist/LAP0001/')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Wishlist.objects.filter(user=self.user1).count(), 1)

    def test_add_invalid_product_to_wishlist(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post('/api/v1/wishlist/', {'product_id': 'LAP9999'}, format='json')
        self.assertEqual(response.status_code, 400)
