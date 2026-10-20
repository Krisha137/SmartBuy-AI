from django.urls import path
from apps.wishlist.views import WishlistListView, WishlistDetailView

urlpatterns = [
    path('wishlist/', WishlistListView.as_view(), name='wishlist-list'),
    path('wishlist/<str:product_id>/', WishlistDetailView.as_view(), name='wishlist-detail'),
]
