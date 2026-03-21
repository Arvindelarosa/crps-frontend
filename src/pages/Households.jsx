import toast from 'react-hot-toast';
import React, { useEffect, useState } from 'react';
import { Home, PlusCircle, MapPin, Zap, Droplet, Archive, Edit, Trash2, UserCheck, RefreshCcw } from 'lucide-react';
import { householdsAPI } from '../api';
import { useAuthStore } from '../store';
import HouseholdMemberBadge from '../components/households/HouseholdMemberBadge';
import Modal from '../components/ui/Modal';
import HouseholdForm from '../components/households/HouseholdForm';

const Households = () => {
  const { canEdit, canDelete } = useAuthStore();
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isArchiveView, setIsArchiveView] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHousehold, setEditingHousehold] = useState(null);

  const fetchHouseholds = async () => {
    setLoading(true);
    try {
      const res = isArchiveView 
        ? await householdsAPI.getDeleted()
        : await householdsAPI.getAll();
      if (res.data.success) {
        setHouseholds(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, [isArchiveView]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to archive this household?')) {
      try {
        await householdsAPI.remove(id);
        toast.success("Household moved to archive.");
        fetchHouseholds();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Archive failed');
      }
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm('Are you sure you want to restore this household?')) {
      try {
        await householdsAPI.restore(id);
        toast.success("Household successfully restored.");
        fetchHouseholds();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Restore failed');
      }
    }
  };

  const handleAddNew = () => {
    setEditingHousehold(null);
    setIsModalOpen(true);
  };

  const handleEdit = (household) => {
    setEditingHousehold(household);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchHouseholds();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl text-emerald-800 font-bold">Households Tracker</h1>
          <p className="text-sm text-gray-500">Manage household assignments and living conditions</p>
        </div>
        <div className="flex gap-3">
          {canDelete() && (
            <button 
              className={`btn ${isArchiveView ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200' : 'btn-ghost hover:bg-slate-100'}`}
              onClick={() => setIsArchiveView(!isArchiveView)}
            >
              {isArchiveView ? <UserCheck size={18} /> : <Archive size={18} />} 
              {isArchiveView ? 'View Active' : 'Archive'}
            </button>
          )}
          {canEdit() && (
            <button className="btn btn-primary bg-emerald-700 hover:bg-emerald-800 border-none" onClick={handleAddNew}>
              <PlusCircle size={18} /> Add Household
            </button>
          )}
        </div>
      </div>

      <div className="card p-5 shadow-sm border border-gray-100 mt-2">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Household Code</th>
                  <th>Location / Address</th>
                  <th>Members / Family Head</th>
                  <th>Housing Details</th>
                  <th>Utilities</th>
                  {isArchiveView && <th>Deleted Date</th>}
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {households.map((h) => (
                  <tr key={h.id}>
                    <td className="font-mono text-[13px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 inline-block rounded border border-emerald-100 mt-2 ml-2">{h.household_code}</td>
                    <td>
                      <div className="font-medium text-gray-800 mb-1 max-w-[200px] truncate uppercase text-[13px]" title={h.address}>
                        {h.address}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium tracking-wide uppercase">
                        <MapPin size={12} className="text-emerald-500" /> {h.purok_sitio || 'No Purok/Sitio'}
                      </div>
                    </td>
                    <td>
                      <HouseholdMemberBadge members={h.members} />
                    </td>
                    <td>
                      <div className="text-[13px] font-medium text-slate-700 capitalize">{h.house_type.replace('_',' ')}</div>
                      <div className="text-xs text-slate-500 capitalize">{h.house_material.replace('_',' ')} Structure</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${h.has_electricity ? 'text-amber-600' : 'text-slate-400'}`} title="Electricity">
                          <Zap size={15} className={h.has_electricity ? 'fill-amber-500' : ''} /> {h.has_electricity ? 'ON' : 'N/A'}
                        </div>
                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${h.has_water_supply ? 'text-blue-600' : 'text-slate-400'}`} title="Water Supply">
                          <Droplet size={15} className={h.has_water_supply ? 'fill-blue-500' : ''} /> {h.has_water_supply ? 'ON' : 'N/A'}
                        </div>
                      </div>
                    </td>
                    {isArchiveView && (
                      <td className="text-xs text-red-600 font-medium">
                        {h.updated_at ? new Date(h.updated_at).toLocaleDateString() : 'Unknown'}
                      </td>
                    )}
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        {!isArchiveView && canEdit() && (
                          <button 
                             className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-all" 
                             title="Edit Household"
                             onClick={() => handleEdit(h)}
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {!isArchiveView && canDelete() && (
                          <button 
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-all" 
                            title="Archive Household"
                            onClick={() => handleDelete(h.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        {isArchiveView && canDelete() && (
                          <button 
                            className="px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg border border-green-200 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" 
                            title="Restore Household"
                            onClick={() => handleRestore(h.id)}
                          >
                            <RefreshCcw size={14} /> Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {households.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-500 bg-emerald-50/30">
                      <div className="bg-emerald-100/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                         <Home size={28} className="text-emerald-500" />
                      </div>
                      <p className="font-medium text-slate-600">No households found.</p>
                      <p className="text-sm mt-1">Start by adding your first household record.</p>
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
         title={editingHousehold ? "Edit Household Details" : "Register a New Household"}
         size="lg"
      >
         <HouseholdForm 
            onSuccess={handleFormSuccess} 
            onCancel={() => setIsModalOpen(false)} 
            editData={editingHousehold} 
         />
      </Modal>

    </div>
  );
};

export default Households;
