import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuthStore } from '../../store';
import api from '../../api/axios';
import { Globe, Layers, Map as MapIcon, RefreshCw, CloudRain } from 'lucide-react';
import axios from 'axios';

// ── Pulse Marker Icons ─────────────────────────────────────────────────────
const createPulseIcon = (color, shadowColor) =>
  new L.DivIcon({
    className: 'custom-div-icon',
    html: `
      <div class="marker-pin" style="background: ${color}; box-shadow: 0 0 15px ${shadowColor};"></div>
      <div class="marker-pulse" style="border-color: ${color};"></div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });

const ICONS = {
  barangay_hall:      createPulseIcon('linear-gradient(135deg,#3B82F6,#1D4ED8)',  'rgba(59,130,246,0.5)'),
  kp_hotspot:         createPulseIcon('linear-gradient(135deg,#EF4444,#B91C1C)',  'rgba(239,68,68,0.5)'),
  hazard_zone:        createPulseIcon('linear-gradient(135deg,#F59E0B,#B45309)',  'rgba(245,158,11,0.5)'),
  household_cluster:  createPulseIcon('linear-gradient(135deg,#10B981,#047857)',  'rgba(16,185,129,0.5)'),
  indigent_zone:      createPulseIcon('linear-gradient(135deg,#8B5CF6,#6D28D9)',  'rgba(139,92,246,0.5)'),
};

const TYPE_COLOR = {
  barangay_hall:     '#3B82F6',
  kp_hotspot:        '#EF4444',
  hazard_zone:       '#F59E0B',
  household_cluster: '#10B981',
  indigent_zone:     '#8B5CF6',
};

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const BarangayMap = ({ filters = {} }) => {
  const { user, canViewAllBarangays } = useAuthStore();
  const isLgu = canViewAllBarangays?.();

  const defaultCenter = React.useMemo(() => [13.2205, 120.5986], []);
  const defaultZoom   = React.useMemo(() => (isLgu ? 13 : 14), [isLgu]);

  const [markers, setMarkers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [baseMap, setBaseMap] = useState('voyager'); // 'voyager' | 'satellite'
  const [showWeather, setShowWeather] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherFrame, setWeatherFrame] = useState(0);
  const [isPlayingWeather, setIsPlayingWeather] = useState(true);

  const [activeFilters, setActiveFilters] = useState({
    barangay_hall: true,
    kp_hotspot: true,
    hazard_zone: true,
    household_cluster: true,
    indigent_zone: true,
  });

  // Fetch RainViewer public map data (no API key needed)
  const loadWeatherData = useCallback(async () => {
    try {
      const res = await axios.get('https://api.rainviewer.com/public/weather-maps.json');
      if (res.data && res.data.satellite && res.data.satellite.infrared) {
        setWeatherData(res.data);
        setWeatherFrame(res.data.satellite.infrared.length - 1); // Start with latest frame
      }
    } catch (err) {
      console.error('Failed to fetch RainViewer data:', err);
    }
  }, []);

  const loadMarkers = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await api.get('/gis/points');
      if (res.data.success) {
        setMarkers(res.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch GIS points:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Load + Polling for Real-Time effect
  useEffect(() => { 
    loadMarkers();
    if (showWeather) loadWeatherData();

    const interval = setInterval(() => {
      loadMarkers(false);
      if (showWeather) loadWeatherData();
    }, 15000); // Silent refresh every 15s for "Real-Time" feel
    return () => clearInterval(interval);
  }, [loadMarkers, loadWeatherData, showWeather]);

  // Weather Animation Loop (moves clouds over time)
  useEffect(() => {
    if (!showWeather || !weatherData || !isPlayingWeather || !weatherData.satellite?.infrared) return;
    
    const pastFrames = weatherData.satellite.infrared;
    const interval = setInterval(() => {
      setWeatherFrame(curr => (curr + 1) % pastFrames.length);
    }, 1000); // Change frame every 1s
    
    return () => clearInterval(interval);
  }, [showWeather, weatherData, isPlayingWeather]);

  const filteredMarkers = markers.filter(m => {
    const typeAllowed = activeFilters[m.point_type] !== false;
    if (!typeAllowed) return false;
    if (filters.showKpCases    === false && m.point_type === 'kp_hotspot')        return false;
    if (filters.showHazards    === false && m.point_type === 'hazard_zone')       return false;
    if (filters.showHouseholds === false && m.point_type === 'household_cluster') return false;
    return true;
  });

  const toggleFilter = (type) =>
    setActiveFilters(prev => ({ ...prev, [type]: !prev[type] }));

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <ChangeView center={defaultCenter} zoom={defaultZoom} />
        <ZoomControl position="bottomright" />

        {/* Base Maps */}
        {baseMap === 'voyager' ? (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            maxZoom={19}
            zIndex={1}
          />
        ) : (
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
            zIndex={1}
          />
        )}

        {/* Live Weather Overlay (RainViewer Satellite Clouds) */}
        {showWeather && weatherData && weatherData.satellite && weatherData.satellite.infrared[weatherFrame] && (
          <TileLayer
            key={`weather-${weatherData.satellite.infrared[weatherFrame].time}`}
            attribution='Weather data &copy; <a href="https://www.rainviewer.com/">RainViewer</a>'
            url={`${weatherData.host}${weatherData.satellite.infrared[weatherFrame].path}/256/{z}/{x}/{y}/0/1_0.png`}
            opacity={0.5}
            zIndex={10}
            maxZoom={19}
            maxNativeZoom={9} // Satellite resolution is usually coarser (max 9-10)
          />
        )}

        {filteredMarkers
          .filter(m => ['household_cluster','indigent_zone','hazard_zone'].includes(m.point_type))
          .map(m => (
            <Circle
              key={`ring-${m.id}`}
              center={[parseFloat(m.latitude), parseFloat(m.longitude)]}
              radius={m.point_type === 'household_cluster' ? 40 : 80}
              pathOptions={{
                color: TYPE_COLOR[m.point_type] || '#3B82F6',
                fillColor: TYPE_COLOR[m.point_type] || '#3B82F6',
                fillOpacity: baseMap === 'satellite' ? 0.2 : 0.08,
                weight: 1.5,
                dashArray: '4 4',
                opacity: 0.5,
              }}
            />
          ))
        }

        {filteredMarkers.map((marker) => (
          <Marker
            key={marker.id}
            position={[parseFloat(marker.latitude), parseFloat(marker.longitude)]}
            icon={ICONS[marker.point_type] || ICONS.barangay_hall}
          >
            <Popup className="premium-popup">
              <div className="p-2 min-w-[200px]">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-800 text-[14px] leading-tight pr-2">{marker.label}</h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider shrink-0">
                    {marker.point_type?.replace(/_/g, ' ')}
                  </span>
                </div>
                {marker.Barangay && (
                  <p className="text-[11px] text-blue-600 font-semibold mb-1">📍 {marker.Barangay.barangay_name}</p>
                )}
                {marker.metadata?.image_url && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-slate-200 shadow-sm h-32 relative group">
                    <img 
                      src={marker.metadata.image_url} 
                      alt={marker.label} 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 font-sans text-xs text-gray-400 flex items-center justify-center bg-gray-50" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                )}
                {marker.metadata?.description && (
                  <p className="text-[12px] text-gray-600 leading-snug mb-3 italic">{marker.metadata.description}</p>
                )}
                {marker.metadata?.resident_count !== undefined && (
                  <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100 mb-2">
                    <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1.5">
                      <Globe size={12} /> {marker.metadata.resident_count} Residents Recorded
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2 text-[10px] text-gray-400">
                  <span className="font-mono">{parseFloat(marker.latitude).toFixed(4)}, {parseFloat(marker.longitude).toFixed(4)}</span>
                </div>
              </div>
            </Popup>
            {marker.point_type === 'barangay_hall' && (
              <Tooltip
                permanent
                direction="top"
                offset={[0, -10]}
                className="bg-white/90 backdrop-blur-sm border-none shadow-md rounded-lg p-1 px-2 text-[10px] font-bold text-[#1B4F72]"
              >
                {marker.label}
              </Tooltip>
            )}
          </Marker>
        ))}
      </MapContainer>

      {/* ── Glassmorphism Layer Control Panel ───────────────────────────── */}
      <div className="absolute top-4 right-4 z-[1000] map-sidebar flex flex-col gap-3">
        
        {/* Real-time Status */}
        <div className="flex items-center justify-between px-1 mb-1">
          <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Real-Time</span>
          </div>
          <button 
            onClick={() => loadMarkers(true)}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-blue-600"
            title="Manual Refresh"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Base Map Switcher */}
        <div className="bg-gray-100/50 p-1 rounded-xl flex gap-1">
          <button 
            onClick={() => setBaseMap('voyager')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${baseMap === 'voyager' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <MapIcon size={12} /> Map
          </button>
          <button 
            onClick={() => setBaseMap('satellite')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${baseMap === 'satellite' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Globe size={12} /> Satellite
          </button>
        </div>

        {/* Weather Controls */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden mt-1">
          <label className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${showWeather ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                <CloudRain size={14} />
              </div>
              <span className="text-[11px] font-bold text-slate-700">Live Satellite Clouds</span>
            </div>
            <input 
              type="checkbox" 
              checked={showWeather} 
              onChange={() => setShowWeather(!showWeather)}
              className="w-3.5 h-3.5 accent-indigo-600 cursor-pointer"
            />
          </label>
          
          {showWeather && weatherData && weatherData.satellite?.infrared?.[weatherFrame] && (
            <div className="bg-white p-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
              <span className="text-gray-500">
                {new Date(weatherData.satellite.infrared[weatherFrame].time * 1000).toLocaleTimeString()}
              </span>
              <button 
                onClick={() => setIsPlayingWeather(!isPlayingWeather)}
                className="text-indigo-600 font-bold px-2 py-0.5 rounded hover:bg-indigo-50"
              >
                {isPlayingWeather ? 'PAUSE' : 'PLAY'}
              </button>
            </div>
          )}
        </div>

        <div className="py-1">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Visible Layers</p>
          <div className="space-y-1">
            {Object.keys(activeFilters).map(type => (
              <label key={type} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-blue-50/50 cursor-pointer group transition-colors">
                <input
                  type="checkbox"
                  checked={activeFilters[type]}
                  onChange={() => toggleFilter(type)}
                  className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                />
                <div
                  className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                  style={{ background: TYPE_COLOR[type] || '#999' }}
                />
                <span className="text-[12px] text-gray-600 font-semibold capitalize group-hover:text-[#1B4F72] transition-colors truncate">
                  {type.replace(/_/g, ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 px-1 mt-1">
          <p className="text-[9px] text-gray-400 font-medium">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>
      </div>

      <style>{`
        .map-sidebar {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 20px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.08);
          padding: 16px;
          width: 210px;
        }
        .leaflet-container { font-family: 'Inter', system-ui, sans-serif; }
        .premium-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15);
          border: 1px solid rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.98);
        }
        .custom-div-icon { position:relative; display:flex; justify-content:center; align-items:center; }
        .marker-pin {
          width: 14px; height: 14px; border-radius: 50%;
          position: relative; z-index: 2; border: 2.5px solid white;
        }
        .marker-pulse {
          position: absolute; width: 30px; height: 30px;
          border: 2px solid; border-radius: 50%; z-index: 1;
          animation: map-pulse 2s infinite cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes map-pulse {
          0%   { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .leaflet-control-zoom a {
          background-color: white !important; color: #1B4F72 !important;
          border: 1px solid #eef2f6 !important; box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
          width: 36px !important; height: 36px !important; line-height: 36px !important;
          border-radius: 10px !important; margin-bottom: 8px !important;
        }
      `}</style>
    </div>
  );
};

export default BarangayMap;
