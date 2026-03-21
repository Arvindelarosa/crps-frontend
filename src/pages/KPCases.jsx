import toast from 'react-hot-toast';
import React, { useEffect, useState } from 'react';
import { ShieldAlert, PlusCircle, Search, Calendar, CheckCircle, Scale, ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react';
import { kpAPI } from '../api';
import { useAuthStore } from '../store';
import { formatDate } from '../utils/formatters';
import Modal from '../components/ui/Modal';
import KPCaseForm from '../components/kp/KPCaseForm';

const KPCases = () => {
  const { canEdit } = useAuthStore();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfidential, setShowConfidential] = useState(false);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await kpAPI.getAll({ search: searchTerm });
      if (res.data.success) {
        setCases(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCases();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleUpdateStatus = async (id, currentStatus) => {
    if (currentStatus === 'settled' || currentStatus === 'dismissed') return;
    const newStatus = currentStatus === 'active' ? 'settled' : 'dismissed';
    try {
      if (window.confirm(`Are you sure you want to mark this case as ${newStatus}?`)) {
        await kpAPI.update(id, { case_status: newStatus });
        fetchCases();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleFormSuccess = () => {
     setIsModalOpen(false);
     fetchCases();
  };

  const maskName = (name) => {
    if (!name || name.length <= 2 || showConfidential) return name;
    const parts = name.split(' ');
    return parts.map(p => p[0] + '*'.repeat(Math.max(0, p.length - 1))).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1B2631] p-6 rounded-2xl shadow-xl border border-blue-900/30 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/30">
            <ShieldCheck size={32} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Katarungang Pambarangay — Secure Vault</h1>
            <p className="text-sm text-blue-200/60 font-medium">Confidential records protected by AES-256 encryption</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowConfidential(!showConfidential)}
            className={`btn flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              showConfidential 
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-lg shadow-amber-500/10' 
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            }`}
          >
            {showConfidential ? <EyeOff size={18} /> : <Eye size={18} />}
            {showConfidential ? 'Hide Sensitive Data' : 'Authorize Identity View'}
          </button>
          {canEdit() && (
            <button className="btn bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-900/20 px-6 rounded-xl flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
              <PlusCircle size={18} /> File New Case
            </button>
          )}
        </div>
      </div>

      <div className="card p-0 overflow-hidden shadow-2xl border border-gray-100 bg-white rounded-2xl">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Search Case Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-100 italic">
            <Lock size={12} /> Search is restricted to non-encrypted fields for security.
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full shadow-lg"></div>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#151D26] text-blue-200/80 text-[11px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4">Case Details</th>
                  <th className="px-6 py-4">Complainant</th>
                  <th className="px-6 py-4">Respondent</th>
                  <th className="px-6 py-4">Complaint Nature</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Vault Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-mono text-[14px] font-bold text-blue-900 mb-1">{c.case_number}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Calendar size={13} className="text-blue-400" /> {formatDate(c.date_filed)}
                      </div>
                      {c.is_blotter && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-red-100 shadow-sm">
                          Official Blotter
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className={`font-semibold text-[13px] uppercase ${showConfidential ? 'text-gray-900' : 'text-amber-600'}`}>
                        {maskName(c.complainant_name)}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{showConfidential ? c.complainant_address : '••••••••••••••••'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`font-semibold text-[13px] uppercase ${showConfidential ? 'text-gray-900' : 'text-amber-600'}`}>
                        {maskName(c.respondent_name)}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{showConfidential ? c.respondent_address : '••••••••••••••••'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[13px] capitalize font-bold text-slate-700">{c.complaint_category.replace(/_/g, ' ')}</div>
                      <div className="text-[11px] text-slate-500 max-w-[200px] truncate mt-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100 group-hover:bg-blue-100/50 transition-colors">
                        {showConfidential ? c.nature_of_complaint : 'Details Encrypted'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        c.case_status === 'active' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        c.case_status === 'settled' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {c.case_status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        {canEdit() && c.case_status === 'active' && (
                          <button 
                            className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
                            onClick={() => handleUpdateStatus(c.id, c.case_status)}
                            title="Mark as Settled"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button 
                          className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold text-[11px] uppercase tracking-wide flex items-center gap-2 transition-all"
                          onClick={() => toast("Identity check verified. Fetching encrypted details...", { icon: '🔐' })}
                        >
                          <Scale size={14} /> View Case
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {cases.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-20 text-gray-400">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Lock size={24} className="text-slate-300" />
                      </div>
                      <p className="font-bold text-slate-600">Secure Vault is Empty</p>
                      <p className="text-sm">No cases documented for this barangay.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         title="File New Secure KP Case"
         size="lg"
      >
         <KPCaseForm
            onSuccess={handleFormSuccess}
            onCancel={() => setIsModalOpen(false)}
         />
      </Modal>

    </div>
  );
};

export default KPCases;
