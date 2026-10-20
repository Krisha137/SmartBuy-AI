from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.cart.models import Cart, CartItem
from apps.cart.serializers import (
    CartSerializer,
    CartItemSerializer,
    AddToCartSerializer,
    UpdateCartItemSerializer
)


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CartItemListView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        if not serializer.is_valid():
            first_err = list(serializer.errors.values())[0]
            if isinstance(first_err, list):
                first_err = first_err[0]
            return Response({"error": str(first_err), "detail": str(first_err)}, status=status.HTTP_400_BAD_REQUEST)

        product = serializer.validated_data['product_id']
        add_quantity = serializer.validated_data['quantity']

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': add_quantity}
        )

        if not created:
            cart_item.quantity += add_quantity
            cart_item.save()

        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(CartSerializer(cart).data, status=status_code)


class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_item(self, request, item_id):
        try:
            return CartItem.objects.get(id=item_id, cart__user=request.user)
        except CartItem.DoesNotExist:
            return None

    def patch(self, request, item_id):
        item = self._get_item(request, item_id)
        if not item:
            return Response({"detail": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateCartItemSerializer(data=request.data)
        if not serializer.is_valid():
            first_err = list(serializer.errors.values())[0]
            if isinstance(first_err, list):
                first_err = first_err[0]
            return Response({"error": str(first_err), "detail": str(first_err)}, status=status.HTTP_400_BAD_REQUEST)

        item.quantity = serializer.validated_data['quantity']
        item.save()

        return Response(CartSerializer(item.cart).data, status=status.HTTP_200_OK)

    def delete(self, request, item_id):
        item = self._get_item(request, item_id)
        if not item:
            return Response({"detail": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND)

        cart = item.cart
        item.delete()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class ClearCartView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
