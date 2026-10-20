"""
SmartBuy AI — Currency Utility & Constants
Currency Standard: INR (₹)
Fixed Dataset Migration Conversion Rate: 1 USD = 83 INR
"""

USD_TO_INR_RATE = 83


def usd_to_inr(usd_price):
    """
    Converts USD price to INR using the fixed migration rate (1 USD = 83 INR),
    rounded to the nearest whole rupee.
    """
    if usd_price is None:
        return None
    return int(round(float(usd_price) * USD_TO_INR_RATE))


def format_inr(amount, include_symbol=True):
    """
    Formats a numeric INR amount into Indian numbering format (e.g. ₹43,077 or ₹1,00,000).
    """
    if amount is None:
        return ""
    val = int(round(float(amount)))
    s = str(val)
    if len(s) <= 3:
        formatted = s
    else:
        last_three = s[-3:]
        other_digits = s[:-3]
        res = ""
        while len(other_digits) > 2:
            res = "," + other_digits[-2:] + res
            other_digits = other_digits[:-2]
        if other_digits:
            res = other_digits + res
        formatted = f"{res},{last_three}"

    prefix = "₹" if include_symbol else "INR "
    return f"{prefix}{formatted}"
