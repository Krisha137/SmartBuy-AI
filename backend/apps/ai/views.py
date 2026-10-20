import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from services.ai import AIService
from apps.requirements.models import Requirement
from apps.requirements.serializers import RequirementSerializer
from services.recommendation_engine import RecommendationEngine
from apps.recommendations.models import RecommendationResult
from apps.recommendations.serializers import RecommendationResultSerializer
from .serializers import (
    RequirementUnderstandingInputSerializer,
    RequirementUnderstandingOutputSerializer
)

logger = logging.getLogger(__name__)


class UnderstandRequirementsView(APIView):
    """
    POST /api/v1/ai/understand-requirements/
    Parses a natural-language shopping query into a strict, validated requirement JSON profile.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = RequirementUnderstandingInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Invalid query input.",
                    "details": serializer.errors
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        query = serializer.validated_data['query']
        ai_service = AIService()

        try:
            result = ai_service.understand_requirements(query)
            out_serializer = RequirementUnderstandingOutputSerializer(data=result)
            out_serializer.is_valid(raise_exception=True)
            return Response(out_serializer.data, status=status.HTTP_200_OK)
        except ValueError as ve:
            return Response({
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": str(ve)
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error processing requirement understanding: {e}", exc_info=True)
            return Response({
                "error": {
                    "code": "SERVICE_UNAVAILABLE",
                    "message": "AI service temporarily unavailable. Please try again."
                }
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class SmartSearchRecommendationView(APIView):
    """
    POST /api/v1/smartbuy/search/
    End-to-End Smart Search Pipeline:
    Natural Language Query -> AI Understanding -> Requirement Creation -> Deterministic Recommendation Engine -> Ranked Products.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = RequirementUnderstandingInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Invalid query input.",
                    "details": serializer.errors
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        query = serializer.validated_data['query']
        ai_service = AIService()

        try:
            understanding = ai_service.understand_requirements(query)
            
            if understanding.get("status") == "needs_clarification":
                return Response({
                    "status": "needs_clarification",
                    "understanding": understanding,
                    "recommendation": None
                }, status=status.HTTP_200_OK)

            reqs = understanding["requirements"]
            req_data = {
                "category": reqs.get("category", "Laptop"),
                "raw_user_query": query,
            }
            if reqs.get("budget_min") is not None:
                req_data["budget_min"] = reqs.get("budget_min")
            if reqs.get("budget_max") is not None:
                req_data["budget_max"] = reqs.get("budget_max")
            if reqs.get("use_case"):
                req_data["use_case"] = reqs.get("use_case")
            if reqs.get("minimum_ram"):
                req_data["minimum_ram"] = reqs.get("minimum_ram")
            if reqs.get("minimum_storage"):
                req_data["minimum_storage"] = reqs.get("minimum_storage")
            if reqs.get("preferred_storage_type"):
                req_data["preferred_storage_type"] = reqs.get("preferred_storage_type")
            if reqs.get("battery_priority"):
                req_data["battery_priority"] = reqs.get("battery_priority")
            if reqs.get("performance_priority"):
                req_data["performance_priority"] = reqs.get("performance_priority")
            if reqs.get("weight_priority"):
                req_data["weight_priority"] = reqs.get("weight_priority")
            if reqs.get("brand_preference"):
                req_data["brand_preference"] = reqs.get("brand_preference")

            requirement_instance = Requirement.objects.create(**req_data)

            # Generate recommendations using existing recommendation engine
            engine = RecommendationEngine()
            result_payload = engine.generate_recommendations(requirement_instance)

            # Persist recommendation result
            saved_obj = RecommendationResult.objects.create(
                requirement=requirement_instance,
                total_candidates=result_payload['total_candidates'],
                recommendations_payload=result_payload
            )

            rec_data = {
                'recommendation_id': saved_obj.recommendation_id,
                **result_payload
            }

            return Response({
                "status": "clear",
                "query": query,
                "requirement": RequirementSerializer(requirement_instance).data,
                "understanding": understanding,
                "recommendation": rec_data
            }, status=status.HTTP_200_OK)

        except ValueError as ve:
            return Response({
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": str(ve)
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error executing smart search recommendation: {e}", exc_info=True)
            return Response({
                "error": {
                    "code": "SERVICE_UNAVAILABLE",
                    "message": "Smart search service error."
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
