import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser

# Pre-baked multilingual mock responses for common scam keywords
_MOCK_SCAM_RESPONSES = {
    "Hindi": {
        "scam": {
            "threat_score": 95,
            "is_scam": True,
            "patterns_detected": ["सरकारी प्रतिरूपण", "डिजिटल गिरफ्तारी का खतरा", "अत्यावश्यकता में हेराफेरी"],
            "recommended_action": "तुरंत कॉल काटें और 1930 पर कॉल करें। cybercrime.gov.in पर रिपोर्ट करें।",
        },
        "safe": {
            "threat_score": 12,
            "is_scam": False,
            "patterns_detected": ["सामान्य बातचीत"],
            "recommended_action": "कोई कार्रवाई आवश्यक नहीं।",
        },
    },
    "Bengali": {
        "scam": {
            "threat_score": 95,
            "is_scam": True,
            "patterns_detected": ["সরকারি ছদ্মবেশ", "ডিজিটাল গ্রেফতারের হুমকি", "জরুরি অবস্থার চাপ"],
            "recommended_action": "অবিলম্বে কল কাটুন এবং 1930 নম্বরে ফোন করুন। cybercrime.gov.in-এ রিপোর্ট করুন।",
        },
        "safe": {
            "threat_score": 12,
            "is_scam": False,
            "patterns_detected": ["স্বাভাবিক কথোপকথন"],
            "recommended_action": "কোনো পদক্ষেপের প্রয়োজন নেই।",
        },
    },
    "Tamil": {
        "scam": {
            "threat_score": 95,
            "is_scam": True,
            "patterns_detected": ["அரசு ஆள்மாறாட்டம்", "டிஜிட்டல் கைது அச்சுறுத்தல்", "அவசர கட்டாயம்"],
            "recommended_action": "உடனே அழைப்பை துண்டிக்கவும், 1930 ஐ அழைக்கவும். cybercrime.gov.in இல் புகார் அளிக்கவும்.",
        },
        "safe": {
            "threat_score": 12,
            "is_scam": False,
            "patterns_detected": ["சாதாரண உரையாடல்"],
            "recommended_action": "எந்த நடவடிக்கையும் தேவையில்லை.",
        },
    },
    "Telugu": {
        "scam": {
            "threat_score": 95,
            "is_scam": True,
            "patterns_detected": ["ప్రభుత్వ వేషధారణ", "డిజిటల్ అరెస్ట్ బెదిరింపు", "అత్యవసర మోసం"],
            "recommended_action": "వెంటనే కాల్ తెంచుకోండి, 1930కి కాల్ చేయండి. cybercrime.gov.in లో నివేదించండి.",
        },
        "safe": {
            "threat_score": 12,
            "is_scam": False,
            "patterns_detected": ["సాధారణ సంభాషణ"],
            "recommended_action": "ఎటువంటి చర్య అవసరం లేదు.",
        },
    },
}


async def analyze_scam_transcript(transcript: str, language: str = "English") -> dict:
    api_key = os.getenv("GOOGLE_API_KEY")

    if not api_key:
        # Detect scam from keywords
        is_scam = any(
            kw in transcript.upper()
            for kw in ["CBI", "ARREST", "CUSTOMS", "ED ", "MONEY LAUNDERING", "गिरफ्तारी", "গ্রেফতার"]
        )

        # Try to return language-specific mock; fallback to English
        lang_mocks = _MOCK_SCAM_RESPONSES.get(language, {})
        if is_scam:
            return lang_mocks.get("scam", {
                "threat_score": 95,
                "is_scam": True,
                "patterns_detected": ["Government Impersonation", "Urgency Manipulation", "Digital Arrest Threat"],
                "recommended_action": "Block number and report to NCRB immediately at cybercrime.gov.in or call 1930.",
            })
        else:
            return lang_mocks.get("safe", {
                "threat_score": 12,
                "is_scam": False,
                "patterns_detected": ["Routine Conversation"],
                "recommended_action": "No action needed.",
            })

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key)

    prompt = PromptTemplate(
        template="""
        You are an expert fraud analyst for Indian law enforcement.
        Analyze the following call transcript for 'Digital Arrest' scam patterns.
        Digital arrest scams often involve impersonating CBI, ED, Customs, or Police,
        creating fake urgency, demanding money to avoid arrest, or requesting isolation.

        IMPORTANT: Respond ONLY in {language}. All text fields in the JSON must be written in {language}.

        Transcript: {transcript}

        Respond ONLY with a valid JSON object containing:
        - threat_score: (integer 0-100)
        - is_scam: (boolean)
        - patterns_detected: (list of strings describing detected patterns, in {language})
        - recommended_action: (string advice for the victim, in {language})
        """,
        input_variables=["transcript", "language"],
    )

    chain = prompt | llm | JsonOutputParser()
    try:
        res = chain.invoke({"transcript": transcript, "language": language})
        return res
    except Exception as e:
        return {
            "error": str(e),
            "is_scam": True,
            "threat_score": 90,
            "patterns_detected": ["Error parsing — assuming High Risk for safety"],
            "recommended_action": "Call 1930 immediately.",
        }
