import os
import csv
import networkx as nx
from networkx.algorithms.community import greedy_modularity_communities
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser

# Pre-baked multilingual intelligence packages for demo without API key
_MOCK_INTEL = {
    "Hindi": {
        "fraud_pattern": "सरकारी एजेंसियों का रूप धारण करके डिजिटल गिरफ्तारी और फिशिंग नेटवर्क जो साझा खच्चर खातों का उपयोग करता है।",
        "investigation_summary": "ग्राफ AI ने एक गंभीर धोखाधड़ी नेटवर्क का पता लगाया है जो कई पीड़ितों से धन को खच्चर खातों में एकत्रित करता है।",
        "recommended_actions": [
            "संबंधित बैंक खातों को तुरंत फ्रीज करें।",
            "प्राथमिक संदिग्ध के फोन नंबर पर टेलीकॉम ब्लॉक जारी करें।",
            "जुड़े उपकरणों के अंतिम ज्ञात टॉवर की ओर साइबर गश्ती भेजें।",
        ],
    },
    "Bengali": {
        "fraud_pattern": "সরকারি সংস্থার ছদ্মবেশে ডিজিটাল গ্রেফতার এবং ফিশিং নেটওয়ার্ক যা ভাগ করা মিউল অ্যাকাউন্ট ব্যবহার করে।",
        "investigation_summary": "গ্রাফ AI একটি গুরুতর জালিয়াতি নেটওয়ার্ক সনাক্ত করেছে যা একাধিক শিকার থেকে তহবিল সংগ্রহ করে।",
        "recommended_actions": [
            "সংশ্লিষ্ট ব্যাংক অ্যাকাউন্টগুলি তাৎক্ষণিকভাবে জমা করুন।",
            "প্রাথমিক সন্দেহভাজনের ফোনে টেলিকম ব্লক জারি করুন।",
            "সংযুক্ত ডিভাইসের শেষ পরিচিত টাওয়ারে সাইবার টহল পাঠান।",
        ],
    },
    "Tamil": {
        "fraud_pattern": "அரசு நிறுவனங்களை ஆள்மாறாடி டிஜிட்டல் கைது மற்றும் பிஷிங் நெட்வொர்க்.",
        "investigation_summary": "கிராஃப் AI பல பாதிக்கப்பட்டோரிடமிருந்து நிதி திரட்டும் ஒரு கடுமையான மோசடி வலையமைப்பை கண்டறிந்துள்ளது.",
        "recommended_actions": [
            "தொடர்புடைய வங்கி கணக்குகளை உடனடியாக முடக்கவும்.",
            "முதன்மை சந்தேகத்திற்குரியவரின் தொலைபேசியை தொலைத்தொடர்பு முடக்கவும்.",
            "இணைக்கப்பட்ட சாதனங்களுக்கு இணைய ரோந்து அனுப்பவும்.",
        ],
    },
    "Telugu": {
        "fraud_pattern": "ప్రభుత్వ సంస్థలను అనుకరిస్తూ డిజిటల్ అరెస్ట్ మరియు ఫిషింగ్ నెట్‌వర్క్.",
        "investigation_summary": "గ్రాఫ్ AI బహుళ బాధితుల నుండి నిధులను సేకరించే తీవ్రమైన మోసం నెట్‌వర్క్‌ను గుర్తించింది.",
        "recommended_actions": [
            "సంబంధిత బ్యాంక్ ఖాతాలను వెంటనే ఫ్రీజ్ చేయండి.",
            "ప్రాథమిక అనుమానిత ఫోన్‌కు టెలికామ్ బ్లాక్ జారీ చేయండి.",
            "అనుసంధానించబడిన పరికరాల చివరి స్థానానికి సైబర్ పెట్రోల్ పంపండి.",
        ],
    },
}


async def get_fraud_network(language: str = "English") -> dict:
    filepath = os.path.join(os.path.dirname(__file__), "..", "data", "fraud_dataset.csv")

    if not os.path.exists(filepath):
        return {"error": "Synthetic dataset not found. Run generate_synthetic_fraud.py first."}

    G = nx.Graph()
    total_amount = 0

    with open(filepath, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            v = row["victim_id"]
            p = row["phone"]
            b = row["bank_account"]
            d = row["device_id"]
            amount = int(row["amount"])
            total_amount += amount

            G.add_node(v, group=4, label=f"Victim {v}")
            G.add_node(p, group=1, label=f"Phone {p}")
            G.add_node(b, group=2, label=f"Bank {b}")
            G.add_node(d, group=3, label=f"Device {d}")

            G.add_edge(v, p)
            G.add_edge(p, b)
            G.add_edge(b, d)

    communities = list(greedy_modularity_communities(G))

    critical_cluster = []
    max_risk = 0
    best_cluster_stats = {}

    for i, comm in enumerate(communities):
        nodes = list(comm)
        victims = [n for n in nodes if n.startswith("V")]
        phones  = [n for n in nodes if n.startswith("P")]
        banks   = [n for n in nodes if n.startswith("B")]
        devices = [n for n in nodes if n.startswith("D")]

        score = 0
        if len(victims) > 5:   score += 40
        if len(banks)   > 0 and len(victims) > 1: score += 30
        if len(devices) > 0 and len(victims) > 1: score += 20
        if len(victims) > 2:   score += 10

        if score > max_risk:
            max_risk = score
            critical_cluster = nodes
            best_cluster_stats = {
                "id": f"FC-{i:03d}",
                "victims_count":  len(victims),
                "phones_count":   len(phones),
                "banks_count":    len(banks),
                "devices_count":  len(devices),
                "score":          score,
                "primary_suspect": phones[0] if phones else "Unknown",
            }

    nodes_data = [{"id": n, "group": G.nodes[n]["group"], "label": G.nodes[n]["label"]} for n in G.nodes()]
    links_data = [{"source": u, "target": v} for u, v in G.edges()]

    api_key = os.getenv("GOOGLE_API_KEY")

    if api_key:
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key)
        prompt = PromptTemplate(
            template="""
            You are an expert fraud analyst for Indian law enforcement.
            Analyze this fraud cluster detected by our Network Graph AI.

            Cluster Stats:
            Victims: {victims}
            Phones used: {phones}
            Mule Accounts: {banks}
            Devices (IMEI): {devices}
            Calculated Risk Score: {score}/100

            IMPORTANT: Respond ONLY in {language}. All text fields must be in {language}.

            Provide a valid JSON response with:
            - fraud_pattern: (1 sentence description of the organized ring, in {language})
            - investigation_summary: (2-3 sentences summarizing the threat, in {language})
            - recommended_actions: (list of 3 short action items for law enforcement, in {language})
            """,
            input_variables=["victims", "phones", "banks", "devices", "score", "language"],
        )
        chain = prompt | llm | JsonOutputParser()
        try:
            llm_analysis = chain.invoke({
                "victims":  best_cluster_stats["victims_count"],
                "phones":   best_cluster_stats["phones_count"],
                "banks":    best_cluster_stats["banks_count"],
                "devices":  best_cluster_stats["devices_count"],
                "score":    best_cluster_stats["score"],
                "language": language,
            })
        except Exception as e:
            llm_analysis = {
                "fraud_pattern": "Organized multi-victim funnel targeting multiple nodes.",
                "investigation_summary": f"Error parsing LLM: {e}",
                "recommended_actions": ["Freeze accounts", "Trace IMEIs", "Issue telecom block"],
            }
    else:
        # Use pre-baked multilingual mock or fall back to English
        lang_mock = _MOCK_INTEL.get(language)
        if lang_mock:
            llm_analysis = lang_mock
        else:
            v = best_cluster_stats.get('victims_count', 0)
            b = best_cluster_stats.get('banks_count', 0)
            d = best_cluster_stats.get('devices_count', 0)
            p = best_cluster_stats.get('primary_suspect', 'Unknown')
            llm_analysis = {
                "fraud_pattern": "Coordinated Digital Arrest and Phishing network using spoofed numbers and shared mule accounts.",
                "investigation_summary": f"Graph AI detected a severe fraud ring utilizing {d} devices to funnel funds from {v} victims into a consolidated set of {b} bank accounts.",
                "recommended_actions": [
                    "Immediately freeze Bank Account(s).",
                    f"Issue telecom block on Primary Suspect Phone {p}.",
                    "Dispatch cyber patrol to last known cell tower for connected devices.",
                ],
            }

    return {
        "nodes": nodes_data,
        "links": links_data,
        "intelligence_package": {
            "cluster_id": best_cluster_stats.get("id", "FC-000"),
            "risk_score":  best_cluster_stats.get("score", 0),
            "stats":       best_cluster_stats,
            "analysis":    llm_analysis,
        },
    }
