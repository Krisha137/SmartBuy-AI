"""
Product Comparator orchestration module for SmartBuy AI Product Comparison.
Combines PostgreSQL product specifications, precomputed review intelligence,
optional deterministic recommendation fit, difference detection, and objective trade-off analysis.
"""

from decimal import Decimal
from rest_framework.exceptions import NotFound

from apps.products.models import Product
from apps.products.serializers import ProductSerializer
from apps.requirements.models import Requirement
from apps.reviews.models import ProductReviewInsight
from apps.reviews.serializers import ProductReviewInsightSerializer
from services.review_intelligence.aggregation import InsightAggregator
from services.recommendation_engine import RecommendationEngine
from services.currency import format_inr
from .schemas import validate_comparison_input
from .difference_detector import DifferenceDetector
from .tradeoff_analyzer import TradeoffAnalyzer


class ProductComparator:
    """
    Side-by-side comparison engine for 2 to 4 laptop products.
    """

    def __init__(self):
        self.difference_detector = DifferenceDetector()
        self.tradeoff_analyzer = TradeoffAnalyzer()
        self.insight_aggregator = InsightAggregator()

    def compare_products(self, product_ids: list, requirement_id: int = None) -> dict:
        # 1. Input Validation
        cleaned_ids, errors = validate_comparison_input(product_ids, requirement_id)
        if errors:
            raise ValueError("; ".join(errors))

        # 2. Fetch Products from PostgreSQL
        products_map = {p.product_id: p for p in Product.objects.filter(product_id__in=cleaned_ids)}
        missing_ids = [pid for pid in cleaned_ids if pid not in products_map]
        if missing_ids:
            raise NotFound(f"Product with ID '{missing_ids[0]}' not found.")

        ordered_products = [products_map[pid] for pid in cleaned_ids]

        # 3. Handle Optional Requirement & Recommendation Fit
        requirement = None
        recommendation_fit_map = {}

        if requirement_id is not None:
            try:
                requirement = Requirement.objects.get(requirement_id=requirement_id)
            except Requirement.DoesNotExist:
                raise NotFound(f"Requirement with ID '{requirement_id}' not found.")

            # Calculate deterministic recommendation fit scores
            rec_engine = RecommendationEngine()
            rec_result = rec_engine.generate_recommendations(requirement, limit=76)
            rec_candidates = {r['product']['product_id']: r for r in rec_result.get('recommendations', [])}

            for p in ordered_products:
                candidate = rec_candidates.get(p.product_id)
                if candidate:
                    recommendation_fit_map[p.product_id] = {
                        "score": candidate['match_score'],
                        "rank": candidate['rank'],
                        "hard_constraints": {
                            "category_match": True,
                            "budget_match": float(p.price) <= float(requirement.budget_max) if requirement.budget_max else True,
                            "ram_match": p.ram_gb >= requirement.minimum_ram if requirement.minimum_ram else True,
                            "storage_match": p.storage_gb >= requirement.minimum_storage if requirement.minimum_storage else True,
                            "storage_type_match": p.storage_type.lower() == requirement.preferred_storage_type.lower() if requirement.preferred_storage_type else True,
                        },
                        "explanations": candidate.get('explanation', {})
                    }
                else:
                    # Satisfied 0 candidates or failed hard constraints
                    recommendation_fit_map[p.product_id] = {
                        "score": 0.0,
                        "rank": None,
                        "hard_constraints": {
                            "category_match": True,
                            "budget_match": float(p.price) <= float(requirement.budget_max) if requirement.budget_max else True,
                            "ram_match": p.ram_gb >= requirement.minimum_ram if requirement.minimum_ram else True,
                            "storage_match": p.storage_gb >= requirement.minimum_storage if requirement.minimum_storage else True,
                            "storage_type_match": p.storage_type.lower() == requirement.preferred_storage_type.lower() if requirement.preferred_storage_type else True,
                        },
                        "explanations": {
                            "positive": [],
                            "tradeoffs": ["Does not satisfy non-negotiable hard requirement constraints."]
                        }
                    }

        # 4. Fetch / Aggregate Review Intelligence
        review_intelligence_map = {}
        insights_obj_map = {}

        for p in ordered_products:
            try:
                insight = ProductReviewInsight.objects.get(product=p)
            except ProductReviewInsight.DoesNotExist:
                insight = self.insight_aggregator.aggregate_product_insight(p)

            insights_obj_map[p.product_id] = insight
            serializer = ProductReviewInsightSerializer(insight)
            review_intelligence_map[p.product_id] = serializer.data

        # 5. Difference Detection & Trade-off Analysis
        differences = self.difference_detector.detect_differences(ordered_products)
        tradeoffs = self.tradeoff_analyzer.analyze_tradeoffs(ordered_products, insights_obj_map)

        # 6. Construct Structured Response
        products_summary = [
            {
                **ProductSerializer(p).data,
                "price": int(p.price) if p.price is not None else 0,
                "price_formatted": format_inr(int(p.price)) if p.price is not None else "Not available",
                "display_size": float(p.display_size) if p.display_size is not None else None,
                "weight_kg": float(p.weight_kg) if p.weight_kg is not None else None,
                "battery_wh": float(p.battery_wh) if p.battery_wh is not None else None,
                "battery_life": float(p.battery_life) if p.battery_life is not None else None,
                "rating": float(p.rating) if p.rating is not None else 0.0,
            }
            for p in ordered_products
        ]

        matrix = {
            "basic": {p.product_id: {"name": p.product_name, "brand": p.brand, "segment": p.product_segment or None, "release_year": p.release_year} for p in ordered_products},
            "pricing": {p.product_id: {"price": int(p.price), "price_formatted": format_inr(int(p.price)), "currency": p.currency} for p in ordered_products},
            "performance": {p.product_id: {"processor": p.processor, "cpu_cores": p.cpu_cores} for p in ordered_products},
            "memory_storage": {p.product_id: {"ram_gb": p.ram_gb, "storage_gb": p.storage_gb, "storage_type": p.storage_type} for p in ordered_products},
            "graphics": {p.product_id: {"gpu": p.gpu, "gpu_type": p.gpu_type or None} for p in ordered_products},
            "display": {p.product_id: {"display_size": float(p.display_size), "display_resolution": p.display_resolution, "display_type": p.display_type or None, "refresh_rate": p.refresh_rate} for p in ordered_products},
            "battery": {p.product_id: {"battery_wh": float(p.battery_wh) if p.battery_wh is not None else None, "battery_life": float(p.battery_life) if p.battery_life is not None else None} for p in ordered_products},
            "portability": {p.product_id: {"weight_kg": float(p.weight_kg)} for p in ordered_products},
            "operating_system": {p.product_id: p.operating_system for p in ordered_products},
        }

        return {
            "products": products_summary,
            "specifications_matrix": matrix,
            "differences": differences,
            "review_intelligence": review_intelligence_map,
            "recommendation_fit": recommendation_fit_map if requirement_id is not None else None,
            "trade_offs": tradeoffs
        }
