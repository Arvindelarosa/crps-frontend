import React, { useState } from 'react';
import { ShieldCheck, Lock, Save, Loader2, AlertCircle } from 'lucide-react';
import { usersAPI } from '../../api';
import toast from 'react-hot-toast';

const SecuritySettings = ({ currentUser }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      // In this system, user update endpoint handles password hashing if 'password' field is present
      const res = await usersAPI.update(currentUser.id, { 
        password: formData.password 
      });

      if (res.data.success) {
        toast.success('Password updated successfully!');
        setFormData({ password: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6 shadow-sm border border-gray-100 max-w-2xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b">
        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Security Options</h2>
          <p className="text-sm text-gray-500">Manage your account security and password</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3 text-amber-800">
        <AlertCircle size={20} className="flex-shrink-0" />
        <p className="text-xs">
          <strong>Tip:</strong> Use a strong password with a mix of letters, numbers, and symbols to keep your account secure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock size={14} /> New Password
            </label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter new password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock size={14} /> Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="btn btn-primary flex items-center gap-2 px-8"
            disabled={saving || !formData.password}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Updating...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecuritySettings;
