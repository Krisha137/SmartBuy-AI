from rest_framework import serializers


class RequirementUnderstandingInputSerializer(serializers.Serializer):
    query = serializers.CharField(
        required=True,
        max_length=500,
        help_text="Natural-language shopping requirement query."
    )

    def validate_query(self, value):
        if not value or not isinstance(value, str):
            raise serializers.ValidationError("Query is required and must be a string.")
        trimmed = value.strip()
        if len(trimmed) == 0:
            raise serializers.ValidationError("Query cannot be empty or whitespace only.")
        if len(trimmed) > 500:
            raise serializers.ValidationError("Query exceeds maximum allowed length of 500 characters.")
        return trimmed


class RequirementSpecSerializer(serializers.Serializer):
    category = serializers.CharField(default="Laptop")
    budget_min = serializers.IntegerField(allow_null=True, required=False)
    budget_max = serializers.IntegerField(allow_null=True, required=False)
    use_case = serializers.CharField(allow_null=True, required=False)
    minimum_ram = serializers.IntegerField(allow_null=True, required=False)
    minimum_storage = serializers.IntegerField(allow_null=True, required=False)
    preferred_storage_type = serializers.CharField(allow_null=True, required=False)
    battery_priority = serializers.CharField(allow_null=True, required=False)
    performance_priority = serializers.CharField(allow_null=True, required=False)
    weight_priority = serializers.CharField(allow_null=True, required=False)
    brand_preference = serializers.CharField(allow_null=True, required=False)


class RequirementUnderstandingOutputSerializer(serializers.Serializer):
    status = serializers.CharField()
    requirements = RequirementSpecSerializer()
    unsupported_requirements = serializers.ListField(
        child=serializers.CharField(), default=list
    )
    clarification_questions = serializers.ListField(
        child=serializers.CharField(), default=list
    )
