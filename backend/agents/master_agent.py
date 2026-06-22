import json
import os

# Pre-baked multilingual recent_alerts for fusion report mock
_ALERTS = {
    "Hindi": [
        "दिल्ली में बुजुर्गों को निशाना बनाने वाला डिजिटल गिरफ्तारी अभियान पाया गया।",
        "जामताड़ा क्लस्टर से CBI के नकली कॉल की उच्च संख्या।",
        "मुंबई में नकली Rs 500 के नोटों का नया बैच जब्त किया गया।",
    ],
    "Bengali": [
        "দিল্লিতে বৃদ্ধদের লক্ষ্য করে ডিজিটাল গ্রেফতার অভিযান শনাক্ত হয়েছে।",
        "জামতারা ক্লাস্টার থেকে নকল CBI কলের বেশি পরিমাণ।",
        "মুম্বাইয়ে নকল Rs 500 নোটের নতুন ব্যাচ আটক।",
    ],
    "Marathi": [
        "दिल्लीत वृद्धांना लक्ष्य करणारी डिजिटल अटक मोहीम आढळली।",
        "जामताड़ा क्लस्टरमधून CBI च्या बनावट कॉल्सची उच्च संख्या।",
        "मुंबईत बनावट Rs 500 नोटांचा नवीन बॅच जप्त.",
    ],
    "Telugu": [
        "ఢిల్లీలో వృద్ధులను లక్ష్యంగా చేసుకున్న డిజిటల్ అరెస్ట్ ప్రచారం గుర్తించబడింది.",
        "జామ్‌తారా క్లస్టర్ నుండి నకిలీ CBI కాల్‌ల అధిక సంఖ్య.",
        "ముంబైలో నకిలీ Rs 500 నోట్ల కొత్త బ్యాచ్ స్వాధీనం.",
    ],
    "Tamil": [
        "டெல்லியில் முதியவர்களை குறிவைக்கும் டிஜிட்டல் கைது பிரசாரம் கண்டறியப்பட்டது.",
        "ஜாம்தாரா கிளஸ்டரிலிருந்து போலி CBI அழைப்புகள் அதிகம்.",
        "மும்பையில் போலி Rs 500 நோட்டுகளின் புதிய தொகுப்பு கைப்பற்றப்பட்டது.",
    ],
    "Gujarati": [
        "દિલ્હીમાં વૃદ્ધોને નિશાન બનાવતી ડિジিটл ધરપકડ ઝુmbesh.",
        "Jamtara cluster থেকে CBI ফেক কলের উচ্চ সংখ্যা.",
        "Mumbai-মা નকली Rs 500 નોট્સ ζψηφιακ.",
    ],
    "Kannada": [
        "ದಿಲ್ಲಿಯಲ್ಲಿ ವೃದ್ಧರನ್ನು ಗುರಿ ಮಾಡಿದ ಡಿಜಿಟಲ್ ಬಂಧನ ಅಭಿಯಾನ ಪತ್ತೆ.",
        "ಜಾಮ್‌ತಾರಾ ಕ್ಲಸ್ಟರ್‌ನಿಂದ ನಕಲಿ CBI ಕರೆಗಳ ಹೆಚ್ಚಿನ ಸಂಖ್ಯೆ.",
        "ಮುಂಬೈನಲ್ಲಿ ನಕಲಿ Rs 500 ನೋಟ್‌ಗಳ ಹೊಸ ಬ್ಯಾಚ್ ವಶಪಡಿಸಿದೆ.",
    ],
    "Malayalam": [
        "ഡൽഹിയിൽ വൃദ്ധരെ ലക്ഷ്യം വെക്കുന്ന ഡിജിറ്റൽ അറസ്റ്റ് പ്രചാരണം കണ്ടെത്തി.",
        "ജാംതാറ ക്ലസ്റ്ററിൽ നിന്ന് വ്യാജ CBI കോളുകളുടെ ഉയർന്ന അളവ്.",
        "മുംബൈയിൽ വ്യാജ Rs 500 നോട്ടുകളുടെ പുതിയ ബാച്ച് പിടിച്ചു.",
    ],
    "Punjabi": [
        "ਦਿੱਲੀ ਵਿੱਚ ਬਜ਼ੁਰਗਾਂ ਨੂੰ ਨਿਸ਼ਾਨਾ ਬਣਾਉਂਦਾ ਡਿਜੀਟਲ ਗ੍ਰਿਫ਼ਤਾਰੀ ਮੁਹਿੰਮ ਮਿਲੀ।",
        "ਜਾਮਤਾੜਾ ਕਲਸਟਰ ਤੋਂ CBI ਦੇ ਨਕਲੀ ਕਾਲਾਂ ਦੀ ਉੱਚ ਗਿਣਤੀ।",
        "ਮੁੰਬਈ ਵਿੱਚ ਨਕਲੀ Rs 500 ਨੋਟਾਂ ਦੀ ਨਵੀਂ ਖੇਪ ਫੜੀ ਗਈ।",
    ],
    "Urdu": [
        "دہلی میں بزرگوں کو نشانہ بنانے والی ڈیجیٹل گرفتاری مہم کا پتہ چلا۔",
        "جامتاڑا کلسٹر سے جعلی CBI کالوں کی زیادہ تعداد۔",
        "ممبئی میں جعلی Rs 500 نوٹوں کا نیا بیچ ضبط۔",
    ],
    "Odia": [
        "ଦିଲ୍ଲୀରେ ବୃଦ୍ଧଙ୍କୁ ଲକ୍ଷ୍ୟ କରି ଡିଜିଟାଲ ଗ୍ରେଫ୍ତାର ଅଭିଯାନ ଚିହ୍ନଟ।",
        "ଜାମ୍ ‌ ‌ ‌ CBI ‌ ‌ ‌",
        "ମୁम्बईରେ ନକଲ Rs 500 ‌ ‌ ‌",
    ],
    "Assamese": [
        "দিল্লীত বৃদ্ধসকলক লক্ষ্য কৰা ডিজিটেল গ্ৰেপ্তাৰ অভিযান ধৰা পৰিছে।",
        "জামতাড়া ক্লাষ্টাৰৰ পৰা নকল CBI কলৰ উচ্চ সংখ্যা।",
        "মুম্বাইত নকল Rs 500 নোটৰ নতুন বেচ জব্দ।",
    ],
}


async def generate_threat_fusion_report(language: str = "English") -> dict:
    filepath = os.path.join(os.path.dirname(__file__), "..", "data", "mock_data.json")
    try:
        with open(filepath, "r") as f:
            data = json.load(f)
            report = data.get("threat_fusion", {})
    except Exception:
        report = {
            "overall_threat_level": "CRITICAL",
            "active_scam_campaigns": 3,
            "money_mule_accounts_flagged": 42,
            "counterfeit_circulation_index": 0.85,
            "recent_alerts": [
                "Digital Arrest campaign detected targeting elderly in Delhi.",
                "High volume of spoofed CBI calls from Jamtara cluster.",
                "New batch of counterfeit Rs 500 notes intercepted in Mumbai.",
            ],
        }

    # Translate recent_alerts if language has pre-baked translations
    translated_alerts = _ALERTS.get(language)
    if translated_alerts:
        report = dict(report)  # shallow copy to avoid mutating cache
        report["recent_alerts"] = translated_alerts

    return report
