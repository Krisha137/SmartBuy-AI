from django.urls import path
from apps.cart.views import (
    CartView,
    CartItemListView,
    CartItemDetailView,
    ClearCartView
)

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart-detail'),
    path('cart/items/', CartItemListView.as_view(), name='cart-item-list'),
    path('cart/items/<int:item_id>/', CartItemDetailView.as_view(), name='cart-item-detail'),
    path('cart/clear/', ClearCartView.as_view(), name='cart-clear'),
]
