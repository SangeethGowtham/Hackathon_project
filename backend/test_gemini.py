import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
print(f"API Key loaded: {api_key[:5]}...")

llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key, max_retries=1, timeout=10.0)

try:
    response = llm.invoke("Hello")
    print("Success! Response:", response.content)
except Exception as e:
    print("Error:", repr(e))
