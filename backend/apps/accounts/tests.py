from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status


class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="SecurePassword123"
        )

    def test_register_success(self):
        payload = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "Password123!",
            "password_confirm": "Password123!"
        }
        response = self.client.post('/api/v1/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'newuser')
        self.assertNotIn('password', response.data['user'])

    def test_register_duplicate_username(self):
        payload = {
            "username": "testuser",
            "email": "another@example.com",
            "password": "Password123!",
            "password_confirm": "Password123!"
        }
        response = self.client.post('/api/v1/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        payload = {
            "username": "uniqueuser",
            "email": "test@example.com",
            "password": "Password123!",
            "password_confirm": "Password123!"
        }
        response = self.client.post('/api/v1/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_password_mismatch(self):
        payload = {
            "username": "mismatchuser",
            "email": "mismatch@example.com",
            "password": "Password123!",
            "password_confirm": "DifferentPassword!"
        }
        response = self.client.post('/api/v1/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_short_password(self):
        payload = {
            "username": "shortuser",
            "email": "short@example.com",
            "password": "123",
            "password_confirm": "123"
        }
        response = self.client.post('/api/v1/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_invalid_email(self):
        payload = {
            "username": "bademailuser",
            "email": "notanemail",
            "password": "Password123!",
            "password_confirm": "Password123!"
        }
        response = self.client.post('/api/v1/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_fields(self):
        payload = {
            "username": "incompleteuser"
        }
        response = self.client.post('/api/v1/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        payload = {
            "username": "testuser",
            "password": "SecurePassword123"
        }
        response = self.client.post('/api/v1/auth/login/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_invalid_credentials(self):
        payload = {
            "username": "testuser",
            "password": "WrongPassword"
        }
        response = self.client.post('/api/v1/auth/login/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_current_user_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')

    def test_current_user_unauthenticated(self):
        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_invalid_jwt_header_rejected(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid.jwt.token')
        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        login_res = self.client.post('/api/v1/auth/login/', {
            "username": "testuser",
            "password": "SecurePassword123"
        }, format='json')
        refresh_token = login_res.data['refresh']

        response = self.client.post('/api/v1/auth/token/refresh/', {
            "refresh": refresh_token
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_password_is_hashed_never_plain_text(self):
        user = User.objects.get(username="testuser")
        self.assertNotEqual(user.password, "SecurePassword123")
        self.assertTrue(user.check_password("SecurePassword123"))
        self.assertFalse(user.check_password("WrongPassword"))

    def test_current_user_patch_profile(self):
        login_res = self.client.post('/api/v1/auth/login/', {
            "username": "testuser",
            "password": "SecurePassword123"
        }, format='json')
        access_token = login_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        patch_res = self.client.patch('/api/v1/auth/me/', {
            "first_name": "Test",
            "last_name": "User"
        }, format='json')
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data['first_name'], 'Test')
        self.assertEqual(patch_res.data['last_name'], 'User')
        self.assertEqual(patch_res.data['full_name'], 'Test User')
