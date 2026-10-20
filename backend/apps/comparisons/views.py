import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import NotFound

from services.comparison import ProductComparator
from .serializers import ProductComparisonInputSerializer

logger = logging.getLogger(__name__)


class ProductComparisonView(APIView):
    """
    POST /api/v1/products/compare/
    Factual side-by-side comparison of 2 to 4 laptop products with specifications,
    INR pricing, precomputed review intelligence, optional recommendation fit,
    difference detection, and objective trade-off analysis.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = ProductComparisonInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Invalid comparison request.",
                    "details": serializer.errors
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        product_ids = serializer.validated_data['product_ids']
        requirement_id = serializer.validated_data.get('requirement_id')

        # Authorization check: ensure requirement ownership is enforced server-side
        if requirement_id is not None:
            try:
                from apps.requirements.models import Requirement
                req = Requirement.objects.get(requirement_id=requirement_id)
                if req.user is not None:
                    if not request.user or not request.user.is_authenticated:
                        return Response({
                            "error": {
                                "code": "UNAUTHORIZED",
                                "message": "Authentication required to access user-specific requirement."
                            }
                        }, status=status.HTTP_401_UNAUTHORIZED)
                    if req.user != request.user:
                        return Response({
                            "error": {
                                "code": "FORBIDDEN",
                                "message": "You do not have permission to access another user's requirement."
                            }
                        }, status=status.HTTP_403_FORBIDDEN)
            except Requirement.DoesNotExist:
                return Response({
                    "error": {
                        "code": "NOT_FOUND",
                        "message": f"Requirement with ID '{requirement_id}' not found."
                    }
                }, status=status.HTTP_404_NOT_FOUND)

        comparator = ProductComparator()

        try:
            comparison_result = comparator.compare_products(
                product_ids=product_ids,
                requirement_id=requirement_id
            )
            return Response(comparison_result, status=status.HTTP_200_OK)

        except ValueError as ve:
            return Response({
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": str(ve)
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        except NotFound as nf:
            return Response({
                "error": {
                    "code": "NOT_FOUND",
                    "message": str(nf.detail)
                }
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error generating product comparison: {e}", exc_info=True)
            return Response({
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "Error processing product comparison."
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
