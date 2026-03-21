import toast from 'react-hot-toast';
import React, { useEffect, useState } from 'react';
import { 
  Users, Home, FileText, ShieldAlert,
  TrendingUp, Download, PlusCircle, Globe
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { Link } from 'react-router-dom';
import StatCard from '../components/ui/StatCard';
import { reportsAPI, syncAPI } from '../api';
import { formatCurrency } from '../utils/formatters';
import { useAuthStore } from '../store';

const Dashboard = () => {
  const { user } = useAuthStore();
  const isAdminOrLgu = ['super_admin', 'lgu_viewer'].includes(user?.role);
  const isLguViewer = user?.role === 'lgu_viewer';

  const [stats, setStats] = useState(null);
  const [lguData, setLguData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        if (isAdminOrLgu) {
          // LGU View: Fetch comparative cross-barangay analytics
          const res = await syncAPI.getAnalytics();
          if (res.data.success) {
            setLguData(res.data.data);
          }
        } else {
          // Normal Barangay View: Fetch specific barangay stats
          const res = await reportsAPI.getDashboardStats();
          if (res.data.success) {
            setStats(res.data.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [isAdminOrLgu]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#1B4F72] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const COLORS = ['#1B4F72', '#F39C12', '#27AE60', '#C0392B', '#8E44AD'];

  // ── LGU RENDER BLOCK ───────────────────────────────────────────────────────
  if (isAdminOrLgu) {
    const totalResidents = lguData.reduce((acc, b) => acc + Number(b.total_residents || 0), 0);
    const totalHouseholds = lguData.reduce((acc, b) => acc + Number(b.total_households || 0), 0);
    const totalSeniors = lguData.reduce((acc, b) => acc + Number(b.senior_citizens || 0), 0);
    const totalIndigent = lguData.reduce((acc, b) => acc + Number(b.indigent_households || 0), 0);

    // Prepare chart data
    const populationComparison = lguData.map(b => ({
      name: b.Barangay?.barangay_name || `ID ${b.barangay_id}`,
      Residents: b.total_residents || 0,
      Households: b.total_households || 0
    }));

    const sectorBreakdown = [
      { name: 'Senior Citizens', value: totalSeniors },
      { name: 'Registered Voters', value: lguData.reduce((sum, b) => sum + (b.registered_voters || 0), 0) },
      { name: 'PWD', value: lguData.reduce((sum, b) => sum + (b.pwd_count || 0), 0) },
      { name: '4Ps Beneficiaries', value: lguData.reduce((sum, b) => sum + (b.four_ps_beneficiaries || 0), 0) },
    ];

    return (
      <div className="space-y-6">
        {/* LGU/DILG Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-xl shadow-md text-white gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="flex -space-x-2 shrink-0">
                <img 
                  src="https://th.bing.com/th/id/OIP.TJGmNXAUxL0EYn2naHNWXwAAAA?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3" 
                  alt="CPRS Logo" 
                  className="w-8 h-8 object-contain drop-shadow-sm relative z-20"
                />
                <img 
                  src="https://tse2.mm.bing.net/th/id/OIP.cv_hPyPi0IBMmoRjwNvLtAHaEK?rs=1&pid=ImgDetMain&o=7&rm=3" 
                  alt="DILG Logo" 
                  className="w-8 h-8 object-contain drop-shadow-sm relative z-10"
                />
              </div>
              {user?.role === 'super_admin' ? 'DILG Administrator Overview' : 'Executive LGU Dashboard'}
            </h1>
            <p className="text-slate-300 mt-1">Consolidated analytics across all Mamburao Barangays</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user?.role === 'super_admin' && (
              <>
                <Link to="/settings" className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <PlusCircle size={14} /> Approve Accounts
                </Link>
                <Link to="/map" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <TrendingUp size={14} /> GIS View
                </Link>
              </>
            )}
            {!isLguViewer && user?.role === 'super_admin' && (
               <button onClick={() => toast('DILG Report Export is generating...', { icon: '⏳' })} className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-xs font-bold flex items-center gap-1.5">
                 <Download size={14} /> Export Summary
               </button>
            )}
          </div>
        </div>

        {/* LGU Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Municipal Residents" value={totalResidents} icon={Users} color="purple" />
          <StatCard title="Total Households" value={totalHouseholds} icon={Home} color="blue" />
          <StatCard title="Total Senior Citizens" value={totalSeniors} icon={Users} color="gold" />
          <StatCard title="Indigent Households" value={totalIndigent} icon={TrendingUp} color="red" />
        </div>

        {/* LGU Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-5 lg:col-span-2 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Users size={18} className="text-purple-600" /> Population by Barangay
            </h3>
            <div className="h-80 w-full">
              {populationComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={populationComparison} margin={{ top: 5, right: 30, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} angle={-45} textAnchor="end" />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} />
                    <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="Residents" fill="#8E44AD" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Households" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 font-medium">No analytics computed yet. Run the /analytics/compute job.</div>
              )}
            </div>
          </div>

          <div className="card p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <PieChart size={18} className="text-indigo-500" /> Consolidated Sectors
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sectorBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {sectorBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── NORMAL BARANGAY RENDER BLOCK ───────────────────────────────────────────
  const genderData = stats?.gender_counts?.map(g => ({
    name: g.gender.charAt(0).toUpperCase() + g.gender.slice(1),
    value: Number(g.count)
  })) || [];

  const ageData = stats?.age_groups?.map(a => ({
    name: a.age_group,
    Residents: Number(a.count)
  })) || [];

  const docsData = stats?.monthly_docs?.map(d => ({
    month: new Date(d.month + '-01').toLocaleString('default', { month: 'short' }),
    Requests: Number(d.count)
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2 shrink-0 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <img 
              src="https://th.bing.com/th/id/OIP.TJGmNXAUxL0EYn2naHNWXwAAAA?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3" 
              alt="CPRS Logo" 
              className="w-8 h-8 object-contain relative z-20"
            />
            <img 
              src="https://tse2.mm.bing.net/th/id/OIP.cv_hPyPi0IBMmoRjwNvLtAHaEK?rs=1&pid=ImgDetMain&o=7&rm=3" 
              alt="DILG Logo" 
              className="w-8 h-8 object-contain relative z-10"
            />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl text-gray-800 font-bold">Barangay Overview</h1>
            <p className="text-xs md:text-sm text-gray-500 italic">Centralized People's Reporting System</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Link to="/residents" className="flex-1 sm:flex-none btn btn-primary flex justify-center text-xs px-3">
            <PlusCircle size={16} /> Add Resident
          </Link>
          <Link to="/reports" className="flex-1 sm:flex-none btn btn-secondary flex justify-center text-xs px-3">
            <TrendingUp size={16} /> View Reports
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Residents" value={stats?.total || 0} icon={Users} color="blue" />
        <StatCard title="Total Households" value={stats?.households || 0} icon={Home} color="gold" />
        <StatCard title="Active KP Cases" value={stats?.active_cases || 0} icon={ShieldAlert} color="red" />
        <StatCard title="Pending Docs" value={stats?.pending_docs || 0} icon={FileText} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Users size={18} className="text-[#1B4F72]" /> Population by Age Group
          </h3>
          <div className="h-72 w-full">
            {ageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13 }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="Residents" fill="#2E86C1" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No age data available</div>
            )}
          </div>
        </div>

        <div className="card p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <PieChart size={18} className="text-[#F39C12]" /> Gender Distribution
          </h3>
          <div className="h-64 w-full">
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No gender data</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card flex flex-col justify-center items-center p-6 md:p-8 bg-gradient-to-br from-[#1B4F72] to-[#154360] text-white">
          <h3 className="text-xl font-bold mb-2">Sector Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 w-full mt-6">
            <div className="flex justify-between items-center border-b border-white/20 pb-2">
              <span className="text-white/80">Senior Citizens</span>
              <span className="font-mono font-bold text-lg">{stats?.seniors || 0}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/20 pb-2">
              <span className="text-white/80">Reg. Voters</span>
              <span className="font-mono font-bold text-lg text-[#F39C12]">{stats?.voters || 0}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-white/80">Children (0-17)</span>
              <span className="font-mono font-bold text-lg">{stats?.children || 0}</span>
            </div>
          </div>
        </div>

        <div className="card p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FileText size={18} className="text-[#27AE60]" /> Map of Document Requests (6 Months)
          </h3>
          <div className="h-48 w-full">
            {docsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={docsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="Requests" stroke="#27AE60" strokeWidth={3} strokeOpacity={0.8} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No request data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
