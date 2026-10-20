"""
Sentiment classification module for SmartBuy AI Review Intelligence.
Analyzes review title, text, and rating to assign review-level sentiment.
"""

import re

POSITIVE_LEXICON = {
    "excellent", "amazing", "great", "good", "fast", "awesome", "love", "loved",
    "smooth", "perfect", "superb", "fantastic", "flawless", "sturdy", "impressive",
    "satisfied", "worth", "best", "blazing", "vibrant", "quiet", "decent", "solid"
}

NEGATIVE_LEXICON = {
    "terrible", "poor", "bad", "slow", "horrible", "awful", "disappointed", "lag",
    "laggy", "heating", "overheating", "loud", "noisy", "flimsy", "worst", "drain",
    "drains", "issue", "issues", "defective", "broken", "return", "refund", "regret"
}


class SentimentClassifier:
    """
    Classifies review sentiment as 'positive', 'neutral', 'negative', or 'empty'.
    Does not modify original numerical ratings.
    """

    def classify_review(self, review_title: str, review_text: str, rating: float) -> str:
        title_str = (review_title or "").strip()
        text_str = (review_text or "").strip()
        full_text = f"{title_str} {text_str}".strip().lower()

        if not full_text:
            return "empty"

        words = re.findall(r'\b[a-z]+\b', full_text)
        pos_words = sum(1 for w in words if w in POSITIVE_LEXICON)
        neg_words = sum(1 for w in words if w in NEGATIVE_LEXICON)

        # Base sentiment from rating
        # Rating 4.0 - 5.0 -> Positive leaning
        # Rating 1.0 - 2.0 -> Negative leaning
        # Rating 3.0 -> Neutral leaning
        rating_val = float(rating)

        if rating_val >= 4.0:
            if neg_words > pos_words + 2:
                return "neutral"
            return "positive"
        elif rating_val <= 2.0:
            if pos_words > neg_words + 2:
                return "neutral"
            return "negative"
        else:  # rating == 3.0
            if pos_words > neg_words + 1:
                return "positive"
            elif neg_words > pos_words + 1:
                return "negative"
            return "neutral"
