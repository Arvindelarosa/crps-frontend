import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, X, Home } from 'lucide-react';
import { householdsAPI } from '../../api';

const householdSchema = z.object({
  address: z.string().min(3, 'Address is required'),
  purok_sitio: z.string().optional(),
  house_type: z.enum(['owned', 'rented', 'shared', 'informal_settler'], { required_error: 'House type is required' }),
  house_material: z.enum(['concrete', 'wood', 'mixed', 'light_materials'], { required_error: 'Material type is required' }),
  socioeconomic_status: z.enum(['lower', 'middle', 'upper'], { required_error: 'Status is required' }),
  has_electricity: z.boolean().default(false),
  has_water_supply: z.boolean().default(false),
  waste_management: z.string().optional(),
  toilet_type: z.string().optional(),
});

const HouseholdForm = ({ onSuccess, onCancel, editData = null }) => {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(householdSchema),
    defaultValues: editData || {
      address: '', purok_sitio: '', house_type: 'owned', house_material: 'concrete',
      socioeconomic_status: 'lower', has_electricity: false, has_water_supply: false,
      waste_management: '', toilet_type: ''
    }
  });

  useEffect(() => {
    if (editData) reset(editData);
  }, [editData, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (editData && editData.id) {
        await householdsAPI.update(editData.id, data);
      } else {
        await householdsAPI.create(data);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error saving household data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 mb-6 flex items-center gap-3">
         <div className="bg-emerald-100 p-2 rounded-full text-emerald-700">
            <Home size={24} />
         </div>
         <div>
            <h3 className="font-bold text-emerald-800">Household Details</h3>
            <p className="text-xs text-slate-500">Record physical location and living conditions.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Full Address / Street <span className="text-red-500">*</span></label>
          <input type="text" className="form-input" {...register('address')} placeholder="123 Mabini St" />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
        </div>
        <div>
          <label className="form-label">Purok / Sitio</label>
          <input type="text" className="form-input" {...register('purok_sitio')} placeholder="Purok 1" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Ownership / Type <span className="text-red-500">*</span></label>
          <select className="form-input" {...register('house_type')}>
            <option value="owned">Owned</option>
            <option value="rented">Rented</option>
            <option value="shared">Shared</option>
            <option value="informal_settler">Informal Settler</option>
          </select>
        </div>
        <div>
          <label className="form-label">Socioeconomic Status <span className="text-red-500">*</span></label>
          <select className="form-input" {...register('socioeconomic_status')}>
            <option value="lower">Lower Income</option>
            <option value="middle">Middle Income</option>
            <option value="upper">Upper Income</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="form-label">Housing Material</label>
          <select className="form-input" {...register('house_material')}>
            <option value="concrete">Concrete / Cement</option>
            <option value="wood">Wood / Semi-Concrete</option>
            <option value="mixed">Mixed</option>
            <option value="light_materials">Light Materials</option>
          </select>
        </div>
        <div>
          <label className="form-label">Toilet Facility</label>
          <select className="form-input" {...register('toilet_type')}>
            <option value="">Select...</option>
            <option value="flush">Water-sealed (Flush)</option>
            <option value="pit_latrine">Pit Latrine</option>
            <option value="shared">Shared / Public</option>
            <option value="none">None (Open)</option>
          </select>
        </div>
        <div>
          <label className="form-label">Waste Management</label>
          <select className="form-input" {...register('waste_management')}>
            <option value="">Select...</option>
            <option value="collected">Collected by LGU</option>
            <option value="burned">Burned</option>
            <option value="buried">Buried</option>
            <option value="composted">Composted</option>
            <option value="dumped">Dumped Anywhere</option>
          </select>
        </div>
      </div>

      <hr className="my-6 border-slate-200" />
      <h3 className="font-bold text-gray-800 mb-4">Basic Utilities Access</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-yellow-200 transition-colors">
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded" {...register('has_electricity')} />
            Has Access to Electricity Source
          </label>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded" {...register('has_water_supply')} />
            Has Access to Safe Water Supply
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 mt-8">
        <button type="button" onClick={onCancel} className="btn btn-ghost px-6" disabled={loading}>
           <X size={18} /> Cancel
        </button>
        <button type="submit" className="btn btn-primary bg-emerald-700 hover:bg-emerald-800 border-none px-8" disabled={loading}>
          {loading ? (
             <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</span>
          ) : (
             <span className="flex items-center gap-2"><Save size={18} /> Save Household</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default HouseholdForm;
