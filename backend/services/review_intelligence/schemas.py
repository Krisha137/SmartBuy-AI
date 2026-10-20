"""
Schema definitions, Laptop theme lists, and Confidence thresholds for Review Intelligence.
"""

LAPTOP_THEMES = [
    "Performance",
    "Battery",
    "Display",
    "Build Quality",
    "Keyboard",
    "Trackpad",
    "Thermals",
    "Heating",
    "Fan Noise",
    "Portability",
    "Design",
    "Value for Money",
    "Gaming",
    "Software",
    "Operating System",
    "Connectivity",
    "Storage",
    "RAM",
    "Customer Support",
    "Other"
]

THEME_KEYWORDS = {
    "Performance": ["performance", "fast", "speed", "processor", "cpu", "snappy", "lag", "slow", "smooth"],
    "Battery": ["battery", "charge", "charging", "endurance", "drain", "drains", "backup", "lasting"],
    "Display": ["display", "screen", "resolution", "ips", "oled", "panel", "brightness", "color", "colors", "viewing angles"],
    "Build Quality": ["build", "chassis", "sturdy", "hinge", "material", "durable", "flimsy", "premiumfeel"],
    "Keyboard": ["keyboard", "typing", "keys", "tactile", "key travel", "backlit", "backlight"],
    "Trackpad": ["trackpad", "touchpad", "gesture", "gestures", "pointer"],
    "Thermals": ["thermal", "thermals", "temperature", "heat dissipation"],
    "Heating": ["heating", "hot", "heats up", "overheating", "warm"],
    "Fan Noise": ["fan", "noise", "noisy", "loud fan", "whine", "spinning"],
    "Portability": ["lightweight", "light weight", "heavy", "portable", "weight", "carry", "travel"],
    "Design": ["design", "look", "looks", "aesthetic", "sleek", "finish"],
    "Value for Money": ["value", "price", "worth", "affordable", "cost", "expensive", "deal"],
    "Gaming": ["gaming", "game", "games", "fps", "gpu", "graphics", "rtx", "gtx", "frame rate"],
    "Software": ["software", "bloatware", "driver", "drivers", "app"],
    "Operating System": ["windows", "macos", "os", "linux"],
    "Connectivity": ["wifi", "wi-fi", "bluetooth", "ports", "hdmi", "usb"],
    "Storage": ["ssd", "hdd", "storage", "drive", "read speed"],
    "RAM": ["ram", "memory", "multitasking"],
    "Customer Support": ["service", "support", "warranty", "replacement", "repair"],
}

# Configurable volume thresholds for review evidence confidence
CONFIDENCE_THRESHOLDS = {
    "LOW_MAX": 4,      # 0 to 4 reviews -> low confidence
    "MEDIUM_MAX": 19,  # 5 to 19 reviews -> medium confidence
    # 20+ reviews -> high confidence
}
