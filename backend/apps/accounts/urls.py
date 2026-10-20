from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.accounts.views import (
    RegisterView,
    LoginView,
    CurrentUserView
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/me/', CurrentUserView.as_view(), name='auth-me'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]
