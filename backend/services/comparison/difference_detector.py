"""
Difference detection module for SmartBuy AI Product Comparison.
Identifies factual metric differences and gaps across compared products.
"""

from services.currency import format_inr


class DifferenceDetector:
    """
    Identifies non-identical spec fields and calculates price/spec gaps across products.
    """

    def detect_differences(self, products: list) -> dict:
        if not products or len(products) < 2:
            return {}

        prices = [float(p.price) for p in products if p.price is not None]
        price_diff = None
        if prices:
            min_p = min(prices)
            max_p = max(prices)
            gap = max_p - min_p
            price_diff = {
                "min_price": int(min_p),
                "min_price_formatted": format_inr(int(min_p)),
                "max_price": int(max_p),
                "max_price_formatted": format_inr(int(max_p)),
                "price_gap": int(gap),
                "price_gap_formatted": format_inr(int(gap))
            }

        differing_specs = []

        # Check specification fields
        spec_fields = [
            ("brand", "Brand"),
            ("price", "Price"),
            ("processor", "Processor"),
            ("cpu_cores", "CPU Cores"),
            ("ram_gb", "RAM (GB)"),
            ("storage_gb", "Storage (GB)"),
            ("storage_type", "Storage Type"),
            ("gpu", "GPU"),
            ("gpu_type", "GPU Type"),
            ("display_size", "Display Size (inches)"),
            ("display_resolution", "Display Resolution"),
            ("display_type", "Display Type"),
            ("refresh_rate", "Refresh Rate (Hz)"),
            ("battery_wh", "Battery Capacity (Wh)"),
            ("battery_life", "Battery Life (hours)"),
            ("weight_kg", "Weight (kg)"),
            ("operating_system", "Operating System"),
            ("rating", "Customer Rating"),
        ]

        for field_name, label in spec_fields:
            vals = [getattr(p, field_name, None) for p in products]
            # Normalize for comparison
            vals_str = [str(v) if v is not None else "Not available" for v in vals]
            if len(set(vals_str)) > 1:
                differing_specs.append({
                    "field": field_name,
                    "label": label,
                    "values": {p.product_id: (str(getattr(p, field_name)) if getattr(p, field_name) is not None else None) for p in products}
                })

        return {
            "price_difference": price_diff,
            "has_differing_specs": bool(differing_specs),
            "differing_specifications": differing_specs
        }
