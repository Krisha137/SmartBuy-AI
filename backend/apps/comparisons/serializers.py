from rest_framework import serializers


class ProductComparisonInputSerializer(serializers.Serializer):
    product_ids = serializers.ListField(
        child=serializers.CharField(),
        required=True,
        help_text="List of 2 to 4 product IDs to compare side-by-side."
    )
    requirement_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="Optional requirement ID to calculate recommendation fit."
    )

    def validate_product_ids(self, value):
        if not value or not isinstance(value, list):
            raise serializers.ValidationError("'product_ids' must be a list of product ID strings.")

        cleaned = [str(pid).strip() for pid in value if pid and str(pid).strip()]

        if len(cleaned) < 2 or len(cleaned) > 4:
            raise serializers.ValidationError("Product comparison requires between 2 and 4 product IDs.")

        if len(cleaned) != len(set(cleaned)):
            raise serializers.ValidationError("Duplicate product IDs are not allowed in comparison.")

        return cleaned
