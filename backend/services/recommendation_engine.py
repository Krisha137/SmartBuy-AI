from decimal import Decimal
from apps.products.models import Product
from apps.products.serializers import ProductSerializer
from services.currency import format_inr


RECOMMENDATION_WEIGHTS = {
    "requirement": 0.40,
    "performance": 0.20,
    "battery": 0.15,
    "weight": 0.10,
    "storage": 0.05,
    "brand": 0.05,
    "rating": 0.05
}


def _normalize_higher_is_better(val, min_val, max_val):
    val = float(val) if val is not None else 0.0
    min_val = float(min_val)
    max_val = float(max_val)
    if max_val <= min_val:
        return 1.0
    return max(0.0, min(1.0, (val - min_val) / (max_val - min_val)))


def _normalize_lower_is_better(val, min_val, max_val):
    val = float(val) if val is not None else max_val
    min_val = float(min_val)
    max_val = float(max_val)
    if max_val <= min_val:
        return 1.0
    return max(0.0, min(1.0, (max_val - val) / (max_val - min_val)))


class RecommendationEngine:
    """
    Deterministic Recommendation Engine for SmartBuy AI.
    Calculates candidate match scores (0 to 100) and machine-generated explanations
    based strictly on PostgreSQL data and structured requirements.
    """

    @classmethod
    def generate_recommendations(cls, requirement, limit=5):
        # Enforce safe limit (1 to 10)
        limit = max(1, min(10, int(limit)))

        # 1. Hard Constraints Filtering
        queryset = Product.objects.all()

        if requirement.category:
            queryset = queryset.filter(category__iexact=requirement.category)

        if requirement.budget_max and requirement.budget_max > Decimal('0.00'):
            queryset = queryset.filter(price__lte=requirement.budget_max)

        if requirement.budget_min and requirement.budget_min > Decimal('0.00'):
            queryset = queryset.filter(price__gte=requirement.budget_min)

        if requirement.minimum_ram and requirement.minimum_ram > 0:
            queryset = queryset.filter(ram_gb__gte=requirement.minimum_ram)

        if requirement.minimum_storage and requirement.minimum_storage > 0:
            queryset = queryset.filter(storage_gb__gte=requirement.minimum_storage)

        if requirement.preferred_storage_type and requirement.preferred_storage_type.strip():
            queryset = queryset.filter(storage_type__iexact=requirement.preferred_storage_type.strip())

        candidates = list(queryset)
        total_candidates = len(candidates)

        # 2. No candidates match hard constraints
        if total_candidates == 0:
            suggestions = []
            if requirement.budget_max:
                suggestions.append(f"Consider increasing your maximum budget above {format_inr(requirement.budget_max)}")
            if requirement.minimum_ram and requirement.minimum_ram > 8:
                suggestions.append(f"Consider reducing minimum RAM requirement below {requirement.minimum_ram} GB")
            if requirement.minimum_storage and requirement.minimum_storage > 256:
                suggestions.append(f"Consider reducing minimum storage requirement below {requirement.minimum_storage} GB")
            if not suggestions:
                suggestions.append("Try relaxing product search filters or constraints.")

            return {
                "requirement_id": requirement.requirement_id,
                "total_candidates": 0,
                "message": "No laptops match all required hard constraints.",
                "suggestions": suggestions,
                "recommendations": []
            }

        # 3. Calculate Pool Min/Max for Normalization
        prices = [float(p.price) for p in candidates]
        rams = [float(p.ram_gb) for p in candidates]
        storages = [float(p.storage_gb) for p in candidates]
        weights = [float(p.weight_kg) for p in candidates]
        batteries = [float(p.battery_life or 0) for p in candidates]
        ratings = [float(p.rating) for p in candidates]

        min_price, max_price = min(prices), max(prices)
        min_ram, max_ram = min(rams), max(rams)
        min_storage, max_storage = min(storages), max(storages)
        min_weight, max_weight = min(weights), max(weights)
        min_battery, max_battery = min(batteries), max(batteries)
        min_rating, max_rating = min(ratings), max(ratings)

        scored_products = []

        # 4. Score Each Candidate
        for p in candidates:
            # Sub-score: Requirement Satisfaction (Price headroom + specs satisfaction)
            b_max = float(requirement.budget_max) if requirement.budget_max and requirement.budget_max > 0 else max_price
            price_headroom = max(0.0, (b_max - float(p.price)) / b_max) if b_max > 0 else 1.0
            ram_headroom = min(1.5, float(p.ram_gb) / float(requirement.minimum_ram)) if requirement.minimum_ram and requirement.minimum_ram > 0 else 1.0
            storage_headroom = min(1.5, float(p.storage_gb) / float(requirement.minimum_storage)) if requirement.minimum_storage and requirement.minimum_storage > 0 else 1.0
            req_satisfaction = (price_headroom * 0.4) + (min(1.0, ram_headroom) * 0.3) + (min(1.0, storage_headroom) * 0.3)

            # Sub-score: Performance
            cpu_factor = (p.cpu_cores or 4) / 16.0
            ram_factor = float(p.ram_gb) / 32.0
            gpu_factor = 0.3 if (p.gpu_type or '').lower() == 'dedicated' else 0.1
            perf_raw = (cpu_factor * 0.4) + (ram_factor * 0.4) + (gpu_factor * 0.2)
            perf_score = min(1.0, perf_raw)

            # Sub-score: Battery
            battery_score = _normalize_higher_is_better(p.battery_life, min_battery, max_battery)

            # Sub-score: Weight
            weight_score = _normalize_lower_is_better(p.weight_kg, min_weight, max_weight)

            # Sub-score: Storage
            storage_score = _normalize_higher_is_better(p.storage_gb, min_storage, max_storage)

            # Sub-score: Brand
            if requirement.brand_preference and requirement.brand_preference.strip():
                brand_score = 1.0 if p.brand.lower() == requirement.brand_preference.strip().lower() else 0.0
            else:
                brand_score = 1.0

            # Sub-score: Rating
            rating_score = float(p.rating) / 5.0

            # Priority Adjustments
            w_battery = RECOMMENDATION_WEIGHTS['battery']
            w_weight = RECOMMENDATION_WEIGHTS['weight']
            w_req = RECOMMENDATION_WEIGHTS['requirement']

            bat_prio = (requirement.battery_priority or '').strip().lower()
            if bat_prio == 'high':
                w_battery = 0.18
            elif bat_prio == 'low':
                w_battery = 0.05
                w_req += 0.07

            wt_prio = (requirement.weight_priority or '').strip().lower()
            if wt_prio == 'high':
                w_weight = 0.15
            elif wt_prio == 'low':
                w_weight = 0.03
                w_req += 0.05

            final_raw = (
                (req_satisfaction * w_req) +
                (perf_score * RECOMMENDATION_WEIGHTS['performance']) +
                (battery_score * w_battery) +
                (weight_score * w_weight) +
                (storage_score * RECOMMENDATION_WEIGHTS['storage']) +
                (brand_score * RECOMMENDATION_WEIGHTS['brand']) +
                (rating_score * RECOMMENDATION_WEIGHTS['rating'])
            )

            # Normalize final score between 0.0 and 100.0
            match_score = round(max(0.0, min(100.0, final_raw * 100.0)), 1)

            # 5. Deterministic Machine Explanations & Trade-offs
            positives = []
            tradeoffs = []

            if requirement.budget_max and p.price <= requirement.budget_max:
                positives.append(f"Fits within your maximum budget of {format_inr(requirement.budget_max)} ({format_inr(p.price)})")

            if requirement.minimum_ram and p.ram_gb >= requirement.minimum_ram:
                positives.append(f"Meets your {requirement.minimum_ram}GB RAM requirement ({p.ram_gb}GB installed)")

            if requirement.minimum_storage and p.storage_gb >= requirement.minimum_storage:
                positives.append(f"Provides {p.storage_gb}GB {p.storage_type} storage (meets {requirement.minimum_storage}GB requirement)")

            if bat_prio == 'high' and p.battery_life and p.battery_life >= Decimal('8.0'):
                positives.append(f"Long battery life ({p.battery_life} hours) matches your high battery priority")
            elif bat_prio == 'high' and p.battery_life and p.battery_life < Decimal('7.0'):
                tradeoffs.append(f"Battery life ({p.battery_life} hours) is moderate for a high battery priority request")

            if wt_prio == 'high' and p.weight_kg <= Decimal('1.50'):
                positives.append(f"Lightweight design ({p.weight_kg} kg) satisfies portability preference")
            elif wt_prio == 'high' and p.weight_kg > Decimal('1.80'):
                tradeoffs.append(f"Weight ({p.weight_kg} kg) is heavier than a lightweight preference (under 1.5 kg)")

            if requirement.brand_preference and p.brand.lower() == requirement.brand_preference.strip().lower():
                positives.append(f"Matches your preferred brand ({p.brand})")
            elif requirement.brand_preference and p.brand.lower() != requirement.brand_preference.strip().lower():
                tradeoffs.append(f"Brand is {p.brand} (preferred: {requirement.brand_preference})")

            # Use-case heuristics explanation
            use_case = (requirement.use_case or '').strip().lower()
            if 'program' in use_case or 'code' in use_case:
                if p.ram_gb >= 16 and (p.cpu_cores or 0) >= 6:
                    positives.append(f"Excellent for programming with {p.ram_gb}GB RAM and {p.cpu_cores}-core {p.processor}")
            elif 'game' in use_case or 'gaming' in use_case:
                if (p.gpu_type or '').lower() == 'dedicated':
                    positives.append(f"Dedicated {p.gpu} GPU and {p.refresh_rate}Hz screen suited for gaming")
                else:
                    tradeoffs.append("Integrated graphics card may limit high-end gaming performance")
            elif 'design' in use_case or 'video' in use_case or 'creative' in use_case:
                if (p.gpu_type or '').lower() == 'dedicated' or p.ram_gb >= 16:
                    positives.append(f"Well-suited for design & video workflows with {p.ram_gb}GB RAM and {p.gpu}")
                else:
                    tradeoffs.append("Integrated GPU or 8GB RAM may slow down heavy 4K video timeline rendering")
            elif 'business' in use_case or 'productivity' in use_case or 'office' in use_case:
                if p.weight_kg and p.weight_kg <= Decimal('1.60'):
                    positives.append(f"Highly portable ({p.weight_kg} kg) for business travel and meetings")
                if p.battery_life and p.battery_life >= Decimal('8.0'):
                    positives.append(f"All-day battery ({p.battery_life} hrs) suited for productivity away from desk")
            elif 'data' in use_case or 'ai' in use_case or 'science' in use_case:
                if p.ram_gb >= 16 and (p.cpu_cores or 0) >= 8:
                    positives.append(f"High-capacity {p.ram_gb}GB RAM and {p.cpu_cores} CPU cores for data science & model training")
                elif p.ram_gb < 16:
                    tradeoffs.append("8GB RAM may be constrained when loading large datasets into memory")
            elif 'college' in use_case or 'student' in use_case or 'everyday' in use_case:
                positives.append("Balanced battery, weight, and price ideal for college and daily tasks")

            if not positives:
                positives.append(f"Matches requested category ({p.category}) and general specifications")

            scored_products.append({
                'product_obj': p,
                'match_score': match_score,
                'explanation': {
                    'positive': positives,
                    'tradeoffs': tradeoffs
                }
            })

        # 6. Sort Candidates by Match Score Descending, then Rating Descending
        scored_products.sort(key=lambda x: (x['match_score'], float(x['product_obj'].rating)), reverse=True)

        # 7. Select Top Recommendations up to limit
        top_recommendations = scored_products[:limit]

        results_list = []
        for rank, item in enumerate(top_recommendations, start=1):
            prod_serialized = ProductSerializer(item['product_obj']).data
            results_list.append({
                'product_id': item['product_obj'].product_id,
                'rank': rank,
                'match_score': item['match_score'],
                'product': prod_serialized,
                'explanation': item['explanation']
            })

        return {
            'requirement_id': requirement.requirement_id,
            'total_candidates': total_candidates,
            'recommendations': results_list
        }
