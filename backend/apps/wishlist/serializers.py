from rest_framework import serializers
from apps.wishlist.models import Wishlist
from apps.products.models import Product
from apps.products.serializers import ProductSerializer


class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'created_at']
        read_only_fields = ['id', 'created_at']


class AddWishlistSerializer(serializers.Serializer):
    product_id = serializers.CharField(required=True)

    def validate_product_id(self, value):
        try:
            product = Product.objects.get(product_id=value)
            return product
        except Product.DoesNotExist:
            raise serializers.ValidationError(f"Product with ID '{value}' not found.")
