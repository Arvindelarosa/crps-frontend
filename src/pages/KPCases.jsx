import React, { useEffect, useState } from 'react';
import { ShieldAlert, PlusCircle, Search, Calendar, CheckCircle, Scale } from 'lucide-react';
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
      alert('Failed to update status');
    }
  };

  const handleFormSuccess = () => {
     setIsModalOpen(false);
     fetchCases();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl text-gray-800 font-bold">Katarungang Pambarangay</h1>
          <p className="text-sm text-gray-500">Manage barangay dispute records and mediation hearings (Lupon)</p>
        </div>
        <div className="flex gap-3">
          {canEdit() && (
            <button className="btn btn-primary bg-[#1B4F72] hover:bg-[#154360] border-none" onClick={() => setIsModalOpen(true)}>
              <PlusCircle size={18} /> File New Case
            </button>
          )}
        </div>
      </div>

      <div className="card p-5 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Search Case No., Complainant, or Respondent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin w-8 h-8 border-4 border-[#1B4F72] border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Case No. / Filed Date</th>
                  <th>Complainant</th>
                  <th>Respondent</th>
                  <th>Complaint Nature</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="font-mono text-[13px] font-semibold text-[#1B4F72] mb-1">{c.case_number}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} /> {formatDate(c.date_filed)}
                      </div>
                      {c.is_blotter && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded uppercase tracking-wider">
                          Blotter Entry
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="font-medium text-gray-800 uppercase text-[12px]">{c.complainant_name}</div>
                      <div className="text-[11px] text-gray-500 max-w-[150px] truncate" title={c.complainant_address}>{c.complainant_address || 'No address provided'}</div>
                    </td>
                    <td>
                      <div className="font-medium text-gray-800 uppercase text-[12px]">{c.respondent_name}</div>
                      <div className="text-[11px] text-gray-500 max-w-[150px] truncate" title={c.respondent_address}>{c.respondent_address || 'No address provided'}</div>
                    </td>
                    <td>
                      <div className="text-[13px] capitalize font-semibold text-slate-700">{c.complaint_category.replace(/_/g, ' ')}</div>
                      <div className="text-[11px] text-slate-500 max-w-[200px] truncate pt-0.5" title={c.nature_of_complaint}>
                        {c.nature_of_complaint}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${
                        c.case_status === 'active' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        c.case_status === 'settled' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        c.case_status === 'dismissed' ? 'bg-slate-100 text-slate-800 border border-slate-200' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {c.case_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        {canEdit() && c.case_status === 'active' && (
                          <button 
                            className="btn btn-sm btn-ghost border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => handleUpdateStatus(c.id, c.case_status)}
                            title="Mark as Settled"
                          >
                            <CheckCircle size={14} /> Settle
                          </button>
                        )}
                        <button className="btn btn-sm btn-ghost" title="View Hearings & Details" onClick={() => alert("Hearing Details coming soon.")}>
                          <Scale size={14} /> Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {cases.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-500 bg-slate-50/50">
                      <ShieldAlert size={36} className="mx-auto text-slate-300 mb-3" />
                      <p className="font-medium text-slate-600">No KP Cases or Blotters found.</p>
                      <p className="text-sm text-slate-400">Search for a case number or file a new one.</p>
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
         title="File New Case / Blotter"
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
