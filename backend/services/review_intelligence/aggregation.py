"""
Aggregation and summary generation module for SmartBuy AI Review Intelligence.
Computes deterministic review statistics, sentiment percentages, confidence level,
theme counts, and evidence-based summaries.
"""

from decimal import Decimal
from django.db.models import Avg, Count
from apps.reviews.models import Review, ReviewAnalysis, ReviewThemeAnalysis, ProductReviewInsight
from .schemas import CONFIDENCE_THRESHOLDS


class InsightAggregator:
    """
    Computes aggregated review insights for a given laptop product.
    """

    def aggregate_product_insight(self, product) -> ProductReviewInsight:
        reviews = Review.objects.filter(product=product)
        total_reviews = reviews.count()

        if total_reviews == 0:
            insight, _ = ProductReviewInsight.objects.update_or_create(
                product=product,
                defaults={
                    "total_reviews": 0,
                    "average_rating": Decimal("0.00"),
                    "verified_review_count": 0,
                    "verified_review_percentage": Decimal("0.00"),
                    "positive_count": 0,
                    "neutral_count": 0,
                    "negative_count": 0,
                    "positive_percentage": Decimal("0.00"),
                    "neutral_percentage": Decimal("0.00"),
                    "negative_percentage": Decimal("0.00"),
                    "confidence": "low",
                    "summary": "No review data is currently available.",
                    "positive_themes": [],
                    "negative_themes": [],
                    "latest_review_date": None
                }
            )
            return insight

        # 1. Rating & Verified Statistics
        avg_rating_val = reviews.aggregate(avg=Avg('rating'))['avg'] or 0.0
        average_rating = Decimal(str(round(float(avg_rating_val), 2)))

        verified_count = reviews.filter(verified_purchase=True).count()
        verified_pct = Decimal(str(round((verified_count / total_reviews) * 100.0, 2)))

        # Latest review date
        dates = [r.review_date for r in reviews if r.review_date is not None]
        latest_date = max(dates) if dates else None

        # 2. Sentiment Statistics from ReviewAnalysis
        analyses = ReviewAnalysis.objects.filter(review__product=product)
        pos_count = analyses.filter(sentiment='positive').count()
        neu_count = analyses.filter(sentiment='neutral').count()
        neg_count = analyses.filter(sentiment='negative').count()

        pos_pct = Decimal(str(round((pos_count / total_reviews) * 100.0, 2)))
        neu_pct = Decimal(str(round((neu_count / total_reviews) * 100.0, 2)))
        neg_pct = Decimal(str(round((neg_count / total_reviews) * 100.0, 2)))

        # 3. Confidence Calculation
        if total_reviews <= CONFIDENCE_THRESHOLDS["LOW_MAX"]:
            confidence = "low"
        elif total_reviews <= CONFIDENCE_THRESHOLDS["MEDIUM_MAX"]:
            confidence = "medium"
        else:
            confidence = "high"

        # 4. Theme Aggregation
        theme_mentions = ReviewThemeAnalysis.objects.filter(review_analysis__review__product=product)
        
        pos_theme_counts = (
            theme_mentions.filter(sentiment='positive')
            .values('theme')
            .annotate(mention_count=Count('id'))
            .order_by('-mention_count', 'theme')
        )
        neg_theme_counts = (
            theme_mentions.filter(sentiment='negative')
            .values('theme')
            .annotate(mention_count=Count('id'))
            .order_by('-mention_count', 'theme')
        )

        positive_themes_list = [
            {"theme": item['theme'], "mention_count": item['mention_count']}
            for item in pos_theme_counts
        ]
        negative_themes_list = [
            {"theme": item['theme'], "mention_count": item['mention_count']}
            for item in neg_theme_counts
        ]

        # 5. Evidence-based Summary Generation
        summary = self._generate_evidence_summary(
            total_reviews, pos_pct, pos_theme_counts, neg_theme_counts, theme_mentions
        )

        insight, _ = ProductReviewInsight.objects.update_or_create(
            product=product,
            defaults={
                "total_reviews": total_reviews,
                "average_rating": average_rating,
                "verified_review_count": verified_count,
                "verified_review_percentage": verified_pct,
                "positive_count": pos_count,
                "neutral_count": neu_count,
                "negative_count": neg_count,
                "positive_percentage": pos_pct,
                "neutral_percentage": neu_pct,
                "negative_percentage": neg_pct,
                "confidence": confidence,
                "summary": summary,
                "positive_themes": positive_themes_list,
                "negative_themes": negative_themes_list,
                "latest_review_date": latest_date
            }
        )

        return insight

    def _generate_evidence_summary(self, total_reviews, pos_pct, pos_themes, neg_themes, theme_mentions) -> str:
        if total_reviews <= 4:
            return "Limited review evidence is available."

        parts = []
        pos_names = [t['theme'].lower() for t in pos_themes[:2]]
        neg_names = [t['theme'].lower() for t in neg_themes[:2]]

        # Overall sentiment sentence
        if pos_pct >= Decimal('70.00'):
            sentiment_lead = "Customers generally praise this laptop."
        elif pos_pct >= Decimal('50.00'):
            sentiment_lead = "Customer sentiment is mostly positive."
        else:
            sentiment_lead = "Customer feedback is mixed."

        parts.append(sentiment_lead)

        # Highlight top positive themes
        if pos_names:
            p_str = " and ".join(pos_names)
            parts.append(f"Reviewers frequently highlight the {p_str}.")

        # Check for mixed battery feedback
        battery_pos = theme_mentions.filter(theme='Battery', sentiment='positive').count()
        battery_neg = theme_mentions.filter(theme='Battery', sentiment='negative').count()
        if battery_pos > 0 and battery_neg > 0:
            parts.append("Battery feedback is mixed.")

        # Highlight top negative themes
        if neg_names:
            n_str = " and ".join(neg_names)
            parts.append(f"Some reviewers mention concerns regarding {n_str}.")

        return " ".join(parts)
