import React, { useEffect, useState, useRef } from 'react';
import { Download, FileText, FileSpreadsheet, Activity, Users, Settings as FilterIcon } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';
import { reportsAPI } from '../api';
import { useAuthStore } from '../store';
import { calculateAge } from '../utils/formatters';

const Reports = () => {
  const { user } = useAuthStore();
  const [sectorData, setSectorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef();

  const handlePrintPDF = useReactToPrint({
    content: () => chartRef.current,
    documentTitle: 'CRPS_Sector_Report',
  });

  const fetchSectorStats = async () => {
    setLoading(true);
    try {
      const res = await reportsAPI.getSectorReport();
      if (res.data.success) {
        setSectorData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectorStats();
  }, []);

  const handleExportExcel = async () => {
    try {
      // Fetch full resident list for the export
      const res = await reportsAPI.getResidentList();
      if (res.data.success) {
        const data = res.data.data;
        
        // Format data for Excel
        const exportData = data.map(r => ({
          'Resident Code': r.resident_code,
          'Last Name': r.last_name,
          'First Name': r.first_name,
          'Middle Name': r.middle_name || '',
          'Suffix': r.suffix || '',
          'Gender': r.gender,
          'Age': calculateAge(r.birthdate),
          'Birthdate': new Date(r.birthdate).toLocaleDateString(),
          'Civil Status': r.civil_status,
          'Contact Number': r.contact_number || '',
          'Address': r.Household?.address || '',
          'Purok/Sitio': r.Household?.purok_sitio || '',
          'Senior Citizen': r.is_senior_citizen ? 'Yes' : 'No',
          'PWD': r.is_pwd ? 'Yes' : 'No',
          'Solo Parent': r.is_solo_parent ? 'Yes' : 'No',
          'Reg. Voter': r.is_registered_voter ? 'Yes' : 'No',
          'Student': r.is_student ? 'Yes' : 'No',
          '4Ps Beneficiary': r.is_4ps_beneficiary ? 'Yes' : 'No',
          'OFW': r.is_ofw ? 'Yes' : 'No',
          'Indigenous': r.is_indigenous_people ? 'Yes' : 'No',
          'Unemployed': r.is_unemployed ? 'Yes' : 'No',
        }));

        // Generate Excel file
        const ws = XLSX.utils.json_to_sheet(exportData);
        
        // Style Header
        const headerRange = XLSX.utils.decode_range(ws['!ref']);
        for(let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
          const address = XLSX.utils.encode_col(C) + "1"; 
          if(!ws[address]) continue;
          ws[address].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "1B4F72" } }
          };
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Residents Masterlist");
        XLSX.writeFile(wb, `CRPS_Masterlist_${user?.Barangay?.barangay_name || 'All'}_${new Date().toISOString().split('T')[0]}.xlsx`);

      }
    } catch (err) {
      alert('Failed to generate Excel export.');
      console.error(err);
    }
  };

  const COLORS = ['#1B4F72', '#F39C12', '#27AE60', '#C0392B', '#8E44AD', '#2E86C1', '#D35400', '#16A085', '#7F8C8D'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl text-gray-800 font-bold">Reports & Analytics</h1>
          <p className="text-sm text-gray-500">Generate statistical reports and export data</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrintPDF}
            className="btn btn-secondary border border-transparent shadow-sm"
          >
             <FileText size={18} /> Export as PDF
          </button>
          <button 
            onClick={handleExportExcel}
            className="btn btn-success border border-transparent shadow-sm shadow-green-600/20"
          >
             <FileSpreadsheet size={18} /> Export Masterlist (Excel)
          </button>
        </div>
      </div>

      <div ref={chartRef} className="print-container space-y-6 bg-transparent">
        <style>{`
          @media print {
            .print-container { background: white !important; padding: 20px !important; }
            .no-print { display: none !important; }
            body { background: white; }
          }
        `}</style>
        
        {/* Print Header only visible on print */}
        <div className="hidden print:block text-center mb-8 border-b-2 border-[#1B4F72] pb-6 mt-4">
          <h2 className="text-2xl font-bold font-serif text-[#1B4F72] uppercase">BARANGAY {user?.Barangay?.barangay_name || 'REPORTS'}</h2>
          <p className="text-lg mt-1 font-serif tracking-wide">Official Sector Distribution Report</p>
          <p className="text-sm text-gray-500 mt-2">Generated on: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 shadow-sm border border-gray-100">
             <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Activity size={18} className="text-[#1B4F72]" /> Sector Distribution Overview
            </h3>
            <div className="h-80 w-full">
              {loading ? (
                <div className="h-full flex justify-center items-center"><div className="animate-spin w-8 h-8 border-4 border-[#1B4F72] border-t-transparent rounded-full"></div></div>
              ) : sectorData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} />
                    <YAxis dataKey="sector" type="category" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }} />
                    <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" name="Residents" fill="#2E86C1" radius={[0, 4, 4, 0]} barSize={24}>
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No sector data available</div>
              )}
            </div>
          </div>

          <div className="card p-6 shadow-sm border border-gray-100">
             <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Users size={18} className="text-[#F39C12]" /> Sector Composition
            </h3>
            <div className="h-80 w-full">
              {loading ? (
                <div className="h-full flex justify-center items-center"><div className="animate-spin w-8 h-8 border-[#F39C12] border-t-transparent rounded-full"></div></div>
              ) : sectorData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%" cy="50%"
                      innerRadius={80} outerRadius={110}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="sector"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No sector data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Data summary table for print & view */}
        <div className="card mt-6 p-6 shadow-sm border border-gray-100">
           <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FilterIcon size={18} className="text-gray-500" /> Sector Details Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th className="font-semibold">Sector Classification</th>
                    <th className="text-right font-semibold">Total Count</th>
                    <th className="text-right font-semibold">% of Population</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="3" className="text-center py-4 text-gray-500">Loading...</td></tr>
                  ) : sectorData.length > 0 ? (
                    sectorData.map((s, i) => {
                      // rough estimate of percent if we had total. We don't have total easily here, so we skip exact % for demo or just show count
                      return (
                        <tr key={i}>
                          <td className="font-medium text-gray-800 capitalize border-b border-gray-100 py-3">{s.sector}</td>
                          <td className="text-right font-mono text-[#1B4F72] font-semibold border-b border-gray-100 py-3">{s.count}</td>
                          <td className="text-right text-gray-500 text-sm border-b border-gray-100 py-3">-</td>
                        </tr>
                      )
                    })
                  ) : (
                     <tr><td colSpan="3" className="text-center py-4 text-gray-500">No data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
