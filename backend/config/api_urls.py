from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.products.views import (
    ProductViewSet,
    CategoryListView,
    ProductSegmentListView,
    BrandListView
)
from apps.reviews.views import ProductReviewListView
from apps.requirements.views import RequirementViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'requirements', RequirementViewSet, basename='requirement')

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('product-segments/', ProductSegmentListView.as_view(), name='product-segment-list'),
    path('brands/', BrandListView.as_view(), name='brand-list'),
    path('', include('apps.accounts.urls')),
    path('', include('apps.wishlist.urls')),
    path('', include('apps.cart.urls')),
    path('', include('apps.orders.urls')),
    path('', include('apps.reviews.urls')),
    path('', include('apps.recommendations.urls')),
    path('', include('apps.ai.urls')),
    path('', include('apps.comparisons.urls')),
    path('', include(router.urls)),
]

