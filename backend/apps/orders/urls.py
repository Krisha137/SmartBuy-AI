from django.urls import path
from .views import OrderListCreateView, OrderDetailView, OrderCancelView

urlpatterns = [
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<str:order_id>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<str:order_id>/cancel/', OrderCancelView.as_view(), name='order-cancel'),
]
