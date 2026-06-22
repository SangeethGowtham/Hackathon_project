import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage

# In a real app we'd use LangChain's memory or LangGraph's StateGraph to persist state.
# Here we keep a simple mock memory dict for demo purposes.
session_memory = {}

SYSTEM_PROMPT_TEMPLATE = """You are Cyber Shield, an official Citizen Shield assistant by the Government of India.
Your core capability is to walk citizens through real-time fraud risk assessment for suspicious calls, payment requests, or messages.

INSTRUCTIONS:
1. Provide instant verdicts on whether a situation is a scam (e.g., Digital Arrest, Phishing).
2. Guide victims step-by-step on how to report to the NCRB portal (cybercrime.gov.in) or call 1930.
3. CRITICAL: The user has selected the {language} language. You MUST reply entirely in {language}.
4. Keep answers concise, empathetic, and highly actionable.
"""

async def chat_with_citizen(message: str, session_id: str, language: str = "English") -> dict:
    api_key = os.getenv("GOOGLE_API_KEY")

    if not api_key:
        # Smart mocked responses based on keywords for demo without API key
        msg_lower = message.lower()
        if any(kw in msg_lower for kw in ["cbi", "arrest", "police", "aadhaar", "money laundering", "गिरफ्तारी", "গ্রেফতার"]):
            reply = (f"[Mocking response in {language}]\n🚨 SCAM ALERT: This is a 'Digital Arrest' scam! No government agency calls citizens "
                     "to arrest them over phone. Do NOT pay any money.\n\n"
                     "✅ Steps:\n1. Hang up immediately.\n2. Block the number.\n"
                     "3. Report at https://cybercrime.gov.in or call 1930.\n"
                     "4. Inform your family.\n\nYou are safe. This is 100% fraud.")
        elif any(kw in msg_lower for kw in ["otp", "password", "pin", "qr", "scan"]):
            reply = (f"[Mocking response in {language}]\n⚠️ FRAUD WARNING: Never share OTP, PIN, or scan QR codes from unknown sources. "
                     "Legitimate agencies will NEVER ask for these.\n\n"
                     "If you already shared, immediately:\n1. Call your bank to freeze your account.\n"
                     "2. Call 1930 (Cyber Crime Helpline).\n3. Change all passwords.")
        elif any(kw in msg_lower for kw in ["electricity", "bill", "power cut", "disconnect"]):
            reply = (f"[Mocking response in {language}]\n⚠️ SCAM DETECTED: Electricity boards do NOT send WhatsApp messages threatening "
                     "disconnection. This is a phishing attack.\n\n"
                     "Do NOT click any link. Report it at https://cybercrime.gov.in")
        elif any(kw in msg_lower for kw in ["olx", "buy", "sell", "payment", "upi"]):
            reply = (f"[Mocking response in {language}]\n🚨 UPI FRAUD ALERT: On platforms like OLX, you should RECEIVE money, not scan a QR code. "
                     "Scanning a QR code SENDS money FROM your account.\n\n"
                     "Never scan QR codes to 'receive' payments. This is a common scam.")
        else:
            reply = (f"[Mocking response in {language}]\nNamaste! I am Cyber Shield. I can help you identify scams and fraud. "
                     "Please describe the suspicious call, message, or payment request you received, "
                     "and I will assess the threat level instantly.\n\n"
                     "💡 Tip: Set your GOOGLE_API_KEY in the backend .env file to unlock full AI capabilities!")
        return {"reply": reply, "session_id": session_id}

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key, max_retries=1, timeout=10.0)

    if session_id not in session_memory:
        sys_msg = SYSTEM_PROMPT_TEMPLATE.format(language=language)
        session_memory[session_id] = [
            SystemMessage(content=sys_msg)
        ]

    session_memory[session_id].append(HumanMessage(content=message))

    try:
        response = llm.invoke(session_memory[session_id])
        session_memory[session_id].append(response)

        return {
            "reply": response.content,
            "session_id": session_id
        }
    except Exception as e:
        # If API key is invalid or rate limited, fall back to smart mocks instead of hanging/erroring out
        msg_lower = message.lower()
        if any(kw in msg_lower for kw in ["cbi", "arrest", "police", "aadhaar", "money laundering", "गिरफ्तारी", "গ্রেফতার"]):
            reply = (f"[Fallback response in {language}]\n🚨 SCAM ALERT: This is a 'Digital Arrest' scam! No government agency calls citizens "
                     "to arrest them over phone. Do NOT pay any money.\n\n"
                     "✅ Steps:\n1. Hang up immediately.\n2. Block the number.\n"
                     "3. Report at https://cybercrime.gov.in or call 1930.\n"
                     "4. Inform your family.\n\nYou are safe. This is 100% fraud.")
        elif any(kw in msg_lower for kw in ["otp", "password", "pin", "qr", "scan"]):
            reply = (f"[Fallback response in {language}]\n⚠️ FRAUD WARNING: Never share OTP, PIN, or scan QR codes from unknown sources. "
                     "Legitimate agencies will NEVER ask for these.\n\n"
                     "If you already shared, immediately:\n1. Call your bank to freeze your account.\n"
                     "2. Call 1930 (Cyber Crime Helpline).\n3. Change all passwords.")
        else:
            reply = (f"[Fallback response in {language}]\nNamaste! I am Cyber Shield. The live AI model is currently unreachable (Error: {str(e)[:50]}...), "
                     "but I can still help you identify common scams based on keywords. "
                     "Please describe the suspicious call, message, or payment request you received.")
                     
        return {
            "reply": reply,
            "session_id": session_id
        }
