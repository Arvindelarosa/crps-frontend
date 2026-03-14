import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuthStore } from '../../store';

// Modern animated pulse markers using DivIcon
const createPulseIcon = (color, shadowColor) => {
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `
      <div class="marker-pin" style="background: ${color}; box-shadow: 0 0 15px ${shadowColor};"></div>
      <div class="marker-pulse" style="border-color: ${color};"></div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

const icons = {
  barangayHall: createPulseIcon('linear-gradient(135deg, #3B82F6, #1D4ED8)', 'rgba(59, 130, 246, 0.5)'), // Blue
  kpCase: createPulseIcon('linear-gradient(135deg, #EF4444, #B91C1C)', 'rgba(239, 68, 68, 0.5)'),     // Red
  hazard: createPulseIcon('linear-gradient(135deg, #F59E0B, #B45309)', 'rgba(245, 158, 11, 0.5)'),     // Orange
  household: createPulseIcon('linear-gradient(135deg, #10B981, #047857)', 'rgba(16, 185, 129, 0.5)')   // Green
};

// Component to recenter map when coordinates change
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const BarangayMap = ({ filters }) => {
  const { user } = useAuthStore();
  
  // Default bounds for Mamburao, Occ. Mindoro (Approximate)
  const defaultCenter = [13.2205, 120.5986];
  const defaultZoom = 14;

  // Mock data tailored for the new aesthetic
  const [markers] = useState([
    { id: 1, lat: 13.2205, lng: 120.5986, type: 'barangayHall', title: 'Barangay Hall', info: `Administration for Brgy. ${user?.Barangay?.barangay_name || 'Mamburao'}`, date: 'Primary Hub' },
    { id: 2, lat: 13.2250, lng: 120.6000, type: 'kpCase', title: 'Active KP Case', info: 'Property Dispute Complaint', date: 'Just now' },
    { id: 3, lat: 13.2180, lng: 120.5950, type: 'hazard', title: 'Flood Risk Area', info: 'Reported during heavy rains', date: '2 hours ago' },
    { id: 4, lat: 13.2220, lng: 120.5900, type: 'household', title: 'Indigent Household', info: 'Household of Juan Dela Cruz', date: 'Verified' },
    { id: 5, lat: 13.2150, lng: 120.6100, type: 'kpCase', title: 'Active KP Case', info: 'Noise Disturbance', date: '1 day ago' },
  ]);

  const filteredMarkers = markers.filter(m => {
    if (filters.showKpCases && m.type === 'kpCase') return true;
    if (filters.showHazards && m.type === 'hazard') return true;
    if (filters.showHouseholds && m.type === 'household') return true;
    if (m.type === 'barangayHall') return true;
    return false;
  });

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        style={{ height: '100%', width: '100%', zIndex: 1, background: '#f8fafc' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <ChangeView center={defaultCenter} zoom={defaultZoom} />
        <ZoomControl position="bottomright" />
        
        {/* Sleek, modern map tiles (CartoDB Positron) */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {filteredMarkers.map((marker) => (
          <Marker 
            key={marker.id} 
            position={[marker.lat, marker.lng]}
            icon={icons[marker.type] || icons.barangayHall}
          >
            <Popup className="premium-popup">
              <div className="p-2 min-w-[180px]">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-800 text-[14px] leading-tight">{marker.title}</h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">{marker.type}</span>
                </div>
                <p className="text-[12px] text-gray-600 leading-snug mb-3">{marker.info}</p>
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-gray-400">
                  <span className="font-mono">{marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}</span>
                  <span className="font-medium">{marker.date}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Embedded Premium CSS for Map Layout & Animations */}
      <style>{`
        .leaflet-container { font-family: 'Inter', system-ui, sans-serif; }
        
        /* Premium Popups */
        .leaflet-popup-content-wrapper { 
          border-radius: 12px; 
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); 
          border: 1px solid rgba(255,255,255,0.4);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
        }
        .leaflet-popup-content { margin: 8px 10px; }
        .leaflet-popup-tip { background: rgba(255, 255, 255, 0.95); }

        /* Custom DivIcon Pulse Animation */
        .custom-div-icon {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .marker-pin {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          position: relative;
          z-index: 2;
          border: 2px solid white;
        }
        .marker-pulse {
          position: absolute;
          width: 30px;
          height: 30px;
          border: 2px solid;
          border-radius: 50%;
          z-index: 1;
          animation: map-pulse 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes map-pulse {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        /* Zoom Control Reskin */
        .leaflet-control-zoom a {
          background-color: white !important;
          color: #1B4F72 !important;
          border: none !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
          width: 34px !important;
          height: 34px !important;
          line-height: 34px !important;
          border-radius: 8px !important;
          margin-bottom: 8px !important;
          transition: all 0.2s ease;
        }
        .leaflet-control-zoom a:hover {
          background-color: #f8fafc !important;
          transform: scale(1.05);
        }
        .leaflet-bar { border: none !important; box-shadow: none !important; }
      `}</style>
    </div>
  );
};

export default BarangayMap;
