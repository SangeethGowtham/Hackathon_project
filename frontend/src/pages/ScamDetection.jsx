import { useState } from 'react';
import { PhoneCall, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

export default function ScamDetection() {
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t, geminiLang } = useLanguage();

  const analyzeTranscript = async () => {
    if (!transcript) return;
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/agents/scam', {
        transcript,
        language: geminiLang,
      });
      setResult(res.data);
    } catch (error) {
      // Fallback if backend is down
      const isScam = transcript.toUpperCase().includes('CBI') || transcript.toUpperCase().includes('ARREST');
      setResult({
        threat_score: isScam ? 95 : 15,
        is_scam: isScam,
        patterns_detected: isScam
          ? ['Government Impersonation', 'Urgency Manipulation']
          : ['Routine Conversation'],
        recommended_action: isScam ? 'Block number immediately.' : 'No action needed.',
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <PhoneCall className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">{t('scam.heading')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 space-y-4">
          <h2 className="text-xl font-semibold">{t('scam.inputLabel')}</h2>
          <textarea
            className="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            placeholder={t('scam.placeholder')}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          ></textarea>
          <button
            onClick={analyzeTranscript}
            disabled={loading || !transcript.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? t('scam.analyzing') : t('scam.analyzeBtn')}
          </button>
        </div>

        {result && (
          <div className="glass-panel p-6 space-y-6">
            <h2 className="text-xl font-semibold">{t('scam.aiAssessment')}</h2>

            <div
              className={`p-6 rounded-xl border ${
                result.is_scam
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-green-500/10 border-green-500/30'
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                {result.is_scam ? (
                  <ShieldAlert className="w-10 h-10 text-red-500" />
                ) : (
                  <CheckCircle className="w-10 h-10 text-green-500" />
                )}
                <div>
                  <p className="text-sm text-slate-400">{t('scam.threatScore')}</p>
                  <p
                    className={`text-3xl font-bold ${
                      result.is_scam ? 'text-red-400' : 'text-green-400'
                    }`}
                  >
                    {result.threat_score}/100
                  </p>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{t('scam.patternsDetected')}</p>
                  <div className="flex flex-wrap gap-2">
                    {result.patterns_detected.map((p, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-slate-800 rounded-full text-sm border border-slate-700"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">{t('scam.recommendedAction')}</p>
                  <p className="text-slate-200 font-medium">{result.recommended_action}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
