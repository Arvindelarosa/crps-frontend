import React, { useState, useEffect } from 'react';
import { Building, User, Phone, Mail, Map, Save, Loader2 } from 'lucide-react';
import { barangayAPI } from '../../api';
import toast from 'react-hot-toast';

const BarangayProfile = ({ barangayId, currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    barangay_name: '',
    captain_name: '',
    contact_number: '',
    email: '',
    latitude: '',
    longitude: ''
  });

  const fetchData = async () => {
    try {
      const res = await barangayAPI.getById(barangayId);
      if (res.data.success) {
        setFormData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load barangay profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (barangayId) {
      fetchData();
    }
  }, [barangayId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Authorization check
    if (currentUser.role !== 'super_admin' && currentUser.role !== 'barangay_admin') {
      toast.error('Only administrators can update the profile.');
      return;
    }

    setSaving(true);
    try {
      const res = await barangayAPI.update(barangayId, formData);
      if (res.data.success) {
        toast.success('Barangay profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-gray-400">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p>Loading profile...</p>
      </div>
    );
  }

  const isEditable = currentUser.role === 'super_admin' || currentUser.role === 'barangay_admin';

  return (
    <div className="card p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Building size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Barangay Profile</h2>
          <p className="text-sm text-gray-500">Official information and contact details of the barangay</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Building size={14} /> Barangay Name
            </label>
            <input
              type="text"
              name="barangay_name"
              className="form-input"
              value={formData.barangay_name}
              onChange={handleChange}
              disabled={!isEditable}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User size={14} /> Barangay Captain
            </label>
            <input
              type="text"
              name="captain_name"
              className="form-input"
              value={formData.captain_name}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Phone size={14} /> Contact Number
            </label>
            <input
              type="text"
              name="contact_number"
              className="form-input"
              value={formData.contact_number}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail size={14} /> Official Email
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Map size={14} /> Latitude
            </label>
            <input
              type="number"
              step="any"
              name="latitude"
              className="form-input"
              value={formData.latitude}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Map size={14} /> Longitude
            </label>
            <input
              type="number"
              step="any"
              name="longitude"
              className="form-input"
              value={formData.longitude}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
        </div>

        {isEditable && (
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2 px-8"
              disabled={saving}
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default BarangayProfile;
