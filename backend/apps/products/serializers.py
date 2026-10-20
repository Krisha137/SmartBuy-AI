from rest_framework import serializers
from apps.products.models import Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.CharField(source='image_url', read_only=True)
    type = serializers.CharField(source='image_type', read_only=True)

    class Meta:
        model = ProductImage
        fields = ['id', 'url', 'type', 'source_type', 'display_order', 'is_primary']


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    review_intelligence = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'product_id',
            'product_name',
            'brand',
            'category',
            'product_segment',
            'price',
            'currency',
            'ram_gb',
            'storage_gb',
            'storage_type',
            'processor',
            'cpu_cores',
            'gpu',
            'gpu_type',
            'display_size',
            'display_resolution',
            'display_type',
            'refresh_rate',
            'weight_kg',
            'battery_wh',
            'battery_life',
            'operating_system',
            'release_year',
            'rating',
            'review_count',
            'original_price',
            'warranty',
            'product_description',
            'image_url',
            'images',
            'review_intelligence',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_review_intelligence(self, obj):
        try:
            insight = getattr(obj, 'review_insight', None)
            if not insight:
                return None
            return {
                "total_reviews": insight.total_reviews,
                "average_rating": float(insight.average_rating),
                "verified_review_percentage": float(insight.verified_review_percentage),
                "positive_percentage": float(insight.positive_percentage),
                "neutral_percentage": float(insight.neutral_percentage),
                "negative_percentage": float(insight.negative_percentage),
                "positive_themes": insight.positive_themes[:3] if insight.positive_themes else [],
                "negative_themes": insight.negative_themes[:3] if insight.negative_themes else [],
                "summary": insight.summary or ""
            }
        except Exception:
            return None


class ProductQAInputSerializer(serializers.Serializer):
    question = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=500,
        error_messages={
            'required': 'Question is required.',
            'blank': 'Question cannot be empty or whitespace only.',
            'max_length': 'Question exceeds maximum allowed length of 500 characters.'
        }
    )

    def validate_question(self, value):
        if value is None or not isinstance(value, str):
            raise serializers.ValidationError("Question is required and must be a string.")
        stripped = value.strip()
        if not stripped:
            raise serializers.ValidationError("Question cannot be empty or whitespace only.")
        if len(stripped) > 500:
            raise serializers.ValidationError("Question exceeds maximum allowed length of 500 characters.")
        return stripped

