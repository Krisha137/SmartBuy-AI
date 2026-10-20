from decimal import Decimal
from rest_framework import serializers
from apps.requirements.models import Requirement


class RequirementSerializer(serializers.ModelSerializer):
    ALLOWED_PRIORITIES = {'low', 'medium', 'high', ''}

    class Meta:
        model = Requirement
        fields = [
            'requirement_id',
            'user',
            'category',
            'budget_min',
            'budget_max',
            'use_case',
            'minimum_ram',
            'minimum_storage',
            'preferred_storage_type',
            'battery_priority',
            'performance_priority',
            'weight_priority',
            'brand_preference',
            'raw_user_query',
            'created_at',
        ]
        read_only_fields = ['requirement_id', 'user', 'created_at']

    def validate_budget_min(self, value):
        if value is not None and value < Decimal('0.00'):
            raise serializers.ValidationError("Minimum budget cannot be negative.")
        return value

    def validate_budget_max(self, value):
        if value is not None and value < Decimal('0.00'):
            raise serializers.ValidationError("Maximum budget cannot be negative.")
        return value

    def validate_minimum_ram(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Minimum RAM must be greater than zero.")
        return value

    def validate_minimum_storage(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Minimum storage must be greater than zero.")
        return value

    def validate_battery_priority(self, value):
        val_clean = (value or '').strip().lower()
        if val_clean not in self.ALLOWED_PRIORITIES:
            raise serializers.ValidationError(f"Invalid priority '{value}'. Must be low, medium, or high.")
        return val_clean

    def validate_performance_priority(self, value):
        val_clean = (value or '').strip().lower()
        if val_clean not in self.ALLOWED_PRIORITIES:
            raise serializers.ValidationError(f"Invalid priority '{value}'. Must be low, medium, or high.")
        return val_clean

    def validate_weight_priority(self, value):
        val_clean = (value or '').strip().lower()
        if val_clean not in self.ALLOWED_PRIORITIES:
            raise serializers.ValidationError(f"Invalid priority '{value}'. Must be low, medium, or high.")
        return val_clean

    def validate(self, attrs):
        budget_min = attrs.get('budget_min', getattr(self.instance, 'budget_min', Decimal('0.00')))
        budget_max = attrs.get('budget_max', getattr(self.instance, 'budget_max', Decimal('0.00')))

        if (budget_min is not None and budget_max is not None and
                budget_max > Decimal('0.00') and budget_max < budget_min):
            raise serializers.ValidationError({
                "budget_max": "Maximum budget cannot be less than minimum budget."
            })
        return attrs
