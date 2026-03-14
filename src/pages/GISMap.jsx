import React, { useState } from 'react';
import { Map, MapPin, ShieldAlert, AlertTriangle, Home } from 'lucide-react';
import BarangayMap from '../components/maps/BarangayMap';

const GISMap = () => {
  const [filters, setFilters] = useState({
    showKpCases: true,
    showHazards: true,
    showHouseholds: false,
  });

  const toggleFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-120px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 shrink-0">
        <div>
          <h1 className="text-2xl text-gray-800 font-bold">GIS Threat Mapping</h1>
          <p className="text-sm text-gray-500">Geospatial visualization of incidents, hazards, and households</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px]">
        {/* Sidebar Controls */}
        <div className="lg:w-[300px] shrink-0 space-y-4">
          <div className="card p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 h-full bg-gradient-to-b from-white to-slate-50/50 rounded-2xl relative overflow-hidden">
            {/* Subtle top glare/gradient line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#1B4F72]/20 to-transparent"></div>
            
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-blue-50 text-[#1B4F72] rounded-lg">
                <Map size={20} />
              </div>
              Map Layers
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-4 p-4 rounded-xl border border-rose-100/50 bg-white shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:border-rose-200 group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-500 transition-all cursor-pointer" 
                  checked={filters.showKpCases}
                  onChange={() => toggleFilter('showKpCases')}
                />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white p-1.5 shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-transform group-hover:scale-110">
                    <ShieldAlert size={14} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Active KP Cases</span>
                </div>
              </label>

              <label className="flex items-center gap-4 p-4 rounded-xl border border-amber-100/50 bg-white shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:border-amber-200 group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500 transition-all cursor-pointer" 
                  checked={filters.showHazards}
                  onChange={() => toggleFilter('showHazards')}
                />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white p-1.5 shadow-[0_0_15px_rgba(217,119,6,0.3)] transition-transform group-hover:scale-110">
                    <AlertTriangle size={14} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Reported Hazards</span>
                </div>
              </label>

              <label className="flex items-center gap-4 p-4 rounded-xl border border-emerald-100/50 bg-white shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:border-emerald-200 group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500 transition-all cursor-pointer" 
                  checked={filters.showHouseholds}
                  onChange={() => toggleFilter('showHouseholds')}
                />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white p-1.5 shadow-[0_0_15px_rgba(5,150,105,0.3)] transition-transform group-hover:scale-110">
                    <Home size={14} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Map Households</span>
                </div>
              </label>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100/80">
               <div className="flex items-center justify-between text-xs text-slate-500 mb-3 font-medium px-1">
                 <span>Map Center Focus</span>
                 <span className="font-mono text-[10px] tracking-wider uppercase">Mamburao</span>
               </div>
               <div className="w-full bg-slate-800 text-white text-xs p-3.5 rounded-xl text-center font-medium shadow-md shadow-slate-200 transition-all hover:bg-slate-700 cursor-default">
                 <MapPin size={14} className="inline mr-1.5 mb-0.5 text-blue-400" />
                 Barangay Hall Base Point
               </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 rounded-xl overflow-hidden shadow-sm border border-gray-300 relative bg-white min-h-[400px]">
          <BarangayMap filters={filters} />
        </div>
      </div>
    </div>
  );
};

export default GISMap;
