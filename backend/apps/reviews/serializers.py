from rest_framework import serializers
from apps.reviews.models import Review, ProductReviewInsight


class ReviewSerializer(serializers.ModelSerializer):
    product_id = serializers.CharField(source='product.product_id', read_only=True)
    sentiment = serializers.SerializerMethodField()
    themes = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'review_id',
            'product_id',
            'rating',
            'review_title',
            'review_text',
            'review_date',
            'verified_purchase',
            'helpful_votes',
            'sentiment',
            'themes',
            'created_at',
        ]
        read_only_fields = ['created_at']

    def get_sentiment(self, obj):
        analysis = getattr(obj, 'analysis', None)
        return analysis.sentiment if analysis else None

    def get_themes(self, obj):
        analysis = getattr(obj, 'analysis', None)
        if not analysis:
            return []
        return list(analysis.theme_mentions.values('theme', 'sentiment'))


class ProductReviewInsightSerializer(serializers.ModelSerializer):
    product_id = serializers.CharField(source='product.product_id', read_only=True)
    review_statistics = serializers.SerializerMethodField()
    sentiment = serializers.SerializerMethodField()

    class Meta:
        model = ProductReviewInsight
        fields = [
            'product_id',
            'review_statistics',
            'sentiment',
            'confidence',
            'summary',
            'positive_themes',
            'negative_themes',
            'latest_review_date',
            'updated_at',
        ]

    def get_review_statistics(self, obj):
        return {
            "total_reviews": obj.total_reviews,
            "average_rating": float(obj.average_rating),
            "verified_review_count": obj.verified_review_count,
            "verified_review_percentage": float(obj.verified_review_percentage),
        }

    def get_sentiment(self, obj):
        return {
            "positive": float(obj.positive_percentage),
            "neutral": float(obj.neutral_percentage),
            "negative": float(obj.negative_percentage),
        }
