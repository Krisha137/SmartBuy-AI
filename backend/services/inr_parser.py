import re
from decimal import Decimal


def parse_inr_expression(val_str):
    """
    Parses a string representing an INR monetary value into an integer number of rupees.
    Examples:
      '₹80,000' -> 80000
      '80k' -> 80000
      '1 lakh' -> 100000
      '1.5 lakh' -> 150000
      '50000 rupees' -> 50000
    """
    if not val_str:
        return None

    clean = str(val_str).lower().replace(',', '').replace('₹', '').replace('rs.', '').replace('rs', '').replace('rupees', '').replace('inr', '').strip()
    if not clean:
        return None

    # Handle lakh / lakhs / lac / l
    lakh_match = re.search(r'([\d.]+)\s*(lakh|lakhs|lac|lacs|l)\b', clean)
    if lakh_match:
        try:
            return int(round(float(lakh_match.group(1)) * 100000))
        except ValueError:
            pass

    # Handle k / thousand
    k_match = re.search(r'([\d.]+)\s*(k|thousand|thousands)\b', clean)
    if k_match:
        try:
            return int(round(float(k_match.group(1)) * 1000))
        except ValueError:
            pass

    # Pure integer / float
    try:
        val = float(clean)
        return int(round(val))
    except ValueError:
        pass

    return None


def extract_inr_budget(query_text):
    """
    Extracts min and max INR budget from natural language query strings.
    Returns (budget_min, budget_max).
    """
    if not query_text:
        return None, None

    text = str(query_text).lower()

    # Pattern for range: between X and Y, X to Y, X - Y
    range_match = re.search(r'(?:between|from)?\s*(₹?\s*[\d.,]+\s*(?:k|thousand|lakh|lakhs|l)?)\s*(?:and|to|-)\s*(₹?\s*[\d.,]+\s*(?:k|thousand|lakh|lakhs|l)?)', text)
    if range_match:
        b_min = parse_inr_expression(range_match.group(1))
        b_max = parse_inr_expression(range_match.group(2))
        if b_min and b_max:
            return b_min, b_max

    # Pattern for under / below / max / less than / around / budget is
    under_match = re.search(r'(?:under|below|less than|within|around|max|budget is|up to)\s*(₹?\s*[\d.,]+\s*(?:k|thousand|lakh|lakhs|l|rupees|rs|inr)?)', text)
    if under_match:
        b_max = parse_inr_expression(under_match.group(1))
        if b_max:
            return None, b_max

    # Pattern for standalone ₹X / Xk / X lakh
    single_match = re.search(r'(₹\s*[\d.,]+|[\d.]+\s*k|[\d.]+\s*lakhs?)', text)
    if single_match:
        b_max = parse_inr_expression(single_match.group(1))
        if b_max:
            return None, b_max

    return None, None
