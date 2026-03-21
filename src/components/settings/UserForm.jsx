import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, X, UserPlus, Lock } from 'lucide-react';
import { usersAPI } from '../../api';
import { useAuthStore } from '../../store';

const userSchema = z.object({
  username: z.string().min(4, 'Username must be at least 4 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  confirm_password: z.string().optional().or(z.literal('')),
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  role: z.enum(['super_admin', 'barangay_admin', 'staff'], { required_error: 'Role is required' }),
  position: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.confirm_password) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

const UserForm = ({ onSuccess, onCancel, editData = null }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  // If editing an existing user AND the user ID doesn't match the logged-in user's ID
  const isEditingOtherUser = editData && editData.id !== user?.id;

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
        delete payload.confirm_password;
        if (!payload.password) delete payload.password;
        await usersAPI.update(editData.id, payload);
      } else {
        if (!data.password) {
           toast.error("Password is required for new accounts");
           setLoading(false);
           return;
        }
        const payload = { ...data };
        delete payload.confirm_password;
        await usersAPI.create(payload);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error saving user account');
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
         <div className="flex-1">
            <h3 className="font-bold text-[#1B4F72]">{editData ? "Edit User Account" : "Create New User Account"}</h3>
            <p className="text-xs text-blue-800/70">Manage access and permissions to the system.</p>
         </div>
         {isEditingOtherUser && (
            <div className="bg-amber-100 text-amber-700 text-[10px] font-bold uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-amber-200">
               <Lock size={12} /> Restricted Edit 
            </div>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Full Name <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            className={`form-input ${isEditingOtherUser ? 'opacity-70 bg-slate-100 cursor-not-allowed select-none text-gray-500' : ''}`}
            {...register('full_name')} 
            placeholder="Juan Dela Cruz" 
            readOnly={isEditingOtherUser}
          />
          {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
        </div>
        <div>
          <label className="form-label">Email Context (For OTP/Login) <span className="text-red-500">*</span></label>
          <input 
            type="email" 
            className={`form-input ${isEditingOtherUser ? 'opacity-70 bg-slate-100 cursor-not-allowed select-none text-gray-500' : ''}`}
            {...register('email')} 
            placeholder="email@example.com" 
            readOnly={isEditingOtherUser}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">System Role <span className="text-red-500">*</span></label>
          <select className="form-input border-blue-300 bg-blue-50/30" {...register('role')}>
            <option value="staff">Staff (Limited Access)</option>
            <option value="barangay_admin">Barangay Admin (Full Access to Brgy)</option>
            <option value="super_admin">Super Admin (Global Access)</option>
          </select>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
        </div>
        <div>
          <label className="form-label">Official Position / Title</label>
          <input 
            type="text" 
            className={`form-input ${isEditingOtherUser ? 'opacity-70 bg-slate-100 cursor-not-allowed select-none text-gray-500' : ''}`}
            {...register('position')} 
            placeholder="e.g. Brgy. Secretary" 
            readOnly={isEditingOtherUser}
          />
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50/50 mt-2">
         <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-2 text-sm flex items-center justify-between">
           Login Credentials {isEditingOtherUser && <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Locked by Owner</span>}
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="form-label">Username <span className="text-red-500">*</span></label>
               <input 
                  type="text" 
                  className={`form-input ${isEditingOtherUser ? 'opacity-70 bg-slate-100 cursor-not-allowed select-none text-gray-500' : ''}`}
                  {...register('username')} 
                  placeholder="jdelacruz" 
                  readOnly={isEditingOtherUser}
               />
               {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>
            <div>
               <label className="form-label">{editData ? "Reset Password" : "Password"} <span className="text-red-500">{!editData && '*'}</span></label>
               <input 
                  type="password" 
                  className={`form-input mb-1 ${isEditingOtherUser ? 'opacity-70 bg-slate-100 cursor-not-allowed select-none text-gray-400' : ''}`}
                  {...register('password')} 
                  placeholder={isEditingOtherUser ? "••••••••" : (editData ? "Leave blank to keep unchanged" : "••••••••")} 
                  readOnly={isEditingOtherUser}
               />
               {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
               <label className="form-label">Confirm {editData ? "New" : ""} Password <span className="text-red-500">{!editData && '*'}</span></label>
               <input 
                  type="password" 
                  className={`form-input ${isEditingOtherUser ? 'opacity-70 bg-slate-100 cursor-not-allowed select-none text-gray-400' : ''}`}
                  {...register('confirm_password')} 
                  placeholder="••••••••" 
                  readOnly={isEditingOtherUser}
               />
               {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
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
