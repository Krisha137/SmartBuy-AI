from rest_framework import serializers
from apps.cart.models import Cart, CartItem
from apps.products.models import Product
from apps.products.serializers import ProductSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'line_total', 'created_at']
        read_only_fields = ['id', 'line_total', 'created_at']

    def get_line_total(self, obj):
        return obj.line_total()


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['items', 'item_count', 'subtotal', 'currency']

    def get_item_count(self, obj):
        return sum(item.quantity for item in obj.items.all())

    def get_subtotal(self, obj):
        return sum(item.line_total() for item in obj.items.all())

    def get_currency(self, obj):
        return "INR"


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.CharField(required=True)
    quantity = serializers.IntegerField(default=1, min_value=1)

    def validate_product_id(self, value):
        try:
            product = Product.objects.get(product_id=value)
            return product
        except Product.DoesNotExist:
            raise serializers.ValidationError(f"Product with ID '{value}' not found.")

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(required=True, min_value=1)

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value
