import { useState, useEffect, useRef } from 'react';
import {
  Network, Search, Filter, ShieldAlert, AlertTriangle,
  Crosshair, Users, Smartphone, Landmark, Cpu,
} from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

export default function FraudNetwork() {
  const [data, setData] = useState({ nodes: [], links: [], intelligence_package: null });
  const [loading, setLoading] = useState(true);
  const graphRef = useRef();
  const { t, geminiLang } = useLanguage();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:8000/api/agents/network?language=${encodeURIComponent(geminiLang)}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  // Re-fetch when language changes so intelligence package is in the new language
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geminiLang]);

  const getNodeColor = (group) => {
    switch (group) {
      case 1: return '#ef4444';
      case 2: return '#eab308';
      case 3: return '#8b5cf6';
      case 4: return '#22c55e';
      default: return '#94a3b8';
    }
  };

  const intel = data.intelligence_package;

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <Network className="w-8 h-8 text-indigo-500" />
          <h1 className="text-3xl font-bold">{t('network.heading')}</h1>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('common.search')}
              className="bg-transparent border-none focus:outline-none text-sm w-48 text-slate-200"
            />
          </div>
          <button className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-700">
            <Filter className="w-4 h-4" /> {t('common.filter')}
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* GRAPH PANEL */}
        <div className="flex-1 glass-panel overflow-hidden relative rounded-xl border border-slate-700/50">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              {t('network.loadingGraph')}
            </div>
          ) : data.nodes.length > 0 ? (
            <ForceGraph2D
              ref={graphRef}
              graphData={data}
              nodeLabel="label"
              nodeColor={(node) => getNodeColor(node.group)}
              nodeRelSize={6}
              linkColor={() => 'rgba(255,255,255,0.15)'}
              linkWidth={1}
              backgroundColor="#0f172a"
              onEngineStop={() => graphRef.current?.zoomToFit(400, 50)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              Failed to load graph data. Make sure backend is running.
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-6 left-6 glass-panel p-4 bg-slate-900/80">
            <h3 className="text-sm font-semibold mb-3">Entity Types</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div> Suspect / Phone
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div> Money Mule Account
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div> Implicated Device
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div> Victim
              </div>
            </div>
          </div>
        </div>

        {/* INTELLIGENCE PACKAGE SIDEBAR */}
        {intel && (
          <div className="w-[400px] shrink-0 overflow-y-auto pr-2 space-y-6">
            <div className="glass-panel p-6 border-t-4 border-red-500 shadow-xl shadow-red-500/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-red-500" />
                  {t('network.intelligencePackage')}
                </h2>
                <span className="px-3 py-1 bg-slate-800 text-xs font-mono text-slate-400 rounded-full border border-slate-700">
                  {intel.cluster_id}
                </span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                <div className="p-3 bg-red-500/20 rounded-lg shrink-0">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-red-400/80 uppercase font-bold tracking-wider mb-1">
                    {t('network.networkRiskScore')}
                  </p>
                  <p className="text-3xl font-black text-red-400">
                    {intel.risk_score}
                    <span className="text-lg text-red-400/50">/100</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <Users className="w-4 h-4 text-green-400 mb-2" />
                  <p className="text-2xl font-bold">{intel.stats.victims_count}</p>
                  <p className="text-xs text-slate-400">{t('network.victims')}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <Smartphone className="w-4 h-4 text-red-400 mb-2" />
                  <p className="text-2xl font-bold">{intel.stats.phones_count}</p>
                  <p className="text-xs text-slate-400">{t('network.phones')}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <Landmark className="w-4 h-4 text-yellow-400 mb-2" />
                  <p className="text-2xl font-bold">{intel.stats.banks_count}</p>
                  <p className="text-xs text-slate-400">{t('network.muleAccounts')}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <Cpu className="w-4 h-4 text-purple-400 mb-2" />
                  <p className="text-2xl font-bold">{intel.stats.devices_count}</p>
                  <p className="text-xs text-slate-400">{t('network.devices')}</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Crosshair className="w-4 h-4 text-indigo-400" /> {t('network.fraudPattern')}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">
                    {intel.analysis.fraud_pattern}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {t('network.investigationSummary')}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {intel.analysis.investigation_summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700/50">
                  <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3">
                    {t('network.recommendedActions')}
                  </h3>
                  <ul className="space-y-3">
                    {intel.analysis.recommended_actions.map((action, idx) => (
                      <li
                        key={idx}
                        className="flex gap-3 text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50"
                      >
                        <span className="text-red-500 font-bold shrink-0">{idx + 1}.</span>{' '}
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
