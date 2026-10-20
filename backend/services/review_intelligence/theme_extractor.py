"""
Theme extraction module for SmartBuy AI Review Intelligence.
Identifies mentioned laptop themes and associated sentiment per review.
"""

import re
from .schemas import THEME_KEYWORDS, LAPTOP_THEMES

POSITIVE_THEME_INDICATORS = {
    "good", "great", "excellent", "fast", "smooth", "awesome", "amazing",
    "best", "love", "loved", "solid", "sturdy", "quiet", "long", "bright",
    "superb", "crisp", "light", "portable", "worth"
}

NEGATIVE_THEME_INDICATORS = {
    "bad", "poor", "slow", "lag", "laggy", "heating", "overheating", "hot",
    "loud", "noise", "noisy", "flimsy", "terrible", "worst", "drain", "drains",
    "heavy", "issue", "issues", "cheap", "weak", "short"
}


class ThemeExtractor:
    """
    Extracts laptop themes mentioned in review text along with theme sentiment.
    """

    def extract_themes(self, review_title: str, review_text: str) -> list[dict]:
        full_text = f"{review_title or ''} {review_text or ''}".strip().lower()
        if not full_text:
            return []

        # Split full text into sentences to isolate theme sentiments
        sentences = re.split(r'[.!?;\n]+', full_text)
        extracted = {}

        for sentence in sentences:
            sentence_clean = sentence.strip()
            if not sentence_clean:
                continue

            words = set(re.findall(r'\b[a-z]+\b', sentence_clean))
            pos_count = sum(1 for w in words if w in POSITIVE_THEME_INDICATORS)
            neg_count = sum(1 for w in words if w in NEGATIVE_THEME_INDICATORS)

            # Determine sentence-level sentiment
            sentence_sentiment = "positive"
            if neg_count > pos_count:
                sentence_sentiment = "negative"
            elif pos_count > neg_count:
                sentence_sentiment = "positive"
            else:
                sentence_sentiment = "positive"

            # Check theme keyword matches
            for theme_name, keywords in THEME_KEYWORDS.items():
                if any(kw in sentence_clean for kw in keywords):
                    # Specific overrides for thermals / fan noise / heating keywords
                    if theme_name in ["Heating", "Fan Noise", "Thermals"]:
                        if any(k in sentence_clean for k in ["hot", "heating", "overheating", "loud", "noise", "whine", "warm"]):
                            theme_sentiment = "negative" if not any(k in sentence_clean for k in ["no heating", "cool", "quiet", "silent"]) else "positive"
                        else:
                            theme_sentiment = sentence_sentiment
                    else:
                        theme_sentiment = sentence_sentiment

                    if theme_name not in extracted:
                        extracted[theme_name] = theme_sentiment

        results = [{"theme": k, "sentiment": v} for k, v in extracted.items()]
        return results
