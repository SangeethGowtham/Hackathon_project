import json
import os

# Risk level translations for map popups
_RISK_LABELS = {
    "Hindi":     {"Critical": "अत्यंत खतरनाक", "High": "उच्च", "Medium": "मध्यम"},
    "Bengali":   {"Critical": "সংকটজনক",       "High": "উচ্চ",  "Medium": "মাঝারি"},
    "Marathi":   {"Critical": "अत्यंत धोकादायक", "High": "उच्च", "Medium": "मध्यम"},
    "Telugu":    {"Critical": "క్రిటికల్",       "High": "అధిక", "Medium": "మధ్యస్థ"},
    "Tamil":     {"Critical": "மிக ஆபத்தானது",  "High": "அதிகம்", "Medium": "நடுத்தரம்"},
    "Gujarati":  {"Critical": "ખૂબ ખતરનાક",    "High": "ઉચ્ચ",  "Medium": "મધ્યમ"},
    "Urdu":      {"Critical": "نازک",           "High": "زیادہ", "Medium": "درمیانہ"},
    "Kannada":   {"Critical": "ಅತ್ಯಂತ ಅಪಾಯ",  "High": "ಹೆಚ್ಚು", "Medium": "ಮಧ್ಯಮ"},
    "Odia":      {"Critical": "ଅତ୍ୟନ୍ତ ବିପଜ୍ଜନକ", "High": "ଉଚ୍ଚ", "Medium": "ମଧ୍ୟମ"},
    "Malayalam": {"Critical": "ഗുരുതര",         "High": "ഉയർന്ന", "Medium": "ഇടത്തരം"},
    "Punjabi":   {"Critical": "ਨਾਜ਼ੁਕ",         "High": "ਉੱਚ",  "Medium": "ਦਰਮਿਆਨਾ"},
    "Assamese":  {"Critical": "সংকটজনক",        "High": "উচ্চ",  "Medium": "মধ্যম"},
}


async def get_crime_hotspots(language: str = "English") -> list:
    filepath = os.path.join(os.path.dirname(__file__), "..", "data", "mock_data.json")
    try:
        with open(filepath, "r") as f:
            data = json.load(f)
            points = data.get("geospatial", [])
    except Exception as e:
        points = [
            {"lat": 28.6139, "lng": 77.2090, "city": "New Delhi", "risk": "High",     "incidents": 120},
            {"lat": 24.0374, "lng": 86.9940, "city": "Jamtara",   "risk": "Critical", "incidents": 340},
            {"lat": 27.8837, "lng": 77.0195, "city": "Mewat",     "risk": "Critical", "incidents": 210},
            {"lat": 19.0760, "lng": 72.8777, "city": "Mumbai",    "risk": "Medium",   "incidents": 85},
            {"lat": 12.9716, "lng": 77.5946, "city": "Bangalore", "risk": "High",     "incidents": 150},
        ]

    # Translate risk labels if a non-English language is requested
    risk_map = _RISK_LABELS.get(language)
    if risk_map:
        for point in points:
            original_risk = point.get("risk", "Medium")
            point["risk"] = risk_map.get(original_risk, original_risk)
            # Keep the original English key for frontend color-coding
            point["risk_en"] = original_risk

    return points
