"""
SmartBuy AI — URL Configuration
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # API v1 routes will be added here as apps are implemented
    # path('api/v1/', include('apps.accounts.urls')),
    # path('api/v1/', include('apps.products.urls')),
]
