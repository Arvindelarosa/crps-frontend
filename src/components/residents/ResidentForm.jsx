import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, X, User } from 'lucide-react';
import { residentsAPI } from '../../api';

const residentSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  middle_name: z.string().optional(),
  last_name: z.string().min(2, 'Last name is required'),
  suffix: z.string().optional(),
  birthdate: z.string().min(1, 'Birthdate is required'),
  gender: z.enum(['male', 'female'], { required_error: 'Gender is required' }),
  civil_status: z.enum(['single', 'married', 'widowed', 'separated', 'divorced']),
  contact_number: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  occupation: z.string().optional(),
  religion: z.string().optional(),
  full_address: z.string().optional(),
  blood_type: z.string().max(5).optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_address: z.string().optional(),
  emergency_contact_number: z.string().optional(),
  // Attributes
  is_pwd: z.boolean().default(false),
  pwd_id_no: z.string().optional(),
  is_senior_citizen: z.boolean().default(false),
  senior_citizen_id: z.string().optional(),
  is_solo_parent: z.boolean().default(false),
  solo_parent_id: z.string().optional(),
  is_indigenous: z.boolean().default(false),
  ip_group: z.string().optional(),
  is_registered_voter: z.boolean().default(false),
  precinct_no: z.string().optional(),
  is_4ps_beneficiary: z.boolean().default(false),
  is_student: z.boolean().default(false),
  educational_attainment: z.string().optional(),
});

const ResidentForm = ({ onSuccess, onCancel, editData = null }) => {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(residentSchema),
    defaultValues: editData || {
      first_name: '', middle_name: '', last_name: '', suffix: '', contact_number: '', email: '',
      gender: 'male', civil_status: 'single', blood_type: '', full_address: '',
      emergency_contact_name: '', emergency_contact_address: '', emergency_contact_number: '',
      is_pwd: false, is_senior_citizen: false, is_solo_parent: false, is_indigenous: false,
      is_registered_voter: false, is_4ps_beneficiary: false, is_student: false
    }
  });

  // Watch toggles to show/hide extra fields
  const showPwdId = watch('is_pwd');
  const showSeniorId = watch('is_senior_citizen');
  const showSoloId = watch('is_solo_parent');
  const showIpGroup = watch('is_indigenous');
  const showPrecinct = watch('is_registered_voter');

  useEffect(() => {
    if (editData) {
      // format date for input field
      const formattedData = { ...editData };
      if (formattedData.birthdate) {
        formattedData.birthdate = new Date(formattedData.birthdate).toISOString().split('T')[0];
      }
      reset(formattedData);
    }
  }, [editData, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (editData && editData.id) {
        await residentsAPI.update(editData.id, data);
      } else {
        await residentsAPI.create(data);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving resident data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-6 flex items-center gap-3">
         <div className="bg-blue-100 p-2 rounded-full text-[#1B4F72]">
            <User size={24} />
         </div>
         <div>
            <h3 className="font-bold text-[#1B4F72]">Personal Information</h3>
            <p className="text-xs text-slate-500">Enter the basic details of the resident.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="form-label">First Name <span className="text-red-500">*</span></label>
          <input type="text" className="form-input" {...register('first_name')} placeholder="Juan" />
          {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
        </div>
        <div>
          <label className="form-label">Middle Name</label>
          <input type="text" className="form-input" {...register('middle_name')} placeholder="Dela" />
        </div>
        <div>
          <label className="form-label">Last Name <span className="text-red-500">*</span></label>
          <input type="text" className="form-input" {...register('last_name')} placeholder="Cruz" />
          {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
        </div>
        <div>
          <label className="form-label">Suffix</label>
          <input type="text" className="form-input" {...register('suffix')} placeholder="Jr, Sr, III" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="form-label">Birthdate <span className="text-red-500">*</span></label>
          <input type="date" className="form-input" {...register('birthdate')} />
          {errors.birthdate && <p className="text-red-500 text-xs mt-1">{errors.birthdate.message}</p>}
        </div>
        <div>
          <label className="form-label">Gender <span className="text-red-500">*</span></label>
          <select className="form-input" {...register('gender')}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="form-label">Civil Status <span className="text-red-500">*</span></label>
          <select className="form-input" {...register('civil_status')}>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="widowed">Widowed</option>
            <option value="separated">Separated</option>
            <option value="divorced">Divorced</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Contact Number</label>
          <input type="text" className="form-input" {...register('contact_number')} placeholder="09xxxxxxxxx" />
        </div>
        <div>
          <label className="form-label">Email Address</label>
          <input type="email" className="form-input" {...register('email')} placeholder="email@example.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="form-label">Occupation</label>
          <input type="text" className="form-input" {...register('occupation')} placeholder="Farmer, Teacher, etc." />
        </div>
        <div>
          <label className="form-label">Educational Attainment</label>
          <select className="form-input" {...register('educational_attainment')}>
            <option value="">Select...</option>
            <option value="elementary">Elementary Level / Graduate</option>
            <option value="high_school">High School Level / Graduate</option>
            <option value="college">College Level / Graduate</option>
            <option value="post_grad">Post Graduate</option>
            <option value="vocational">Vocational</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="md:col-span-3">
          <label className="form-label">Full Address (If not assigned to a Household)</label>
          <input type="text" className="form-input" {...register('full_address')} placeholder="House/Block No., Street, Purok/Sitio..." />
        </div>
        <div>
          <label className="form-label">Blood Type</label>
          <select className="form-input" {...register('blood_type')}>
            <option value="">Unknown</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>
      </div>

      <hr className="my-6 border-slate-200" />
      <h3 className="font-bold text-[#1B4F72] mb-4">Emergency Contact Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="form-label">Contact Name</label>
          <input type="text" className="form-input" {...register('emergency_contact_name')} placeholder="Full Name" />
        </div>
        <div>
          <label className="form-label">Contact Number</label>
          <input type="text" className="form-input" {...register('emergency_contact_number')} placeholder="09xxxxxxxxx" />
        </div>
        <div>
          <label className="form-label">Contact Address</label>
          <input type="text" className="form-input" {...register('emergency_contact_address')} placeholder="Address" />
        </div>
      </div>

      <hr className="my-6 border-slate-200" />
      <h3 className="font-bold text-[#1B4F72] mb-4">Sectors & Special Attributes</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        
        {/* PWD */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
          <label className="flex items-center gap-2 cursor-pointer font-medium mb-2">
            <input type="checkbox" className="w-4 h-4 text-[#1B4F72] rounded" {...register('is_pwd')} />
            Person with Disability (PWD)
          </label>
          {showPwdId && (
            <input type="text" className="form-input text-sm mt-1 border-slate-200" placeholder="PWD ID Number" {...register('pwd_id_no')} />
          )}
        </div>

        {/* Senior */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
          <label className="flex items-center gap-2 cursor-pointer font-medium mb-2">
            <input type="checkbox" className="w-4 h-4 text-[#1B4F72] rounded" {...register('is_senior_citizen')} />
            Senior Citizen
          </label>
          {showSeniorId && (
            <input type="text" className="form-input text-sm mt-1 border-slate-200" placeholder="Senior Citizen ID" {...register('senior_citizen_id')} />
          )}
        </div>

        {/* Solo Parent */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
          <label className="flex items-center gap-2 cursor-pointer font-medium mb-2">
            <input type="checkbox" className="w-4 h-4 text-[#1B4F72] rounded" {...register('is_solo_parent')} />
            Solo Parent
          </label>
          {showSoloId && (
            <input type="text" className="form-input text-sm mt-1 border-slate-200" placeholder="Solo Parent ID" {...register('solo_parent_id')} />
          )}
        </div>

        {/* Indigenous */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
          <label className="flex items-center gap-2 cursor-pointer font-medium mb-2">
            <input type="checkbox" className="w-4 h-4 text-[#1B4F72] rounded" {...register('is_indigenous')} />
            Indigenous Person (IP)
          </label>
          {showIpGroup && (
            <input type="text" className="form-input text-sm mt-1 border-slate-200" placeholder="Specify IP Group" {...register('ip_group')} />
          )}
        </div>

        {/* Voter */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
          <label className="flex items-center gap-2 cursor-pointer font-medium mb-2">
            <input type="checkbox" className="w-4 h-4 text-[#1B4F72] rounded" {...register('is_registered_voter')} />
            Registered Voter
          </label>
          {showPrecinct && (
            <input type="text" className="form-input text-sm mt-1 border-slate-200" placeholder="Precinct Number" {...register('precinct_no')} />
          )}
        </div>

        {/* 4Ps & Student */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer font-medium bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
            <input type="checkbox" className="w-4 h-4 text-[#1B4F72] rounded" {...register('is_4ps_beneficiary')} />
            4Ps Beneficiary
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-medium bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
            <input type="checkbox" className="w-4 h-4 text-[#1B4F72] rounded" {...register('is_student')} />
            Currently a Student
          </label>
        </div>

      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 mt-8">
        <button type="button" onClick={onCancel} className="btn btn-ghost px-6" disabled={loading}>
           <X size={18} /> Cancel
        </button>
        <button type="submit" className="btn btn-primary px-8" disabled={loading}>
          {loading ? (
             <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</span>
          ) : (
             <span className="flex items-center gap-2"><Save size={18} /> Save Resident</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default ResidentForm;
