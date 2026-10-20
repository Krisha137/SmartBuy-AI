from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from apps.products.models import Product
from apps.cart.models import Cart, CartItem


class CartTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username="user1", email="user1@example.com", password="Password123!")
        self.user2 = User.objects.create_user(username="user2", email="user2@example.com", password="Password123!")

        self.p1 = Product.objects.create(
            product_id="LAP0001",
            product_name="Dell Inspiron 15",
            brand="Dell",
            category="Laptop",
            price=Decimal("40000.00"),
            currency="INR",
            ram_gb=16,
            storage_gb=512,
            storage_type="SSD",
            display_size=Decimal("15.60"),
            weight_kg=Decimal("1.80"),
            battery_wh=Decimal("50.0"),
            battery_life=Decimal("8.0")
        )
        self.p2 = Product.objects.create(
            product_id="LAP0002",
            product_name="Lenovo IdeaPad 5",
            brand="Lenovo",
            category="Laptop",
            price=Decimal("70000.00"),
            currency="INR",
            ram_gb=16,
            storage_gb=1024,
            storage_type="SSD",
            display_size=Decimal("15.60"),
            weight_kg=Decimal("1.60"),
            battery_wh=Decimal("55.0"),
            battery_life=Decimal("9.0")
        )



    def test_cart_unauthenticated_denied(self):
        response = self.client.get('/api/v1/cart/')
        self.assertEqual(response.status_code, 401)

    def test_add_item_to_cart(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post('/api/v1/cart/items/', {'product_id': 'LAP0001', 'quantity': 1}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['item_count'], 1)
        self.assertEqual(response.data['subtotal'], 40000)

    def test_add_same_item_twice_increments_quantity(self):
        self.client.force_authenticate(user=self.user1)
        self.client.post('/api/v1/cart/items/', {'product_id': 'LAP0001', 'quantity': 1}, format='json')
        res2 = self.client.post('/api/v1/cart/items/', {'product_id': 'LAP0001', 'quantity': 2}, format='json')
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.data['item_count'], 3)
        self.assertEqual(res2.data['subtotal'], 120000)
        self.assertEqual(CartItem.objects.filter(cart__user=self.user1).count(), 1)

    def test_update_cart_item_quantity(self):
        self.client.force_authenticate(user=self.user1)
        self.client.post('/api/v1/cart/items/', {'product_id': 'LAP0001', 'quantity': 1}, format='json')
        item = CartItem.objects.get(cart__user=self.user1, product=self.p1)

        response = self.client.patch(f'/api/v1/cart/items/{item.id}/', {'quantity': 3}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['item_count'], 3)
        self.assertEqual(response.data['subtotal'], 120000)

    def test_update_quantity_less_than_1_rejected(self):
        self.client.force_authenticate(user=self.user1)
        self.client.post('/api/v1/cart/items/', {'product_id': 'LAP0001', 'quantity': 1}, format='json')
        item = CartItem.objects.get(cart__user=self.user1, product=self.p1)

        response = self.client.patch(f'/api/v1/cart/items/{item.id}/', {'quantity': 0}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_remove_cart_item(self):
        self.client.force_authenticate(user=self.user1)
        self.client.post('/api/v1/cart/items/', {'product_id': 'LAP0001', 'quantity': 1}, format='json')
        item = CartItem.objects.get(cart__user=self.user1, product=self.p1)

        response = self.client.delete(f'/api/v1/cart/items/{item.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['item_count'], 0)

    def test_clear_cart(self):
        self.client.force_authenticate(user=self.user1)
        self.client.post('/api/v1/cart/items/', {'product_id': 'LAP0001', 'quantity': 1}, format='json')
        self.client.post('/api/v1/cart/items/', {'product_id': 'LAP0002', 'quantity': 2}, format='json')

        response = self.client.delete('/api/v1/cart/clear/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['item_count'], 0)
        self.assertEqual(response.data['subtotal'], 0)

    def test_cart_subtotal_and_line_totals_calculation(self):
        self.client.force_authenticate(user=self.user1)
        self.client.post('/api/v1/cart/items/', {'product_id': 'LAP0001', 'quantity': 2}, format='json')  # 40k * 2 = 80k
        res = self.client.post('/api/v1/cart/items/', {'product_id': 'LAP0002', 'quantity': 1}, format='json')  # 70k * 1 = 70k
        self.assertEqual(res.data['subtotal'], 150000)
        self.assertEqual(res.data['currency'], 'INR')

    def test_user_cannot_access_other_user_cart(self):
        self.client.force_authenticate(user=self.user1)
        self.client.post('/api/v1/cart/items/', {'product_id': 'LAP0001', 'quantity': 1}, format='json')

        self.client.force_authenticate(user=self.user2)
        response = self.client.get('/api/v1/cart/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['item_count'], 0)
        self.assertEqual(response.data['subtotal'], 0)

    def test_user_cannot_modify_other_user_cart_item(self):
        self.client.force_authenticate(user=self.user1)
        self.client.post('/api/v1/cart/items/', {'product_id': 'LAP0001', 'quantity': 1}, format='json')
        user1_item = CartItem.objects.get(cart__user=self.user1, product=self.p1)

        self.client.force_authenticate(user=self.user2)
        response = self.client.patch(f'/api/v1/cart/items/{user1_item.id}/', {'quantity': 5}, format='json')
        self.assertEqual(response.status_code, 404)

        user1_item.refresh_from_db()
        self.assertEqual(user1_item.quantity, 1)

    def test_add_invalid_product_to_cart(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post('/api/v1/cart/items/', {'product_id': 'LAP9999', 'quantity': 1}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_client_supplied_price_is_ignored(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(
            '/api/v1/cart/items/',
            {'product_id': 'LAP0001', 'quantity': 1, 'price': 1.00, 'unit_price': 1.00},
            format='json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Decimal(str(response.data['subtotal'])), Decimal('40000.00'))

