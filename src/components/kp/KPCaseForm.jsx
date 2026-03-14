import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, X, Scale } from 'lucide-react';
import { kpAPI } from '../../api';

const kpSchema = z.object({
  complainant_name: z.string().min(2, 'Complainant name is required'),
  complainant_address: z.string().optional(),
  respondent_name: z.string().min(2, 'Respondent name is required'),
  respondent_address: z.string().optional(),
  complaint_category: z.enum(['civil', 'criminal', 'other'], { required_error: 'Category is required' }),
  nature_of_complaint: z.string().min(5, 'Please provide complaint details'),
  is_blotter: z.boolean().default(false),
});

const KPCaseForm = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(kpSchema),
    defaultValues: {
      complainant_name: '', complainant_address: '',
      respondent_name: '', respondent_address: '',
      complaint_category: 'civil', nature_of_complaint: '',
      is_blotter: false
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await kpAPI.create(data);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error filing the KP Case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 flex items-center gap-3 mb-6">
         <div className="bg-amber-100 p-2 rounded-full text-amber-700">
            <Scale size={24} />
         </div>
         <div>
            <h3 className="font-bold text-amber-800">New KP Case or Blotter</h3>
            <p className="text-xs text-slate-500">Record a new dispute for mediation by the Lupon.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="space-y-4 border-r md:border-r border-slate-200 md:pr-4">
            <h4 className="font-semibold text-slate-700 uppercase tracking-wider text-xs border-b border-slate-100 pb-2">Complainant Details</h4>
            <div>
               <label className="form-label">Name <span className="text-red-500">*</span></label>
               <input type="text" className="form-input" {...register('complainant_name')} placeholder="Juan Cruz" />
               {errors.complainant_name && <p className="text-red-500 text-xs mt-1">{errors.complainant_name.message}</p>}
            </div>
            <div>
               <label className="form-label">Address</label>
               <textarea className="form-input h-16 resize-none" {...register('complainant_address')} placeholder="123 St..."></textarea>
            </div>
         </div>

         <div className="space-y-4 md:pl-2">
            <h4 className="font-semibold text-slate-700 uppercase tracking-wider text-xs border-b border-slate-100 pb-2">Respondent Details</h4>
            <div>
               <label className="form-label">Name <span className="text-red-500">*</span></label>
               <input type="text" className="form-input" {...register('respondent_name')} placeholder="Maria Santos" />
               {errors.respondent_name && <p className="text-red-500 text-xs mt-1">{errors.respondent_name.message}</p>}
            </div>
            <div>
               <label className="form-label">Address</label>
               <textarea className="form-input h-16 resize-none" {...register('respondent_address')} placeholder="456 Ave..."></textarea>
            </div>
         </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
         <h4 className="font-semibold text-slate-700 uppercase tracking-wider text-xs border-b border-slate-100 pb-2">Nature of Complaint</h4>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="form-label">Category / Type <span className="text-red-500">*</span></label>
               <select className="form-input" {...register('complaint_category')}>
                  <option value="civil">Civil Case (e.g. debt, contract)</option>
                  <option value="criminal">Criminal (Light offenses)</option>
                  <option value="other">Other / General Dispute</option>
               </select>
               {errors.complaint_category && <p className="text-red-500 text-xs mt-1">{errors.complaint_category.message}</p>}
            </div>
            <div className="bg-red-50 p-2 rounded-lg border border-red-100 flex items-center hover:border-red-300 transition-colors cursor-pointer text-sm">
               <label className="flex items-center gap-2 cursor-pointer w-full text-red-800 font-semibold px-2">
                  <input type="checkbox" className="w-4 h-4 text-red-600 rounded" {...register('is_blotter')} />
                  Mark as Blotter Entry Only
               </label>
            </div>
         </div>

         <div>
            <label className="form-label">Detailed Description of the Complaint <span className="text-red-500">*</span></label>
            <textarea 
               className="form-input h-32 resize-none" 
               {...register('nature_of_complaint')} 
               placeholder="Describe the incident, dispute, or reason for filing..."
            ></textarea>
            {errors.nature_of_complaint && <p className="text-red-500 text-xs mt-1">{errors.nature_of_complaint.message}</p>}
         </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 mt-8">
        <button type="button" onClick={onCancel} className="btn btn-ghost px-6" disabled={loading}>
           <X size={18} /> Cancel
        </button>
        <button type="submit" className="btn btn-primary bg-[#1B4F72] hover:bg-[#154360] border-none px-8" disabled={loading}>
          {loading ? (
             <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Filing Case...</span>
          ) : (
             <span className="flex items-center gap-2"><Save size={18} /> File Case</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default KPCaseForm;
