from rest_framework import serializers
from apps.recommendations.models import RecommendationResult


class RecommendationRequestSerializer(serializers.Serializer):
    requirement_id = serializers.IntegerField(required=True)
    limit = serializers.IntegerField(required=False, default=5, min_value=1, max_value=10)


class RecommendationResultSerializer(serializers.ModelSerializer):
    requirement_id = serializers.IntegerField(source='requirement.requirement_id', read_only=True)

    class Meta:
        model = RecommendationResult
        fields = ['recommendation_id', 'requirement_id', 'total_candidates', 'recommendations_payload', 'created_at']
        read_only_fields = ['recommendation_id', 'created_at']
