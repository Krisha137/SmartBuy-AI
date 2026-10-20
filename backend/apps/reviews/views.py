from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import NotFound

from apps.products.models import Product
from apps.reviews.models import Review, ProductReviewInsight
from apps.reviews.serializers import ReviewSerializer, ProductReviewInsightSerializer
from services.review_intelligence.aggregation import InsightAggregator


class ProductReviewListView(ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    ALLOWED_ORDERING_FIELDS = {
        'review_date': 'review_date',
        '-review_date': '-review_date',
        'helpful_votes': 'helpful_votes',
        '-helpful_votes': '-helpful_votes',
        'rating': 'rating',
        '-rating': '-rating',
        'created_at': 'created_at',
        '-created_at': '-created_at',
    }

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        if not Product.objects.filter(product_id=product_id).exists():
            raise NotFound(f"Product with ID '{product_id}' not found.")

        queryset = Review.objects.filter(product_id=product_id)

        params = self.request.query_params
        if 'theme' in params and params['theme'].strip():
            queryset = queryset.filter(analysis__theme_mentions__theme__iexact=params['theme'].strip())

        if 'sentiment' in params and params['sentiment'].strip():
            queryset = queryset.filter(analysis__sentiment__iexact=params['sentiment'].strip())

        if 'ordering' in params and params['ordering'].strip():
            ordering_param = params['ordering'].strip()
            if ordering_param in self.ALLOWED_ORDERING_FIELDS:
                queryset = queryset.order_by(self.ALLOWED_ORDERING_FIELDS[ordering_param])
            else:
                queryset = queryset.order_by('-created_at')
        else:
            queryset = queryset.order_by('-created_at')

        return queryset


class ProductReviewIntelligenceView(APIView):
    """
    GET /api/v1/products/{product_id}/review-intelligence/
    Returns evidence-based review statistics, sentiment distribution, confidence level,
    and positive/negative theme summaries for a given laptop product.
    """
    permission_classes = [AllowAny]

    def get(self, request, product_id, *args, **kwargs):
        try:
            product = Product.objects.get(product_id=product_id)
        except Product.DoesNotExist:
            raise NotFound(f"Product with ID '{product_id}' not found.")

        try:
            insight = ProductReviewInsight.objects.get(product=product)
        except ProductReviewInsight.DoesNotExist:
            aggregator = InsightAggregator()
            insight = aggregator.aggregate_product_insight(product)

        serializer = ProductReviewInsightSerializer(insight)
        return Response(serializer.data, status=status.HTTP_200_OK)
