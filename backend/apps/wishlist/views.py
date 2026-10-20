from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.wishlist.models import Wishlist
from apps.wishlist.serializers import WishlistSerializer, AddWishlistSerializer


class WishlistListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = Wishlist.objects.filter(user=request.user)
        serializer = WishlistSerializer(items, many=True)
        return Response({"items": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AddWishlistSerializer(data=request.data)
        if not serializer.is_valid():
            first_err = list(serializer.errors.values())[0]
            if isinstance(first_err, list):
                first_err = first_err[0]
            return Response({"error": str(first_err)}, status=status.HTTP_400_BAD_REQUEST)

        product = serializer.validated_data['product_id']
        wishlist_item, created = Wishlist.objects.get_or_create(
            user=request.user,
            product=product
        )

        item_data = WishlistSerializer(wishlist_item).data
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(item_data, status=status_code)


class WishlistDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):
        try:
            item = Wishlist.objects.get(user=request.user, product__product_id=product_id)
            item.delete()
            return Response({"message": f"Product '{product_id}' removed from wishlist."}, status=status.HTTP_200_OK)
        except Wishlist.DoesNotExist:
            return Response({"detail": f"Product '{product_id}' is not in your wishlist."}, status=status.HTTP_404_NOT_FOUND)
