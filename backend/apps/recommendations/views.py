from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import NotFound, ValidationError
from apps.requirements.models import Requirement
from apps.recommendations.models import RecommendationResult
from apps.recommendations.serializers import RecommendationRequestSerializer
from services.recommendation_engine import RecommendationEngine


class RecommendationCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RecommendationRequestSerializer(data=request.data)
        if not serializer.is_valid():
            raise ValidationError(serializer.errors)

        req_id = serializer.validated_data['requirement_id']
        limit = serializer.validated_data.get('limit', 5)

        try:
            requirement = Requirement.objects.get(requirement_id=req_id)
        except Requirement.DoesNotExist:
            raise NotFound(f"Requirement with ID '{req_id}' not found.")

        result_payload = RecommendationEngine.generate_recommendations(requirement, limit=limit)

        # Persist recommendation result in PostgreSQL
        saved_obj = RecommendationResult.objects.create(
            requirement=requirement,
            total_candidates=result_payload['total_candidates'],
            recommendations_payload=result_payload
        )

        response_data = {
            'recommendation_id': saved_obj.recommendation_id,
            **result_payload
        }

        return Response(response_data, status=status.HTTP_200_OK)


class RecommendationDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, recommendation_id):
        try:
            result_obj = RecommendationResult.objects.get(recommendation_id=recommendation_id)
        except RecommendationResult.DoesNotExist:
            raise NotFound(f"Recommendation result with ID '{recommendation_id}' not found.")

        response_data = {
            'recommendation_id': result_obj.recommendation_id,
            'created_at': result_obj.created_at,
            **result_obj.recommendations_payload
        }
        return Response(response_data, status=status.HTTP_200_OK)
