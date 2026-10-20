from django.urls import path
from .views import ProductReviewListView, ProductReviewIntelligenceView

urlpatterns = [
    path('products/<str:product_id>/reviews/', ProductReviewListView.as_view(), name='product-reviews-list'),
    path('products/<str:product_id>/review-intelligence/', ProductReviewIntelligenceView.as_view(), name='product-review-intelligence'),
]
