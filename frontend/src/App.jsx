import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, PhoneCall, ScanLine, Network, Map, MessageSquare, Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { LanguageProvider, useLanguage } from './context/LanguageContext';

// Import Pages
import CommandCenter from './pages/CommandCenter';
import ScamDetection from './pages/ScamDetection';
import CurrencyVerification from './pages/CurrencyVerification';
import FraudNetwork from './pages/FraudNetwork';
import CrimeHeatmap from './pages/CrimeHeatmap';
import CitizenShield from './pages/CitizenShield';

function LanguageSwitcher() {
  const { langCode, setLangCode, currentLang, LANGUAGES } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="px-4 pb-4" ref={ref}>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Globe className="w-3 h-3" /> Language
      </p>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-3 py-2.5 transition-all duration-200 group"
      >
        <span className="flex items-center gap-2 text-sm text-slate-200 font-medium">
          <span className="text-base">{currentLang.flag}</span>
          <span>{currentLang.nativeName}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-4 right-4 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-fade-in">
          <div className="max-h-72 overflow-y-auto p-1">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLangCode(lang.code); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 text-left ${
                  langCode === lang.code
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <div className="flex-1 min-w-0">
                  <span className="block font-medium truncate">{lang.nativeName}</span>
                  <span className="block text-xs text-slate-500">{lang.name}</span>
                </div>
                {langCode === lang.code && (
                  <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Sidebar() {
  const location = useLocation();
  const path = location.pathname;
  const { t } = useLanguage();

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-500" />
        <h1 className="text-xl font-bold tracking-wider premium-gradient-text">CYBER SHIELD</h1>
      </div>
      
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <Link to="/" className={`nav-item ${path === '/' ? 'active' : ''}`}>
          <LayoutDashboard className="w-5 h-5 mr-3 shrink-0" /> {t('nav.commandCenter')}
        </Link>
        <Link to="/scam-detection" className={`nav-item ${path === '/scam-detection' ? 'active' : ''}`}>
          <PhoneCall className="w-5 h-5 mr-3 shrink-0" /> {t('nav.scamIntelligence')}
        </Link>
        <Link to="/currency" className={`nav-item ${path === '/currency' ? 'active' : ''}`}>
          <ScanLine className="w-5 h-5 mr-3 shrink-0" /> {t('nav.currencyScanner')}
        </Link>
        <Link to="/network" className={`nav-item ${path === '/network' ? 'active' : ''}`}>
          <Network className="w-5 h-5 mr-3 shrink-0" /> {t('nav.fraudNetwork')}
        </Link>
        <Link to="/heatmap" className={`nav-item ${path === '/heatmap' ? 'active' : ''}`}>
          <Map className="w-5 h-5 mr-3 shrink-0" /> {t('nav.crimeHeatmap')}
        </Link>
        <Link to="/citizen" className={`nav-item ${path === '/citizen' ? 'active' : ''}`}>
          <MessageSquare className="w-5 h-5 mr-3 shrink-0" /> {t('nav.citizenShield')}
        </Link>
      </nav>

      {/* Global Language Switcher */}
      <div className="border-t border-slate-800 pt-4 relative">
        <LanguageSwitcher />
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500 text-center">
          {t('common.mhaFooter')} <br/> v1.0.0 (Hackathon MVP)
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="flex bg-[#0f172a] min-h-screen text-slate-200">
          <Sidebar />
          <main className="ml-64 flex-1 p-8">
            <Routes>
              <Route path="/" element={<CommandCenter />} />
              <Route path="/scam-detection" element={<ScamDetection />} />
              <Route path="/currency" element={<CurrencyVerification />} />
              <Route path="/network" element={<FraudNetwork />} />
              <Route path="/heatmap" element={<CrimeHeatmap />} />
              <Route path="/citizen" element={<CitizenShield />} />
            </Routes>
          </main>
        </div>
      </Router>
    </LanguageProvider>
  );
}
