import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, User, Lock, Mail, Phone, Briefcase, MapPin, ShieldCheck, ChevronRight, X, Loader2, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

const RegisterModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [barangays, setBarangays] = useState([]);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    contact_number: '',
    username: '',
    password: '',
    confirm_password: '',
    barangay_id: '',
    position: 'Barangay Secretary / Encoder',
  });

  const [usernameStatus, setUsernameStatus] = useState({ loading: false, available: true, message: '', suggestions: [] });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closing
      setIsSuccess(false);
      setFormData({
        full_name: '', email: '', contact_number: '', username: '',
        password: '', confirm_password: '', barangay_id: '',
        position: 'Barangay Secretary / Encoder',
      });
      return;
    }
    
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
  }, [isOpen]);

  // Debounced Username Check
  useEffect(() => {
    const checkUsername = async () => {
      if (formData.username.length < 4) {
        setUsernameStatus({ loading: false, available: true, message: '', suggestions: [] });
        return;
      }
      setUsernameStatus(prev => ({ ...prev, loading: true }));
      try {
        const res = await authAPI.checkUsername(formData.username);
        setUsernameStatus({
          loading: false,
          available: res.data.available,
          message: res.data.available ? 'Username is available' : 'Username is already taken',
          suggestions: res.data.suggestions || []
        });
      } catch (err) {
        setUsernameStatus(prev => ({ ...prev, loading: false }));
      }
    };

    const timeoutId = setTimeout(checkUsername, 600);
    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length > 5) score++;
    if (pwd.length > 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const labels = ['Too Short', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-gray-300', 'bg-red-400', 'bg-orange-400', 'bg-blue-400', 'bg-green-500'];
    
    setPasswordStrength({
      score,
      label: pwd.length > 0 ? labels[Math.min(score, 4)] : '',
      color: colors[Math.min(score, 4)]
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'password') {
      calculateStrength(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.barangay_id) return toast.error('Please select your Barangay');
    if (!usernameStatus.available) return toast.error('Please choose another username');
    if (formData.password !== formData.confirm_password) return toast.error('Passwords do not match');
    if (passwordStrength.score < 1) return toast.error('Please use a stronger password');
    
    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      if (res.data.success) {
        setIsSuccess(true);
        // Wait 3 seconds then close
        setTimeout(() => {
          onClose();
        }, 3500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0a192f]/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Left Decor */}
            <div className="hidden lg:flex w-1/3 bg-[#1B4F72] p-10 flex-col justify-between text-white relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
               <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                    <UserPlus size={24} className="text-blue-200" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Join our Smart Community</h2>
                  <p className="text-sm text-blue-100/70 leading-relaxed">
                    Create an account to access the Mamburao Centralized Resident Profiling System.
                  </p>
               </div>
               <div className="relative z-10 flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <ShieldCheck size={20} className="text-blue-300" />
                  <p className="text-[11px] text-blue-100/60 uppercase font-black tracking-widest">DILG Verified Security</p>
               </div>
            </div>

            {/* Right Form */}
            <div className="flex-1 p-8 sm:p-10 md:p-12 overflow-y-auto">
              <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                      className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100"
                    >
                      <CheckCircle2 size={48} />
                    </motion.div>
                    <h3 className="text-3xl font-black text-gray-900 mb-2">Registration Submitted!</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Thank you for applying. Your official account is now pending **DILG System Administrator approval**. 
                      Please check your email for updates.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-sm text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-full">
                      <Loader2 size={16} className="animate-spin" />
                      Redirecting back to login...
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="form" exit={{ opacity: 0, y: -20 }}>
                    <div className="mb-8">
                      <h3 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h3>
                      <p className="text-gray-500 text-sm mt-1">Fill in your official barangay details</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                          <div className="relative group">
                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1B4F72]" />
                            <input 
                              type="text" name="full_name" required value={formData.full_name} onChange={handleChange}
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#1B4F72] outline-none text-sm transition-all"
                              placeholder="Juan Dela Cruz"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
                          <div className="relative group">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1B4F72]" />
                            <input 
                              type="email" name="email" required value={formData.email} onChange={handleChange}
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#1B4F72] outline-none text-sm transition-all"
                              placeholder="juan@mamburao.ph"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Barangay</label>
                          <div className="relative">
                            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select 
                              name="barangay_id" required value={formData.barangay_id} onChange={handleChange}
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#1B4F72] outline-none text-sm cursor-pointer appearance-none"
                            >
                              <option value="">Select Barangay</option>
                              {barangays.map(b => <option key={b.id} value={b.id}>{b.barangay_name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Position</label>
                          <div className="relative">
                            <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="text" name="position" value={formData.position} onChange={handleChange}
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#1B4F72] outline-none text-sm transition-all"
                              placeholder="Secretary"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-2 border-t border-gray-100">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <div className="flex justify-between items-end mr-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Username</label>
                              {formData.username.length >= 4 && (
                                <span className={`text-[9px] font-bold uppercase ${usernameStatus.available ? 'text-green-600' : 'text-red-500'}`}>
                                  {usernameStatus.loading ? 'Checking...' : usernameStatus.message}
                                </span>
                              )}
                            </div>
                            <div className="relative group">
                              <User size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${!usernameStatus.available ? 'text-red-400' : 'text-gray-400'}`} />
                              <input 
                                type="text" name="username" required minLength="4" value={formData.username} onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl outline-none text-sm transition-all ${!usernameStatus.available ? 'border-red-200 focus:ring-2 focus:ring-red-50' : 'border-gray-200 focus:ring-2 focus:ring-blue-50 focus:border-[#1B4F72]'}`}
                                placeholder="official_juan"
                              />
                            </div>
                            {/* suggestions */}
                            {!usernameStatus.available && usernameStatus.suggestions.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {usernameStatus.suggestions.map(s => (
                                  <button key={s} type="button" onClick={() => setFormData({...formData, username: s})} className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-md hover:bg-blue-100">
                                    {s}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <div className="flex justify-between items-end mr-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
                                <span className={`text-[9px] font-bold uppercase ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                  {passwordStrength.label}
                                </span>
                              </div>
                              <input 
                                type="password" name="password" required minLength="6" value={formData.password} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#1B4F72] outline-none text-sm"
                                placeholder="••••••••"
                              />
                              {formData.password && (
                                <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                                  <div className={`h-full transition-all duration-500 ${passwordStrength.color}`} style={{ width: `${(passwordStrength.score + 1) * 20}%` }}></div>
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Confirm</label>
                              <input 
                                type="password" name="confirm_password" required minLength="6" value={formData.confirm_password} onChange={handleChange}
                                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 outline-none text-sm ${formData.confirm_password && formData.password !== formData.confirm_password ? 'border-red-200 focus:ring-red-50' : 'border-gray-200 focus:ring-blue-50 focus:border-[#1B4F72]'}`}
                                placeholder="••••••••"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1B4F72] hover:bg-[#154360] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-900/10 mt-6 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
                      >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : (
                          <>
                            Join the Smart Community <ChevronRight size={18} />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RegisterModal;
