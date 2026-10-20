"""
Schema and validation helpers for Product Comparison Service.
"""


def validate_comparison_input(product_ids: list, requirement_id: int = None) -> tuple[list[str], list[str]]:
    """
    Validates comparison input list of product IDs.
    Returns (cleaned_ids, errors_list).
    """
    errors = []
    if not isinstance(product_ids, list):
        return [], ["'product_ids' must be a list of product ID strings."]

    cleaned_ids = [str(pid).strip() for pid in product_ids if pid and str(pid).strip()]

    if len(cleaned_ids) < 2 or len(cleaned_ids) > 4:
        errors.append("Product comparison requires between 2 and 4 product IDs.")

    if len(cleaned_ids) != len(set(cleaned_ids)):
        errors.append("Duplicate product IDs are not allowed in comparison.")

    return cleaned_ids, errors
