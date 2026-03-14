import React, { useEffect, useState } from 'react';
import { 
  Users, Home, FileText, ShieldAlert,
  TrendingUp, Download, PlusCircle
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { Link } from 'react-router-dom';
import StatCard from '../components/ui/StatCard';
import { reportsAPI } from '../api';
import { formatCurrency } from '../utils/formatters';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await reportsAPI.getDashboardStats();
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#1B4F72] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const COLORS = ['#1B4F72', '#F39C12', '#27AE60', '#C0392B', '#8E44AD'];

  // Format Recharts data
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
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl text-gray-800 font-bold">Barangay Overview</h1>
          <p className="text-sm text-gray-500">Welcome to the Centralized Residents Profiling System</p>
        </div>
        <div className="flex gap-3">
          <Link to="/residents" className="btn btn-primary">
            <PlusCircle size={18} /> Add Resident
          </Link>
          <Link to="/reports" className="btn btn-secondary">
            <TrendingUp size={18} /> View Reports
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
                  <Tooltip 
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
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
                  <Pie
                    data={genderData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
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
        <div className="card flex flex-col justify-center items-center p-8 bg-gradient-to-br from-[#1B4F72] to-[#154360] text-white">
          <h3 className="text-xl font-bold mb-2">Sector Overview</h3>
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 w-full mt-6">
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
