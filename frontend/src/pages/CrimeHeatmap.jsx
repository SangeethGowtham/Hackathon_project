import { useState, useEffect } from 'react';
import { Map as MapIcon, Layers } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

export default function CrimeHeatmap() {
  const [points, setPoints] = useState([]);
  const { t, geminiLang } = useLanguage();

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/agents/geospatial?language=${encodeURIComponent(geminiLang)}`)
      .then((res) => setPoints(res.data))
      .catch(() => {
        setPoints([
          { lat: 28.6139, lng: 77.209,  city: 'New Delhi', risk: 'High',     incidents: 120 },
          { lat: 24.0374, lng: 86.994,  city: 'Jamtara',   risk: 'Critical', incidents: 340 },
          { lat: 27.8837, lng: 77.0195, city: 'Mewat',     risk: 'Critical', incidents: 210 },
          { lat: 19.076,  lng: 72.8777, city: 'Mumbai',    risk: 'Medium',   incidents: 85  },
          { lat: 12.9716, lng: 77.5946, city: 'Bangalore', risk: 'High',     incidents: 150 },
        ]);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geminiLang]);

  const getRiskColor = (risk) => {
    if (risk === 'Critical') return '#ef4444';
    if (risk === 'High') return '#f97316';
    if (risk === 'Medium') return '#eab308';
    return '#3b82f6';
  };

  const getRadius = (incidents) => Math.max(10, Math.min(incidents / 5, 40));

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <MapIcon className="w-8 h-8 text-teal-500" />
          <h1 className="text-3xl font-bold">{t('heatmap.heading')}</h1>
        </div>

        <button className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-700">
          <Layers className="w-4 h-4" /> {t('heatmap.toggleLayers')}
        </button>
      </div>

      <div className="flex-1 glass-panel overflow-hidden relative rounded-xl border border-slate-700/50">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: '100%', width: '100%', background: '#0f172a' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {points.map((point, idx) => (
            <CircleMarker
              key={idx}
              center={[point.lat, point.lng]}
              radius={getRadius(point.incidents)}
              fillColor={getRiskColor(point.risk)}
              color={getRiskColor(point.risk)}
              weight={1}
              opacity={0.8}
              fillOpacity={0.4}
            >
              <Popup className="custom-popup">
                <div className="text-slate-800 p-1">
                  <h3 className="font-bold text-lg mb-1">{point.city}</h3>
                  <p className="text-sm">
                    <span className="font-semibold">{t('heatmap.riskLevel')}:</span>{' '}
                    <span style={{ color: getRiskColor(point.risk) }}>{point.risk}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">{t('heatmap.incidents')}:</span>{' '}
                    {point.incidents}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Map Legend Overlay */}
        <div className="absolute top-4 right-4 z-[1000] glass-panel p-4 bg-slate-900/90 shadow-2xl">
          <h3 className="text-sm font-semibold mb-3">{t('heatmap.threatHotspots')}</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500/40 border border-red-500"></div>
              {t('heatmap.critical')}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500/40 border border-orange-500"></div>
              {t('heatmap.high')}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500/40 border border-yellow-500"></div>
              {t('heatmap.medium')}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container { font-family: 'Inter', sans-serif; }
        .leaflet-popup-content-wrapper { background: #f8fafc; border-radius: 8px; }
        .leaflet-popup-tip { background: #f8fafc; }
      `}} />
    </div>
  );
}
