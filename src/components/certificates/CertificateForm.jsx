import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Save, X, Search, CheckCircle } from 'lucide-react';
import { documentsAPI, residentsAPI } from '../../api';

const certificateSchema = z.object({
  resident_id: z.number({ required_error: 'Resident selection is required' }).min(1, 'Please select a resident'),
  document_type: z.enum([
    'barangay_clearance',
    'certificate_of_residency',
    'certificate_of_indigency',
    'good_moral_certificate',
    'business_clearance'
  ], { required_error: 'Document type is required' }),
  purpose: z.string().min(3, 'Purpose is required'),
});

const CertificateForm = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      resident_id: 0,
      document_type: 'barangay_clearance',
      purpose: '',
    }
  });

  const selectedResidentId = watch('resident_id');
  const selectedResident = searchResults.find(r => r.id === selectedResidentId);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setSearching(true);
        try {
          const res = await residentsAPI.getAll({ search: searchTerm, limit: 10 });
          setSearchResults(res.data.data);
        } catch (err) {
          console.error(err);
        } finally {
          setSearching(false);
        }
      } else {
         setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const selectResident = (resident) => {
    setValue('resident_id', resident.id, { shouldValidate: true });
    setSearchTerm('');
    setSearchResults([resident]); 
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await documentsAPI.create(data);
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error saving request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Resident Selection */}
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
         <h4 className="font-semibold text-gray-800 mb-3 text-sm">1. Select Resident</h4>
         
         {!selectedResident ? (
            <div className="relative">
               <Search size={16} className="absolute left-3 top-3 text-gray-400" />
               <input 
                  type="text" 
                  className="form-input w-full pl-9" 
                  placeholder="Type name to search resident..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoComplete="off"
               />
               <input type="hidden" {...register('resident_id')} />
               
               {errors.resident_id && <p className="text-red-500 text-xs mt-1">{errors.resident_id.message}</p>}

               {searching && <div className="text-xs text-gray-500 mt-2 px-2">Searching...</div>}
               
               {searchResults.length > 0 && searchTerm.length >= 2 && (
                  <div className="absolute top-12 left-0 w-full bg-white border border-gray-200 shadow-xl rounded-lg max-h-60 overflow-y-auto z-20">
                     {searchResults.map(r => (
                        <div 
                           key={r.id} 
                           className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 flex items-center justify-between"
                           onClick={() => selectResident(r)}
                        >
                           <div>
                              <div className="font-semibold text-gray-800">{r.first_name} {r.last_name}</div>
                              <div className="text-xs text-gray-500 font-mono">{r.resident_code}</div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         ) : (
            <div className="flex items-center justify-between bg-white border border-blue-200 p-3 rounded-lg shadow-sm">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-[#1B4F72] rounded-full flex items-center justify-center font-bold">
                     {selectedResident.first_name.charAt(0)}
                  </div>
                  <div>
                     <div className="font-bold text-gray-800 flex items-center gap-2">
                        {selectedResident.first_name} {selectedResident.last_name} <CheckCircle size={14} className="text-green-500" />
                     </div>
                     <div className="text-xs text-gray-500 font-mono">{selectedResident.resident_code}</div>
                  </div>
               </div>
               <button 
                  type="button" 
                  onClick={() => { setValue('resident_id', 0); setSearchTerm(''); setSearchResults([]); }}
                  className="text-xs text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded"
               >
                  Change
               </button>
            </div>
         )}
      </div>

      <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-4">
         <h4 className="font-semibold text-gray-800 mb-1 text-sm">2. Document Details</h4>
         
         <div>
            <label className="form-label">Document Type <span className="text-red-500">*</span></label>
            <select className="form-input" {...register('document_type')}>
               <option value="barangay_clearance">Barangay Clearance</option>
               <option value="certificate_of_residency">Certificate of Residency</option>
               <option value="certificate_of_indigency">Certificate of Indigency</option>
               <option value="good_moral_certificate">Certificate of Good Moral</option>
            </select>
            {errors.document_type && <p className="text-red-500 text-xs mt-1">{errors.document_type.message}</p>}
         </div>

         <div>
            <label className="form-label">Purpose of Request <span className="text-red-500">*</span></label>
            <textarea 
               className="form-input h-24 resize-none" 
               {...register('purpose')} 
               placeholder="e.g. Scholarship Application, Job Application, Valid ID Requirements..."
            ></textarea>
            {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose.message}</p>}
         </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="btn btn-ghost px-6" disabled={loading}>
           <X size={18} /> Cancel
        </button>
        <button type="submit" className="btn btn-primary px-8" disabled={loading || !selectedResident}>
          {loading ? (
             <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating...</span>
          ) : (
             <span className="flex items-center gap-2"><FileText size={18} /> Create Request</span>
          )}
        </button>
      </div>

    </form>
  );
};

export default CertificateForm;
