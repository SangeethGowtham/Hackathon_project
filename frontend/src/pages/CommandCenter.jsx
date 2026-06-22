import { useState, useEffect } from 'react';
import { ShieldAlert, Users, IndianRupee, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const mockChartData = [
  { name: 'Mon', incidents: 40 },
  { name: 'Tue', incidents: 30 },
  { name: 'Wed', incidents: 60 },
  { name: 'Thu', incidents: 45 },
  { name: 'Fri', incidents: 80 },
  { name: 'Sat', incidents: 120 },
  { name: 'Sun', incidents: 95 },
];

export default function CommandCenter() {
  const [data, setData] = useState(null);
  const { t, geminiLang } = useLanguage();

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/agents/fusion?language=${encodeURIComponent(geminiLang)}`)
      .then((res) => setData(res.data))
      .catch(() => {
        setData({
          overall_threat_level: 'CRITICAL',
          active_scam_campaigns: 3,
          money_mule_accounts_flagged: 42,
          counterfeit_circulation_index: 0.85,
          recent_alerts: [
            'Digital Arrest campaign detected targeting elderly in Delhi.',
            'High volume of spoofed CBI calls from Jamtara cluster.',
            'New batch of counterfeit Rs 500 notes intercepted in Mumbai.',
          ],
        });
      });
  // Re-fetch when language changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geminiLang]);

  if (!data)
    return (
      <div className="p-8 text-slate-400 animate-pulse">{t('common.loading')}</div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-8">{t('cmd.heading')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 flex items-center gap-4 border-l-4 border-red-500">
          <div className="p-3 bg-red-500/20 rounded-xl">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">{t('cmd.threatLevel')}</p>
            <p className="text-2xl font-bold text-red-400">{data.overall_threat_level}</p>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">{t('cmd.activeScams')}</p>
            <p className="text-2xl font-bold">{data.active_scam_campaigns}</p>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-xl">
            <Users className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">{t('cmd.muleAccounts')}</p>
            <p className="text-2xl font-bold">{data.money_mule_accounts_flagged}</p>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-4 border-l-4 border-amber-500">
          <div className="p-3 bg-amber-500/20 rounded-xl">
            <IndianRupee className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">{t('cmd.counterfeitIndex')}</p>
            <p className="text-2xl font-bold text-amber-400">
              {(data.counterfeit_circulation_index * 100).toFixed(0)}/100
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 glass-panel p-6">
          <h2 className="text-xl font-semibold mb-6">{t('cmd.incidentFrequency')}</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Line
                  type="monotone"
                  dataKey="incidents"
                  name={t('cmd.incidents')}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" /> {t('cmd.priorityAlerts')}
          </h2>
          <div className="space-y-4">
            {data.recent_alerts.map((alert, idx) => (
              <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <p className="text-sm text-slate-300">{alert}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
