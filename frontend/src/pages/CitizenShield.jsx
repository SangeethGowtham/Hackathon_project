import { useState, useRef, useEffect } from 'react';
import {
  Shield, Send, User, Bot, AlertTriangle, PhoneCall,
  Smartphone, ShieldCheck, ExternalLink, MessageCircle,
} from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

export default function CitizenShield() {
  const { t, geminiLang, langCode } = useLanguage();

  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content:
        'Namaste! I am Cyber Shield, your official fraud protection assistant. I can assess suspicious calls, messages, or payment requests in 12 regional languages. How can I protect you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/agents/citizen', {
        message: userMsg,
        session_id: sessionId,
        language: geminiLang,
      });
      setMessages((prev) => [...prev, { role: 'bot', content: response.data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content:
            'There was a problem connecting to the AI securely. Please make sure the backend is running.',
        },
      ]);
    }
    setLoading(false);
  };

  const handleQuickAction = (text) => setInput(text);

  const isHighRisk = (text) => {
    const keywords = [
      'scam', 'fraud', 'digital arrest', 'do not pay', 'fake', 'impersonat',
      'report immediately', 'घोटाला', 'धोखा', 'गिरफ्तारी', 'প্রতারণা', 'ডিজিটাল গ্রেফতার',
    ];
    return keywords.some((k) => text.toLowerCase().includes(k));
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6">

      {/* Sidebar */}
      <div className="w-80 shrink-0 flex flex-col gap-6">
        <div className="glass-panel p-6 border-b-4 border-indigo-500 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-indigo-400" />
            <h1 className="text-xl font-bold">{t('citizen.heading')}</h1>
          </div>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            {t('citizen.subheading')}
          </p>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {t('citizen.availableChannels')}
            </h3>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Smartphone className="w-4 h-4 text-green-400" /> WhatsApp Bot
              </div>
              <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <PhoneCall className="w-4 h-4 text-blue-400" /> IVR Helpline
              </div>
              <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <div className="flex items-center gap-3 text-sm text-indigo-300 font-bold">
                <MessageCircle className="w-4 h-4 text-indigo-400" /> Web App
              </div>
              <span className="text-xs text-indigo-400 bg-indigo-500/20 px-2 py-1 rounded-full border border-indigo-500/30">Current</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl flex-1 flex flex-col">
          {/* Language indicator — shows what's active from global switcher */}
          <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center gap-2">
            <span className="text-indigo-300 text-xs font-bold uppercase tracking-wider">
              🌐 {t('common.language')}:
            </span>
            <span className="text-indigo-200 text-sm font-semibold">{geminiLang}</span>
            <span className="ml-auto text-xs text-slate-400">(Change in sidebar)</span>
          </div>

          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            {t('citizen.quickScenarios')}
          </h3>
          <div className="space-y-2 flex-1">
            <button
              onClick={() =>
                handleQuickAction(
                  'I got a call saying my Aadhaar is used for money laundering and CBI will arrest me. Is this real?'
                )
              }
              className="w-full text-left p-3 text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            >
              🚔 CBI / Digital Arrest Call
            </button>
            <button
              onClick={() =>
                handleQuickAction(
                  'Someone sent me a link on WhatsApp to update my electricity bill or power will be cut tonight.'
                )
              }
              className="w-full text-left p-3 text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            >
              ⚡ Electricity Bill Threat
            </button>
            <button
              onClick={() =>
                handleQuickAction(
                  'A guy is buying my sofa on OLX and wants me to scan a QR code to receive the payment. Should I do it?'
                )
              }
              className="w-full text-left p-3 text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            >
              📱 OLX QR Code Payment
            </button>
            <button
              onClick={() =>
                handleQuickAction(
                  'मुझे एक अजनबी ने WhatsApp पर मैसेज किया है कि मेरा पार्सल पकड़ा गया है और मुझे अभी पैसे देने होंगे।'
                )
              }
              className="w-full text-left p-3 text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            >
              📦 FedEx / Parcel Scam (Hindi)
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 glass-panel rounded-xl flex flex-col relative overflow-hidden border border-slate-700/50">

        {/* Chat Header */}
        <div className="absolute top-0 w-full h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center px-6 z-10 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100">{t('citizen.botName')}</h2>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                {t('citizen.secureSession')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-800 rounded-md text-xs border border-slate-700 text-slate-400 font-mono">
              🌐 {geminiLang.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 pt-24 space-y-6">
          {messages.map((msg, idx) => {
            const isBot = msg.role === 'bot';
            const showNcrbBtn = isBot && isHighRisk(msg.content);

            return (
              <div key={idx} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex max-w-[80%] gap-4 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isBot ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div
                      className={`p-4 rounded-2xl ${
                        isBot
                          ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'
                          : 'bg-indigo-600 text-white rounded-tr-sm shadow-lg shadow-indigo-600/20'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    </div>

                    {showNcrbBtn && (
                      <div className="flex items-center gap-3 animate-fade-in">
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between w-full shadow-lg shadow-red-500/5">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <div>
                              <p className="text-sm font-bold text-red-400">
                                {t('citizen.highRiskDetected')}
                              </p>
                              <p className="text-xs text-slate-400">Immediate reporting recommended</p>
                            </div>
                          </div>
                          <a
                            href="https://cybercrime.gov.in"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors ml-3"
                          >
                            {t('citizen.reportToNcrb')} <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-4 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`${t('citizen.placeholder')} (${geminiLang})`}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="mt-3 text-center">
            <p className="text-xs text-slate-500">{t('citizen.emergencyTip')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
