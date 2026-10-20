from django.urls import path
from .views import ProductComparisonView

urlpatterns = [
    path('products/compare/', ProductComparisonView.as_view(), name='product-compare'),
]
