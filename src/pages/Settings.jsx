import toast from 'react-hot-toast';
import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Users, Building, ShieldCheck, UserPlus, Edit, Power, PowerOff } from 'lucide-react';
import { usersAPI } from '../api';
import { useAuthStore } from '../store';
import Modal from '../components/ui/Modal';
import UserForm from '../components/settings/UserForm';
import BarangayProfile from '../components/settings/BarangayProfile';
import SecuritySettings from '../components/settings/SecuritySettings';

const Settings = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'barangay', 'security'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll();
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (id, currentStatus) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user account?`)) {
      try {
        await usersAPI.toggleActive(id);
        fetchUsers();
      } catch (err) {
        toast.error('Failed to toggle user status');
      }
    }
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl text-gray-800 font-bold">System Settings</h1>
          <p className="text-sm text-gray-500">Manage system users, roles, and administrative configurations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Settings Navigation */}
        <div className="lg:col-span-1 space-y-4 text-sm font-medium">
          <button 
            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
              activeTab === 'users' ? 'bg-[#2E86C1] text-white shadow-md shadow-[#2E86C1]/20' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
            onClick={() => setActiveTab('users')}
          >
            <span className="flex items-center gap-3"><Users size={18} /> User Management</span>
          </button>
          
          <button 
            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
              activeTab === 'barangay' ? 'bg-[#2E86C1] text-white shadow-md shadow-[#2E86C1]/20' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
            onClick={() => setActiveTab('barangay')}
          >
            <span className="flex items-center gap-3"><Building size={18} /> Barangay Profile</span>
          </button>

          <button 
            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
              activeTab === 'security' ? 'bg-[#2E86C1] text-white shadow-md shadow-[#2E86C1]/20' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
            onClick={() => setActiveTab('security')}
          >
            <span className="flex items-center gap-3"><ShieldCheck size={18} /> Security Options</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'users' && (
            <div className="card p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                   <SettingsIcon size={18} className="text-[#1B4F72]" /> Accounts & Permissions
                 </h3>
                 {currentUser.role === 'super_admin' && (
                   <button className="btn btn-primary btn-sm bg-[#1B4F72] hover:bg-[#154360] border-none" onClick={handleAddNew}>
                     <UserPlus size={16} /> New User Account
                   </button>
                 )}
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin w-8 h-8 border-4 border-[#1B4F72] border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead className="bg-[#F8FAFC]">
                      <tr>
                        <th>Account Name</th>
                        <th>Role & Position</th>
                        <th>Barangay</th>
                        <th>Status</th>
                        <th className="text-right">Manage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className={!u.is_active ? 'opacity-60 bg-gray-50' : ''}>
                          <td>
                            <div className="font-medium text-gray-800">{u.full_name}</div>
                            <div className="text-xs text-gray-500 font-mono">{u.username}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{u.email}</div>
                          </td>
                          <td>
                            <div className="text-sm font-semibold text-[#1B4F72] capitalize">{u.role.replace('_', ' ')}</div>
                            <div className="text-xs text-gray-500">{u.position || 'No Title'}</div>
                          </td>
                          <td className="text-sm text-gray-600">
                             {u.Barangay ? u.Barangay.barangay_name : 'System-wide'}
                          </td>
                          <td>
                            <span className={`status-badge ${u.is_active ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                              {u.is_active ? 'ACTIVE' : 'PENDING APPROVAL'}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex justify-end gap-2">
                              {currentUser.role === 'super_admin' && (
                                 <>
                                    <button onClick={() => handleEdit(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded transition-colors" title="Edit Profile">
                                      <Edit size={16} />
                                    </button>
                                    {u.id !== currentUser.id && (
                                      <button 
                                        className={`p-1.5 border border-transparent rounded transition-colors ${u.is_active ? 'text-orange-600 hover:bg-orange-50 hover:border-orange-200' : 'text-green-600 hover:bg-green-50 hover:border-green-200'}`}
                                        onClick={() => handleToggleActive(u.id, u.is_active)}
                                        title={u.is_active ? 'Deactivate Account' : 'Approve Account'}
                                      >
                                        {u.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                                      </button>
                                    )}
                                 </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'barangay' && (
            <BarangayProfile 
              barangayId={currentUser.barangay_id} 
              currentUser={currentUser} 
            />
          )}

          {activeTab === 'security' && (
            <SecuritySettings currentUser={currentUser} />
          )}
        </div>

      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit User Account" : "Create New User Account"}
        size="md"
      >
        <UserForm
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
          editData={editingUser}
        />
      </Modal>

    </div>
  );
};

export default Settings;
