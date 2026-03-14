import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, X, UserPlus } from 'lucide-react';
import { usersAPI } from '../../api';

const userSchema = z.object({
  username: z.string().min(4, 'Username must be at least 4 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  role: z.enum(['super_admin', 'barangay_admin', 'staff'], { required_error: 'Role is required' }),
  position: z.string().optional(),
});

const UserForm = ({ onSuccess, onCancel, editData = null }) => {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: editData || {
      username: '', password: '', full_name: '', email: '', role: 'staff', position: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (editData && editData.id) {
        // Remove password from payload if it's empty during edit
        const payload = { ...data };
        if (!payload.password) delete payload.password;
        await usersAPI.update(editData.id, payload);
      } else {
        if (!data.password) {
           alert("Password is required for new accounts");
           setLoading(false);
           return;
        }
        await usersAPI.create(data);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving user account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      
      <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
         <div className="bg-blue-100 p-2 rounded-full text-[#1B4F72]">
            <UserPlus size={24} />
         </div>
         <div>
            <h3 className="font-bold text-[#1B4F72]">{editData ? "Edit User Account" : "Create New User Account"}</h3>
            <p className="text-xs text-blue-800/70">Manage access and permissions to the system.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Full Name <span className="text-red-500">*</span></label>
          <input type="text" className="form-input" {...register('full_name')} placeholder="Juan Dela Cruz" />
          {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
        </div>
        <div>
          <label className="form-label">Email Context (For OTP/Login) <span className="text-red-500">*</span></label>
          <input type="email" className="form-input" {...register('email')} placeholder="email@example.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">System Role <span className="text-red-500">*</span></label>
          <select className="form-input" {...register('role')}>
            <option value="staff">Staff (Limited Access)</option>
            <option value="barangay_admin">Barangay Admin (Full Access to Brgy)</option>
            <option value="super_admin">Super Admin (Global Access)</option>
          </select>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
        </div>
        <div>
          <label className="form-label">Official Position / Title</label>
          <input type="text" className="form-input" {...register('position')} placeholder="e.g. Brgy. Secretary" />
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50/50 mt-2">
         <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-2 text-sm">Login Credentials</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="form-label">Username <span className="text-red-500">*</span></label>
               <input type="text" className="form-input" {...register('username')} placeholder="jdelacruz" />
               {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>
            <div>
               <label className="form-label">{editData ? "Reset Password" : "Password"} <span className="text-red-500">{!editData && '*'}</span></label>
               <input type="password" className="form-input" {...register('password')} placeholder={editData ? "Leave blank to keep unchanged" : "••••••••"} />
               {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
         </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
        <button type="button" onClick={onCancel} className="btn btn-ghost px-6" disabled={loading}>
           <X size={18} /> Cancel
        </button>
        <button type="submit" className="btn btn-primary bg-[#1B4F72] px-8" disabled={loading}>
          {loading ? (
             <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</span>
          ) : (
             <span className="flex items-center gap-2"><Save size={18} /> Save Account</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
