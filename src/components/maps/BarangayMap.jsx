import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuthStore } from '../../store';
import api from '../../api/axios';

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

// Type → circle fill color for density rings
const TYPE_COLOR = {
  barangay_hall:     '#3B82F6',
  kp_hotspot:        '#EF4444',
  hazard_zone:       '#F59E0B',
  household_cluster: '#10B981',
  indigent_zone:     '#8B5CF6',
};

// Component to recenter map
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

// ── Main Component ──────────────────────────────────────────────────────────
const BarangayMap = ({ filters = {} }) => {
  const { user, canViewAllBarangays } = useAuthStore();
  const isLgu = canViewAllBarangays?.();

  const defaultCenter = [13.2205, 120.5986];
  const defaultZoom   = isLgu ? 13 : 14;

  const [markers, setMarkers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    barangay_hall: true,
    kp_hotspot: true,
    hazard_zone: true,
    household_cluster: true,
    indigent_zone: true,
  });

  // ── Fetch live GIS points from API ──────────────────────────────────────
  const loadMarkers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/gis/points');
      if (res.data.success) setMarkers(res.data.data);
    } catch {
      // Fallback to demo markers if API is offline
      setMarkers([
        { id: 1, latitude: 13.2205, longitude: 120.5986, point_type: 'barangay_hall',     label: 'Poblacion 1 Barangay Hall',  Barangay: { barangay_name: 'Poblacion 1' },  metadata: { description: 'Primary admin hub' } },
        { id: 2, latitude: 13.2250, longitude: 120.6000, point_type: 'kp_hotspot',         label: 'Active KP Case Cluster',     Barangay: { barangay_name: 'Poblacion 2' },  metadata: { description: 'Property disputes' } },
        { id: 3, latitude: 13.2180, longitude: 120.5950, point_type: 'hazard_zone',        label: 'Flood Risk Area',            Barangay: { barangay_name: 'Balansay' },     metadata: { description: 'Seasonal flooding' } },
        { id: 4, latitude: 13.2220, longitude: 120.5900, point_type: 'household_cluster',  label: 'Indigent Household Cluster', Barangay: { barangay_name: 'Talabaan' },     metadata: { resident_count: 12 } },
        { id: 5, latitude: 13.2150, longitude: 120.6100, point_type: 'indigent_zone',      label: '4Ps Beneficiary Zone',       Barangay: { barangay_name: 'Fatima' },       metadata: { description: '4Ps concentrated area' } },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMarkers(); }, [loadMarkers]);

  // Apply both external filters prop and internal toggle filters
  const filteredMarkers = markers.filter(m => {
    const typeAllowed = activeFilters[m.point_type] !== false;
    if (!typeAllowed) return false;
    // Legacy filters prop support
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

        {/* Sleek CartoDB Voyager tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* Density rings for cluster/zone types */}
        {filteredMarkers
          .filter(m => ['household_cluster','indigent_zone','hazard_zone'].includes(m.point_type))
          .map(m => (
            <Circle
              key={`ring-${m.id}`}
              center={[parseFloat(m.latitude), parseFloat(m.longitude)]}
              radius={80}
              pathOptions={{
                color: TYPE_COLOR[m.point_type] || '#3B82F6',
                fillColor: TYPE_COLOR[m.point_type] || '#3B82F6',
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: '4 4',
                opacity: 0.5,
              }}
            />
          ))
        }

        {/* Markers */}
        {filteredMarkers.map((marker) => (
          <Marker
            key={marker.id}
            position={[parseFloat(marker.latitude), parseFloat(marker.longitude)]}
            icon={ICONS[marker.point_type] || ICONS.barangay_hall}
            eventHandlers={{ click: () => setSelected(marker) }}
          >
            <Popup className="premium-popup">
              <div className="p-2 min-w-[200px]">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-800 text-[14px] leading-tight pr-2">{marker.label}</h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider shrink-0">
                    {marker.point_type?.replace('_', ' ')}
                  </span>
                </div>
                {marker.Barangay && (
                  <p className="text-[11px] text-blue-600 font-semibold mb-1">📍 {marker.Barangay.barangay_name}</p>
                )}
                {marker.metadata?.description && (
                  <p className="text-[12px] text-gray-600 leading-snug mb-3">{marker.metadata.description}</p>
                )}
                {marker.metadata?.resident_count && (
                  <p className="text-[11px] text-emerald-600 font-medium">👥 {marker.metadata.resident_count} residents</p>
                )}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2 text-[10px] text-gray-400">
                  <span className="font-mono">{parseFloat(marker.latitude).toFixed(4)}, {parseFloat(marker.longitude).toFixed(4)}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ── Glassmorphism Layer Control Panel ───────────────────────────── */}
      <div className="absolute top-4 right-4 z-[1000] map-sidebar">
        <div className="mb-3">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Map Layers</p>
          {Object.keys(activeFilters).map(type => (
            <label key={type} className="flex items-center gap-2 py-1 cursor-pointer group">
              <input
                type="checkbox"
                checked={activeFilters[type]}
                onChange={() => toggleFilter(type)}
                className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
              />
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ background: TYPE_COLOR[type] || '#999' }}
              />
              <span className="text-[12px] text-gray-700 font-medium capitalize group-hover:text-blue-600 transition-colors">
                {type.replace(/_/g, ' ')}
              </span>
            </label>
          ))}
        </div>

        {isLgu && (
          <div className="border-t border-slate-200 pt-3">
            <p className="text-[11px] font-bold text-purple-500 uppercase tracking-widest mb-1">LGU View</p>
            <p className="text-[10px] text-gray-500">All {markers.length} points across all barangays</p>
          </div>
        )}

        {loading && (
          <div className="border-t border-slate-200 pt-3 text-center">
            <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <p className="text-[10px] text-gray-400 mt-1">Loading points…</p>
          </div>
        )}
      </div>

      {/* ── Premium Map CSS ─────────────────────────────────────────────── */}
      <style>{`
        .map-sidebar {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 14px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.10);
          padding: 14px 16px;
          width: 200px;
        }
        .leaflet-container { font-family: 'Inter', system-ui, sans-serif; }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.10);
          border: 1px solid rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(8px);
        }
        .leaflet-popup-content { margin: 8px 10px; }
        .leaflet-popup-tip { background: rgba(255,255,255,0.96); }
        .custom-div-icon { position:relative; display:flex; justify-content:center; align-items:center; }
        .marker-pin {
          width: 14px; height: 14px; border-radius: 50%;
          position: relative; z-index: 2; border: 2px solid white;
        }
        .marker-pulse {
          position: absolute; width: 30px; height: 30px;
          border: 2px solid; border-radius: 50%; z-index: 1;
          animation: map-pulse 2s infinite cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes map-pulse {
          0%   { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .leaflet-control-zoom a {
          background-color: white !important; color: #1B4F72 !important;
          border: none !important; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
          width: 34px !important; height: 34px !important; line-height: 34px !important;
          border-radius: 8px !important; margin-bottom: 8px !important; transition: all 0.2s ease;
        }
        .leaflet-control-zoom a:hover { background-color: #f8fafc !important; transform: scale(1.05); }
        .leaflet-bar { border: none !important; box-shadow: none !important; }
      `}</style>
    </div>
  );
};

export default BarangayMap;
