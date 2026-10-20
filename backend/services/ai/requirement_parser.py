"""
Rule-Based / Deterministic NLP Requirement Parser for SmartBuy AI.
Provides fallback natural-language requirement extraction when LLM API is offline or unconfigured.
"""

import re
from services.inr_parser import extract_inr_budget, parse_inr_expression
from .schemas import VALID_BRANDS, VALID_USE_CASES, VALID_STORAGE_TYPES


class RuleBasedRequirementParser:
    """
    Deterministic requirement parser utilizing regular expressions,
    dictionary matching, and domain heuristics.
    """

    UNSUPPORTED_KEYWORDS = [
        ("fingerprint sensor", ["fingerprint", "finger print"]),
        ("touchscreen", ["touchscreen", "touch screen", "touch display"]),
        ("thunderbolt port", ["thunderbolt", "thunder bolt"]),
        ("webcam resolution", ["1080p webcam", "4k webcam", "hd webcam"]),
        ("rgb keyboard", ["rgb keyboard", "per-key rgb"]),
        ("stylus support", ["stylus", "pen support"]),
    ]

    VAGUE_PATTERNS = [
        r"^i (?:need|want|am looking for) a (?:good|best|nice|fine) laptop\.?$",
        r"^show me (?:a|some) (?:good )?laptops?\.?$",
        r"^i need a laptop\.?$",
        r"^what is the best laptop\??$"
    ]

    MEANINGFUL_KEYWORDS = [
        'ram', 'ssd', 'hdd', 'gb', 'tb', 'k', 'lakh', 'gaming', 'coding', 'budget',
        'under', 'between', 'above', 'below', '₹', 'rs', 'inr', 'video', 'editing',
        'design', 'business', 'office', 'productivity', 'data', 'science', 'ai',
        'intel', 'amd', 'nvidia', 'rtx', 'gtx', 'ryzen', 'core', 'i3', 'i5', 'i7',
        'i9', 'm1', 'm2', 'm3', 'macbook', 'dell', 'hp', 'lenovo', 'asus', 'acer',
        'apple', 'thinkpad', 'inspiron', 'student', 'college', 'portable', 'light'
    ]

    def parse(self, query: str) -> dict:
        text = query.strip()
        text_lower = text.lower()

        # Check explicit vague / highly ambiguous query
        is_explicitly_vague = any(re.match(pattern, text_lower) for pattern in self.VAGUE_PATTERNS)
        has_meaningful_content = any(kw in text_lower for kw in self.MEANINGFUL_KEYWORDS)

        # Only require clarification if truly vague and lacking any brand/spec/workflow context
        if is_explicitly_vague or (len(text_lower.split()) <= 1 and not has_meaningful_content):
            return {
                "status": "needs_clarification",
                "requirements": {
                    "category": "Laptop",
                    "budget_min": None,
                    "budget_max": None,
                    "use_case": None,
                    "minimum_ram": None,
                    "minimum_storage": None,
                    "preferred_storage_type": None,
                    "battery_priority": None,
                    "performance_priority": None,
                    "weight_priority": None,
                    "brand_preference": None
                },
                "unsupported_requirements": [],
                "clarification_questions": [
                    "What is your maximum budget in INR?",
                    "What is your primary use case (Programming, Gaming, Everyday, Professional, Design, Business, Data Science)?"
                ]
            }

        # 1. Budget extraction
        b_min, b_max = extract_inr_budget(text)

        # 2. RAM extraction
        minimum_ram = None
        # Pattern: 16gb, 16 gb, 16 gig, 16 gigs, at least 16gb, minimum 16gb
        ram_match = re.search(r'(?:at least|minimum|need|with)?\s*(\d+)\s*(?:gb|gigs|gig)\s*(?:ram|memory)?', text_lower)
        if ram_match:
            val = int(ram_match.group(1))
            if val in [4, 8, 12, 16, 24, 32, 64]:
                minimum_ram = val

        # 3. Storage extraction
        minimum_storage = None
        preferred_storage_type = None

        tb_match = re.search(r'(\d+)\s*tb\b', text_lower)
        if tb_match:
            minimum_storage = int(tb_match.group(1)) * 1024
        else:
            gb_matches = re.finditer(r'(\d+)\s*gb\b(?:\s*(ssd|hdd|emmc|storage|drive))?', text_lower)
            for m in gb_matches:
                val = int(m.group(1))
                has_tag = bool(m.group(2))
                if val >= 128 or has_tag:
                    minimum_storage = val
                    break

        # Storage type
        if 'ssd' in text_lower:
            preferred_storage_type = 'SSD'
        elif 'hdd' in text_lower:
            preferred_storage_type = 'HDD'
        elif 'emmc' in text_lower:
            preferred_storage_type = 'eMMC'

        # 4. Use Case detection
        use_case = None
        if any(kw in text_lower for kw in ['programming', 'coding', 'code', 'developer', 'development', 'python', 'java', 'django', 'react', 'cs student', 'computer science']):
            use_case = 'Programming'
        elif any(kw in text_lower for kw in ['gaming', 'game', 'games', 'play aaa', 'gamer']):
            use_case = 'Gaming'
        elif any(kw in text_lower for kw in ['video editing', 'video', 'design', 'rendering', 'photoshop', 'premiere', 'blender', 'creative', 'graphic design', 'animation']):
            use_case = 'Design & Video'
        elif any(kw in text_lower for kw in ['business productivity', 'business', 'office', 'productivity', 'corporate', 'excel', 'word', 'management']):
            use_case = 'Business & Office'
        elif any(kw in text_lower for kw in ['data science', 'machine learning', 'deep learning', 'jupyter', 'data analysis', 'nlp']):
            use_case = 'Data Science & AI'
        elif any(kw in text_lower for kw in ['everyday', 'daily', 'browsing', 'college', 'student laptop', 'student', 'school', 'movies', 'youtube', 'student use']):
            use_case = 'Everyday'
        elif any(kw in text_lower for kw in ['professional', 'workstation', 'heavy workload']):
            use_case = 'Professional'

        # 5. Priorities
        battery_priority = None
        if any(kw in text_lower for kw in ['good battery', 'long battery', 'battery life', 'battery is important', 'high battery']):
            battery_priority = 'high'

        weight_priority = None
        if any(kw in text_lower for kw in ['lightweight', 'light weight', 'portable', 'easy to carry', 'thin and light', 'light']):
            weight_priority = 'high'

        performance_priority = None
        if any(kw in text_lower for kw in ['good performance', 'strong performance', 'fast', 'powerful', 'high performance']):
            performance_priority = 'high'

        # 6. Brand preference
        brand_preference = None
        for brand in VALID_BRANDS:
            if re.search(r'\b' + re.escape(brand.lower()) + r'\b', text_lower):
                brand_preference = brand
                break

        # 7. Unsupported requirements
        unsupported = []
        for feature_name, keywords in self.UNSUPPORTED_KEYWORDS:
            if any(kw in text_lower for kw in keywords):
                unsupported.append(feature_name)

        return {
            "status": "clear",
            "requirements": {
                "category": "Laptop",
                "budget_min": b_min,
                "budget_max": b_max,
                "use_case": use_case,
                "minimum_ram": minimum_ram,
                "minimum_storage": minimum_storage,
                "preferred_storage_type": preferred_storage_type,
                "battery_priority": battery_priority,
                "performance_priority": performance_priority,
                "weight_priority": weight_priority,
                "brand_preference": brand_preference
            },
            "unsupported_requirements": unsupported,
            "clarification_questions": []
        }
