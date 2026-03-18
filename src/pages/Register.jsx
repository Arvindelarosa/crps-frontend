import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Lock, Mail, Phone, Briefcase, MapPin } from 'lucide-react';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [barangays, setBarangays] = useState([]);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    contact_number: '',
    username: '',
    password: '',
    barangay_id: '',
    position: 'Barangay Secretary / Encoder',
  });

  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const res = await authAPI.getBarangays();
        if (res.data.success) {
          setBarangays(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load barangays');
      }
    };
    fetchBarangays();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.barangay_id) return toast.error('Please select your Barangay');
    
    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      if (res.data.success) {
        toast.success('Registration successful! Please wait for DILG System Administrator approval.');
        navigate('/login', { state: { registered: true } });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        {/* Left Branding Panel */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#1B4F72] to-[#154360] p-8 text-white flex flex-col justify-center items-center text-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Ph_seal_occidental_mindoro_mamburao.png/240px-Ph_seal_occidental_mindoro_mamburao.png"
            alt="Mamburao Logo" 
            className="w-20 h-20 mb-4 opacity-90 drop-shadow-md"
          />
          <h2 className="text-xl font-bold mb-2">Barangay Account Registration</h2>
          <p className="text-blue-200 text-sm">Join the Centralized Residents Profiling System of Mamburao</p>
          <div className="mt-8 pt-6 border-t border-blue-800/50 w-full text-[11px] text-blue-300">
            DILG Approval Required. Once registered, wait for the System Administrator to activate your account.
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:w-7/12 p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <UserPlus size={24} className="text-[#1B4F72]" /> Create Account
            </h3>
            <p className="text-sm text-gray-500 mt-1">Fill out your secretary credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-4">
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" name="full_name" required
                  placeholder="Full Name (e.g. Juan Dela Cruz)"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1B4F72] focus:border-transparent outline-none transition-all"
                  value={formData.full_name} onChange={handleChange}
                />
              </div>

              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" name="email" required
                  placeholder="Personal or Barangay Email"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1B4F72] focus:border-transparent outline-none transition-all"
                  value={formData.email} onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text" name="contact_number"
                    placeholder="Mobile No."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1B4F72] focus:border-transparent outline-none transition-all"
                    value={formData.contact_number} onChange={handleChange}
                  />
                </div>
                <div className="relative">
                  <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text" name="position"
                    placeholder="Position"
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1B4F72] focus:border-transparent outline-none transition-all"
                    value={formData.position} onChange={handleChange}
                  />
                </div>
              </div>

              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  name="barangay_id" required
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1B4F72] focus:border-transparent outline-none transition-all appearance-none"
                  value={formData.barangay_id} onChange={handleChange}
                >
                  <option value="" disabled>Select your Barangay...</option>
                  {barangays.map(b => (
                    <option key={b.id} value={b.id}>{b.barangay_name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-3">
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text" name="username" required minLength="4"
                    placeholder="Login Username"
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1B4F72] focus:border-transparent outline-none transition-all"
                    value={formData.username} onChange={handleChange}
                  />
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password" name="password" required minLength="6"
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1B4F72] focus:border-transparent outline-none transition-all"
                    value={formData.password} onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#1B4F72] hover:bg-[#154360] text-white py-2.5 rounded-lg font-medium transition-colors focus:ring-4 focus:ring-blue-100 flex justify-center items-center gap-2"
            >
              {loading ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div> : 'Submit Registration Request'}
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an approved account? <Link to="/login" className="text-[#1B4F72] font-semibold hover:underline">Log In</Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
