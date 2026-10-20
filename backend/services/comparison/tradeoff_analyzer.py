"""
Objective trade-off analysis module for SmartBuy AI Product Comparison.
Generates factual, evidence-based highlight bullet points for compared products without subjective claims.
"""

from decimal import Decimal
from services.currency import format_inr


class TradeoffAnalyzer:
    """
    Analyzes relative advantages and trade-offs per product in comparison group.
    """

    def analyze_tradeoffs(self, products: list, insights_map: dict = None) -> dict:
        if not products:
            return {}

        insights_map = insights_map or {}
        tradeoffs = {}

        prices = [float(p.price) for p in products if p.price is not None]
        min_price = min(prices) if prices else None
        max_price = max(prices) if prices else None

        rams = [p.ram_gb for p in products if p.ram_gb is not None]
        max_ram = max(rams) if rams else None
        min_ram = min(rams) if rams else None

        storages = [p.storage_gb for p in products if p.storage_gb is not None]
        max_storage = max(storages) if storages else None

        weights = [float(p.weight_kg) for p in products if p.weight_kg is not None]
        min_weight = min(weights) if weights else None
        max_weight = max(weights) if weights else None

        refresh_rates = [p.refresh_rate for p in products if p.refresh_rate is not None]
        max_refresh = max(refresh_rates) if refresh_rates else None

        for p in products:
            p_tradeoffs = {
                "advantages": [],
                "tradeoffs": []
            }
            price_val = float(p.price) if p.price is not None else None

            # Pricing trade-offs
            if price_val and min_price and max_price and len(products) > 1 and min_price != max_price:
                if price_val == min_price:
                    p_tradeoffs["advantages"].append(f"Lowest price in comparison group ({format_inr(int(price_val))})")
                elif price_val == max_price:
                    p_tradeoffs["tradeoffs"].append(f"Highest price in comparison group ({format_inr(int(price_val))})")

            # RAM trade-offs
            if p.ram_gb and max_ram and len(products) > 1 and max_ram != min_ram:
                if p.ram_gb == max_ram:
                    p_tradeoffs["advantages"].append(f"Highest RAM capacity ({p.ram_gb}GB)")
                elif p.ram_gb == min_ram:
                    p_tradeoffs["tradeoffs"].append(f"Lower RAM capacity ({p.ram_gb}GB)")

            # Storage trade-offs
            if p.storage_gb and max_storage and p.storage_gb == max_storage and len(set(storages)) > 1:
                p_tradeoffs["advantages"].append(f"Highest storage capacity ({p.storage_gb}GB {p.storage_type or ''})".strip())

            # Graphics trade-offs
            if p.gpu_type == "Dedicated":
                p_tradeoffs["advantages"].append(f"Dedicated graphics processor ({p.gpu})")
            elif p.gpu_type == "Integrated":
                p_tradeoffs["tradeoffs"].append(f"Integrated graphics processor ({p.gpu})")

            # Refresh Rate
            if p.refresh_rate and max_refresh and p.refresh_rate == max_refresh and max_refresh > 60:
                p_tradeoffs["advantages"].append(f"High refresh rate display ({p.refresh_rate}Hz)")

            # Weight / Portability
            if p.weight_kg and min_weight and max_weight and len(products) > 1 and min_weight != max_weight:
                if float(p.weight_kg) == min_weight:
                    p_tradeoffs["advantages"].append(f"Lighter weight in comparison group ({p.weight_kg} kg)")
                elif float(p.weight_kg) == max_weight:
                    p_tradeoffs["tradeoffs"].append(f"Heavier weight in comparison group ({p.weight_kg} kg)")

            # Review Intelligence Highlights
            ins = insights_map.get(p.product_id)
            if ins:
                if ins.confidence == "low":
                    p_tradeoffs["tradeoffs"].append("Limited customer review evidence available")
                elif ins.positive_percentage >= Decimal("70.00"):
                    p_tradeoffs["advantages"].append(f"Strong customer sentiment ({ins.positive_percentage}% positive)")

            tradeoffs[p.product_id] = p_tradeoffs

        return tradeoffs
