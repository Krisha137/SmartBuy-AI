from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.products.models import Product
from apps.cart.models import Cart, CartItem
from .models import Order, OrderItem, OrderStatus


class OrdersApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Users
        self.user_a = User.objects.create_user(username='user_a', password='Password123!', email='usera@example.com')
        self.user_b = User.objects.create_user(username='user_b', password='Password123!', email='userb@example.com')

        # Product
        self.product = Product.objects.create(
            product_id='TEST-LAPTOP-100',
            product_name='Test Gaming Laptop',
            brand='TestBrand',
            price=Decimal('75000.00'),
            original_price=Decimal('85000.00'),
            currency='INR',
            category='Laptops',
            processor='Intel Core i7',
            ram_gb=16,
            storage_gb=512,
            storage_type='SSD',
            display_size=15.6,
            gpu='NVIDIA RTX 4060',
            gpu_type='Dedicated',
            weight_kg=Decimal('2.1'),
            battery_life=Decimal('6.0'),
            battery_wh=Decimal('70.0'),
            rating=4.5,
            review_count=12
        )

        self.shipping_payload = {
            'customer_name': 'John Doe',
            'email': 'john@example.com',
            'phone': '9876543210',
            'address_line_1': '123 Tech Park',
            'address_line_2': 'Building B',
            'city': 'Bengaluru',
            'state': 'Karnataka',
            'postal_code': '560001',
            'country': 'India'
        }

    def test_unauthenticated_access_denied(self):
        res_get = self.client.get('/api/v1/orders/')
        self.assertEqual(res_get.status_code, status.HTTP_401_UNAUTHORIZED)

        res_post = self.client.post('/api/v1/orders/', self.shipping_payload, format='json')
        self.assertEqual(res_post.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_order_empty_cart(self):
        self.client.force_authenticate(user=self.user_a)
        res = self.client.post('/api/v1/orders/', self.shipping_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_order_success(self):
        self.client.force_authenticate(user=self.user_a)
        cart = Cart.objects.create(user=self.user_a)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)

        res = self.client.post('/api/v1/orders/', self.shipping_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        data = res.data
        self.assertTrue(data['order_number'].startswith('ORD-'))
        self.assertEqual(data['status'], OrderStatus.CONFIRMED)
        self.assertEqual(Decimal(str(data['total_amount'])), Decimal('150000.00'))
        self.assertEqual(data['currency'], 'INR')
        self.assertEqual(len(data['items']), 1)
        self.assertEqual(data['items'][0]['product_name'], 'Test Gaming Laptop')
        self.assertEqual(data['items'][0]['quantity'], 2)

        # Verify cart was cleared
        cart.refresh_from_db()
        self.assertEqual(cart.items.count(), 0)

    def test_list_orders(self):
        self.client.force_authenticate(user=self.user_a)
        cart = Cart.objects.create(user=self.user_a)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        self.client.post('/api/v1/orders/', self.shipping_payload, format='json')

        res = self.client.get('/api/v1/orders/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_user_order_isolation(self):
        # Create order for User A
        self.client.force_authenticate(user=self.user_a)
        cart_a = Cart.objects.create(user=self.user_a)
        CartItem.objects.create(cart=cart_a, product=self.product, quantity=1)
        res_create = self.client.post('/api/v1/orders/', self.shipping_payload, format='json')
        order_number = res_create.data['order_number']

        # Try accessing as User B
        self.client.force_authenticate(user=self.user_b)
        res_detail = self.client.get(f'/api/v1/orders/{order_number}/')
        self.assertEqual(res_detail.status_code, status.HTTP_404_NOT_FOUND)

        res_list_b = self.client.get('/api/v1/orders/')
        self.assertEqual(res_list_b.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_list_b.data), 0)

    def test_historical_price_snapshot(self):
        self.client.force_authenticate(user=self.user_a)
        cart = Cart.objects.create(user=self.user_a)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        res = self.client.post('/api/v1/orders/', self.shipping_payload, format='json')
        order_number = res.data['order_number']

        # Now change product price in database
        self.product.price = Decimal('99000.00')
        self.product.save()

        # Query order details again
        res_detail = self.client.get(f'/api/v1/orders/{order_number}/')
        self.assertEqual(res_detail.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(str(res_detail.data['total_amount'])), Decimal('75000.00'))
        self.assertEqual(Decimal(str(res_detail.data['items'][0]['price'])), Decimal('75000.00'))

    def test_cancel_order_success(self):
        self.client.force_authenticate(user=self.user_a)
        cart = Cart.objects.create(user=self.user_a)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        res_create = self.client.post('/api/v1/orders/', self.shipping_payload, format='json')
        order_number = res_create.data['order_number']

        res_cancel = self.client.post(f'/api/v1/orders/{order_number}/cancel/')
        self.assertEqual(res_cancel.status_code, status.HTTP_200_OK)
        self.assertEqual(res_cancel.data['status'], OrderStatus.CANCELLED)

    def test_mobile_validation_short(self):
        self.client.force_authenticate(user=self.user_a)
        cart = Cart.objects.create(user=self.user_a)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        payload = {**self.shipping_payload, 'phone': '987654'}
        res = self.client.post('/api/v1/orders/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        details = res.data.get('error', {}).get('details', res.data)
        self.assertIn('phone', details)

    def test_mobile_validation_nine_digits(self):
        self.client.force_authenticate(user=self.user_a)
        cart = Cart.objects.create(user=self.user_a)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        payload = {**self.shipping_payload, 'phone': '987654321'}
        res = self.client.post('/api/v1/orders/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        details = res.data.get('error', {}).get('details', res.data)
        self.assertIn('phone', details)

    def test_mobile_validation_eleven_digits(self):
        self.client.force_authenticate(user=self.user_a)
        cart = Cart.objects.create(user=self.user_a)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        payload = {**self.shipping_payload, 'phone': '98765432101'}
        res = self.client.post('/api/v1/orders/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        details = res.data.get('error', {}).get('details', res.data)
        self.assertIn('phone', details)

    def test_mobile_validation_alphanumeric(self):
        self.client.force_authenticate(user=self.user_a)
        cart = Cart.objects.create(user=self.user_a)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        payload = {**self.shipping_payload, 'phone': '98abc54321'}
        res = self.client.post('/api/v1/orders/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        details = res.data.get('error', {}).get('details', res.data)
        self.assertIn('phone', details)

    def test_mobile_validation_empty(self):
        self.client.force_authenticate(user=self.user_a)
        cart = Cart.objects.create(user=self.user_a)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        payload = {**self.shipping_payload, 'phone': ''}
        res = self.client.post('/api/v1/orders/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        details = res.data.get('error', {}).get('details', res.data)
        self.assertIn('phone', details)

    def test_mobile_validation_valid_ten_digits(self):
        self.client.force_authenticate(user=self.user_a)
        cart = Cart.objects.create(user=self.user_a)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        payload = {**self.shipping_payload, 'phone': '9876543210'}
        res = self.client.post('/api/v1/orders/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
