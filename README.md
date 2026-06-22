# 🛡️ Cyber Shield (Rakshak AI)

> **Empowering Citizens, Enabling Law Enforcement.** An intelligent, multi-agent AI platform designed to detect, analyze, and prevent modern fraud, scams, and cyber threats.

![Cyber Shield Platform](https://img.shields.io/badge/Status-Active_Development-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20FastAPI%20%7C%20Python-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 Elevator Pitch
In an era of hyper-realistic AI voice cloning, deepfake currency, and complex fraud rings, traditional security measures are falling behind. **Cyber Shield (Rakshak AI)** is an integrated threat intelligence platform. Using an ensemble of specialized AI agents, it detects voice spoofing, analyzes scam transcripts, verifies currency authenticity, maps fraud networks, and provides a conversational interface to protect citizens in real-time.

---

## 🚀 Key Features

*   **🎙️ Voice Intelligence Agent**: Detects AI-generated synthetic voices and unnatural patterns to prevent vishing (voice phishing) and impersonation scams.
*   **💬 Scam Analysis Agent**: Processes transcripts from calls, WhatsApp, or IVR to identify manipulative language, urgency cues, and fraud intent.
*   **💵 Currency Verification Agent**: Uses computer vision to verify the authenticity of currency images and detect counterfeits.
*   **🕸️ Fraud Network Mapping**: Visualizes complex, multi-node fraud syndicates and money mule networks for law enforcement.
*   **🗺️ Geospatial Crime Heatmaps**: Real-time hotspot mapping of cybercrime and fraud reports to predict and prevent localized spikes.
*   **🤖 Citizen Shield Chatbot**: A multilingual, conversational AI assistant that citizens can interact with to report crimes, verify suspicious links, and get immediate guidance.
*   **📊 Threat Fusion Center**: A master agent that aggregates intelligence from all specialized agents to generate a unified, actionable threat report.

---

## 🛠️ Tech Stack

### Frontend (React + Vite)
*   **Framework**: React 18 with Vite for blazing-fast builds.
*   **Styling**: Tailwind CSS & Framer Motion for rich, dynamic UI/UX.
*   **Data Visualization**: Recharts, React-Leaflet (Maps), React-Force-Graph (Network nodes).
*   **Icons**: Lucide React.

### Backend (Python + FastAPI)
*   **Framework**: FastAPI for high-performance, asynchronous REST APIs.
*   **AI/ML Integration**: Multi-agent architecture for parallel threat analysis.
*   **Environment**: Python 3.10+, Uvicorn.

---

## 💻 How to Run Locally

### Prerequisites
*   Node.js (v16+)
*   Python (3.8+)

### The Easy Way (Windows)
We have provided a convenient batch script to spin up both the frontend and backend simultaneously.
1. Double-click the `run_cybershield.bat` file in the project root.
2. The script will automatically start the FastAPI backend and the Vite frontend.
3. Your browser will automatically open at `http://localhost:3000`.

### The Manual Way

**1. Start the Backend API**
```bash
cd backend
python -m venv venv
# Activate virtual environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**2. Start the Frontend App**
```bash
cd frontend
npm install
npm run dev
```

---

## 🤝 Hackathon Submission Details

*   **Project Name**: Cyber Shield (Rakshak AI)
*   **Track/Category**: Cyber Security / AI for Good / Citizen Empowerment
*   **Team**: [Your Team Name]
*   **Video Demo**: [Link to Video]

> "Building a safer digital world, one API call at a time."
