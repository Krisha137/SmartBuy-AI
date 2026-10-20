from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Order
from .serializers import OrderSerializer, CreateOrderSerializer
from .services import create_order_from_cart, cancel_order


class OrderListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related('items__product')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = create_order_from_cart(request.user, serializer.validated_data)
        response_serializer = OrderSerializer(order)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, order_id):
        # Support lookup by pk (id) or order_number
        if order_id.isdigit():
            return get_object_or_404(Order.objects.prefetch_related('items__product'), id=int(order_id), user=request.user)
        return get_object_or_404(Order.objects.prefetch_related('items__product'), order_number=order_id, user=request.user)

    def get(self, request, order_id):
        order = self.get_object(request, order_id)
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)


class OrderCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        if order_id.isdigit():
            order = get_object_or_404(Order, id=int(order_id), user=request.user)
        else:
            order = get_object_or_404(Order, order_number=order_id, user=request.user)

        updated_order = cancel_order(order, request.user)
        serializer = OrderSerializer(updated_order)
        return Response(serializer.data, status=status.HTTP_200_OK)
