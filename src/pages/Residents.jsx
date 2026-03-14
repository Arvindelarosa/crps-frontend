import React, { useEffect, useState } from 'react';
import { Search, PlusCircle, Filter, Edit, Trash2, Archive, UserCheck, ShieldAlert } from 'lucide-react';
import { residentsAPI } from '../api';
import { useAuthStore } from '../store';
import { calculateAge } from '../utils/formatters';
import SectorBadge, { getResidentSectors } from '../components/residents/SectorBadge';
import Modal from '../components/ui/Modal';
import ResidentForm from '../components/residents/ResidentForm';

const Residents = () => {
  const { canEdit, canDelete } = useAuthStore();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState(null);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const res = await residentsAPI.getAll({ search: searchTerm, sector: filterSector });
      if (res.data.success) {
        setResidents(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchResidents();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterSector]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to soft delete this resident? They will be moved to the archive.')) {
      const reason = window.prompt('Please enter a reason for deletion:');
      if (!reason) return;
      try {
        await residentsAPI.softDelete(id, reason);
        fetchResidents();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };
  
  const handleAddNew = () => {
    setEditingResident(null);
    setIsModalOpen(true);
  };
  
  const handleEdit = (resident) => {
    setEditingResident(resident);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchResidents(); // Refresh the table
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl text-gray-800 font-bold">Residents Management</h1>
          <p className="text-sm text-gray-500">View, add, and manage barangay residents</p>
        </div>
        <div className="flex gap-3">
          {canDelete() && (
            <button className="btn btn-ghost hover:bg-slate-100">
               <Archive size={18} /> Archive
            </button>
          )}
          {canEdit() && (
             <button className="btn btn-primary" onClick={handleAddNew}>
                <PlusCircle size={18} /> Add Resident
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
              placeholder="Search by name, ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-gray-500" />
            <select
              className="form-input bg-gray-50"
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
            >
              <option value="">All Sectors</option>
              <option value="is_senior_citizen">Senior Citizens</option>
              <option value="is_pwd">PWDs</option>
              <option value="is_solo_parent">Solo Parents</option>
              <option value="is_registered_voter">Registered Voters</option>
              <option value="is_student">Students</option>
              <option value="is_4ps_beneficiary">4Ps Beneficiaries</option>
            </select>
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
                  <th>Resident Code</th>
                  <th>Full Name</th>
                  <th>Age/Gender</th>
                  <th>Address</th>
                  <th>Sectors</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((r) => {
                  const sectors = getResidentSectors(r);
                  return (
                    <tr key={r.id}>
                      <td className="font-mono text-[13px] font-semibold text-gray-600">{r.resident_code}</td>
                      <td>
                        <div className="font-medium text-gray-800 uppercase">{r.last_name}, {r.first_name} {r.middle_name} {r.suffix}</div>
                        <div className="text-xs text-gray-500">{r.contact_number || 'No contact'}</div>
                      </td>
                      <td>
                        <div className="font-medium">{calculateAge(r.birthdate)} yrs</div>
                        <div className="text-xs text-gray-500 capitalize">{r.gender}</div>
                      </td>
                      <td>
                        <div className="text-[13px] max-w-[200px] truncate uppercase font-medium text-slate-700" title={r.Household?.address}>
                          {r.Household?.address || 'No Address Assgined'}
                        </div>
                        <div className="text-[11px] text-gray-500 uppercase tracking-widest">{r.Household?.purok_sitio}</div>
                      </td>
                      <td className="max-w-[180px]">
                        <div className="flex flex-wrap">
                          {sectors.map(s => <SectorBadge key={s} sectorKey={s} />)}
                          {sectors.length === 0 && <span className="text-[10px] text-gray-400 font-mono tracking-widest border border-slate-200 px-1 rounded bg-slate-50 uppercase">None</span>}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          {canEdit() && (
                            <button 
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-colors" 
                              title="Edit Resident"
                              onClick={() => handleEdit(r)}
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          {canDelete() && (
                            <button 
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors" 
                              title="Archive/Delete Resident"
                              onClick={() => handleDelete(r.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {residents.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500 bg-gray-50/50">
                      <ShieldAlert size={32} className="mx-auto text-gray-400 mb-2" />
                      No residents found. Try adjusting your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Dynamic Modal for Create / Edit */}
      <Modal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         title={editingResident ? "Edit Resident Profile" : "Add New Resident"}
         size="xl"
      >
         <ResidentForm 
            onSuccess={handleFormSuccess} 
            onCancel={() => setIsModalOpen(false)} 
            editData={editingResident} 
         />
      </Modal>

    </div>
  );
};

export default Residents;
