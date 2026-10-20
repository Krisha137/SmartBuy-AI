from rest_framework import serializers
from .models import Order, OrderItem, OrderStatus


class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product_id',
            'product_name',
            'image_url',
            'price',
            'quantity',
            'line_total'
        ]

    def get_product_id(self, obj):
        return obj.product.product_id if obj.product else None

    def get_image_url(self, obj):
        return obj.product.image_url if obj.product else None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    item_count = serializers.IntegerField(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'status',
            'subtotal',
            'total_amount',
            'currency',
            'customer_name',
            'email',
            'phone',
            'address_line_1',
            'address_line_2',
            'city',
            'state',
            'postal_code',
            'country',
            'items',
            'item_count',
            'can_cancel',
            'created_at',
            'updated_at'
        ]


class CreateOrderSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=255, required=True)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(max_length=30, required=True)
    address_line_1 = serializers.CharField(max_length=255, required=True)
    address_line_2 = serializers.CharField(max_length=255, required=False, allow_blank=True, default='')
    city = serializers.CharField(max_length=100, required=True)
    state = serializers.CharField(max_length=100, required=True)
    postal_code = serializers.CharField(max_length=20, required=True)
    country = serializers.CharField(max_length=100, required=False, default='India')

    def validate_customer_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Customer name cannot be empty.')
        return value.strip()

    def validate_phone(self, value):
        if not value:
            raise serializers.ValidationError('Enter a valid 10-digit mobile number.')
        stripped = str(value).strip()
        if not (stripped.isdigit() and len(stripped) == 10):
            raise serializers.ValidationError('Enter a valid 10-digit mobile number.')
        return stripped

    def validate_address_line_1(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Address line 1 cannot be empty.')
        return value.strip()
