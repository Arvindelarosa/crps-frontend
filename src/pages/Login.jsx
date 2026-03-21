import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Users, FileText, Map, MapPin, Database, ArrowRight, Loader2, 
  ChevronRight, Mail, Fingerprint, Lock, Shield, Layout, X
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { loginSchema } from '../utils/validators';
import { authAPI } from '../api';
import { useAuthStore } from '../store';
import mambuLogo from '../assets/lgumambulogo.png';
import dilgLogo from '../assets/DILG-Logo.png';
import RegisterModal from '../components/auth/RegisterModal';

const HeroFeature = ({ icon: Icon, text, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className="flex items-center gap-3 text-white/80"
  >
    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
      <Icon size={18} className="text-[#F39C12]" />
    </div>
    <span className="font-medium">{text}</span>
  </motion.div>
);

const AnimatedSection = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { scrollY } = useScroll();
  
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  
  const location = useLocation();
  const [step, setStep] = useState(1); // 1: Credentials, 2: OTP
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [tempUserId, setTempUserId] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [selectedBrgy, setSelectedBrgy] = useState(null);
  const [selectedOfficial, setSelectedOfficial] = useState(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Auto-slide logic
  useEffect(() => {
    if (!selectedBrgy && !selectedOfficial) return;
    const items = selectedBrgy ? selectedBrgy.imgs : (selectedOfficial?.imgs || []);
    if (items.length <= 1) return;
    
    const interval = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % items.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [selectedBrgy, selectedOfficial]);
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  useEffect(() => {
    if (location.state?.registered) {
      setSuccessMsg('Registration submitted successfully! Please wait for DILG approval.');
    }
  }, [location]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await authAPI.resendOtp({ user_id: tempUserId });
      if (res.data.success) {
        setSuccessMsg('A new OTP has been sent to your email.');
        setResendTimer(60); // 60 seconds cooldown
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitCredentials = async (data) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      
      const res = await authAPI.login(data);
      if (res.data.success) {
        if (res.data.data.requires_otp) {
          setTempUserId(res.data.data.user_id);
          setStep(2);
          setResendTimer(60); 
        } else {
          login(res.data.data.user, res.data.data.token);
          const sid = Math.random().toString(36).substring(2, 10);
          navigate(`/dashboard?sid=${sid}`);
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setErrorMsg(err.response?.data?.message || 'Invalid username or password');
      } else {
        setErrorMsg('Server connection error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmitOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setErrorMsg('Please enter a valid OTP code');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await authAPI.verifyOtp({ user_id: tempUserId, otp_code: otpCode });
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        const sid = Math.random().toString(36).substring(2, 10);
        navigate(`/dashboard?sid=${sid}`);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#root-bg] min-h-screen text-gray-800 font-sans selection:bg-[#2E86C1] selection:text-white overflow-x-hidden">
      
      {/* Dynamic Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-5"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <img 
              src={mambuLogo} 
              alt="CPRS Logo" 
              className="w-10 h-10 object-contain drop-shadow-md relative z-20"
            />
            <img 
              src={dilgLogo} 
              alt="DILG Logo" 
              className="w-10 h-10 object-contain drop-shadow-md relative z-10"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">CPRS Portal</span>
        </div>
        <a href="#features" className="text-sm font-medium text-white/90 hover:text-white transition-colors cursor-pointer drop-shadow-md hidden sm:block">
          Explore System
        </a>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 px-4 md:px-8 overflow-hidden bg-[#0a192f]">
        
        {/* Hero Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://i.ytimg.com/vi/oDFXnl_3vW8/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGEIgVChlMA8=&rs=AOn4CLDH7yFxtPcI-U_hdaGfitRFC_vw_Q" 
            alt="Mamburao Town" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a192f]/95 via-[#0a192f]/60 to-[#0a192f]/95" />
          <div className="absolute inset-0 bg-blue-900/40 mix-blend-overlay" />
          <div className="absolute inset-0 bg-yellow-500/10 mix-blend-soft-light" />
        </div>

        {/* Abstract Background Elements */}
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#1B4F72] to-[#2E86C1] blur-[120px] opacity-40 mix-blend-screen" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#F39C12] to-[#E67E22] blur-[150px] opacity-20 mix-blend-screen" />
          <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-[#154360] to-transparent blur-[80px] opacity-50" />
        </motion.div>
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+Cgk8cGF0aCBkPSJNMCAwaDQwdjQwaC00MHoiIGZpbGw9Im5vbmUiLz4KCTxwYXRoIGQ9Ik0wIDM5LTVsNDAgMG0tMzkuNS00MGwwIDQwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] z-0 opacity-50"></div>

        <div className="container max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">
            
            {/* Left Column: Typography & Value Prop */}
            <motion.div style={{ opacity }} className="space-y-10 max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-blue-200"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3498DB] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3498DB]"></span>
                </span>
                <div className="flex items-center gap-2">
                   <img 
                      src={dilgLogo} 
                      alt="DILG Seal" 
                      className="w-5 h-5 object-contain"
                   />
                   Mamburao Smart Governance
                </div>
              </motion.div>
              
              <div className="space-y-4">
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]"
                >
                  Gateway to <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3498DB] to-[#F39C12]">
                    Mindoro
                  </span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="text-lg text-blue-100/70 font-light max-w-xl mx-auto lg:mx-0 leading-relaxed"
                >
                  Mamburao is the capital municipality of Occidental Mindoro, known for its vast agricultural lands, beautiful coastal areas, and progressive local community. Serving as the center of provincial governance, it perfectly balances rich natural resources with continuous infrastructure and economic development.
                </motion.p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto lg:mx-0">
                <HeroFeature icon={Users} text="Unified Profiling" delay={0.4} />
                <HeroFeature icon={FileText} text="Automated Docs" delay={0.5} />
                <HeroFeature icon={Map} text="GIS Mapping" delay={0.6} />
                <HeroFeature icon={Database} text="Offline Sync" delay={0.7} />
              </div>
            </motion.div>

            {/* Right Column: Glassmorphism Login Form */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md mx-auto"
            >
              <div className="relative group">
                {/* Glow effect around form */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#2E86C1] to-[#F39C12] rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                
                <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 p-8 sm:p-10 rounded-[2rem] shadow-2xl">
                  
                  <div className="flex flex-col mb-8">
                    <h2 className="text-3xl font-semibold text-white tracking-tight">Welcome Back</h2>
                    <p className="text-sm text-blue-200/60 mt-1">Sign in to access the portal</p>
                  </div>

                  <AnimatePresence mode="wait">
                    {step === 1 ? (
                      <motion.form 
                        key="credentials"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleSubmit(onSubmitCredentials)} 
                        className="space-y-5"
                      >
                        {errorMsg && (
                          <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-100 text-sm rounded-xl text-center backdrop-blur-sm">
                            {errorMsg}
                          </div>
                        )}
                        {successMsg && (
                          <div className="p-3 bg-green-500/20 border border-green-500/50 text-green-100 text-sm rounded-xl text-center backdrop-blur-sm">
                            {successMsg}
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-blue-100/80 mb-1.5 ml-1">Username</label>
                          <input 
                            type="text" 
                            {...register('username')}
                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#3498DB]/50 focus:border-transparent transition-all"
                            placeholder="Enter username"
                          />
                          {errors.username && <p className="text-red-400 text-xs mt-1 ml-1">{errors.username.message}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-blue-100/80 mb-1.5 ml-1">Password</label>
                          <input 
                            type="password" 
                            {...register('password')}
                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#3498DB]/50 focus:border-transparent transition-all"
                            placeholder="••••••••"
                          />
                          {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password.message}</p>}
                        </div>

                        <button 
                          type="submit" 
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-[#1B4F72] to-[#2E86C1] hover:from-[#154360] hover:to-[#1B4F72] text-white font-medium rounded-xl px-4 py-3.5 mt-4 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:pointer-events-none border border-white/10"
                        >
                          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                            <>
                              Proceed to Portal <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>

                        <div className="pt-4 text-center">
                          <p className="text-sm text-blue-200/70">
                            Barangay Secretary without an account? <br/>
                            <button 
                              type="button"
                              onClick={() => setIsRegisterOpen(true)} 
                              className="text-white hover:text-[#3498DB] font-medium transition-colors underline decoration-white/30 underline-offset-4 bg-transparent border-none p-0"
                            >
                              Register here
                            </button>
                          </p>
                        </div>
                      </motion.form>
                    ) : (
                      <motion.form 
                        key="otp"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={onSubmitOtp} 
                        className="space-y-6"
                      >
                       <div className="text-center mb-2">
                          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-full mb-4 shadow-inner border border-white/5">
                            <Mail size={24} className="text-[#3498DB]" />
                          </div>
                          <p className="text-sm text-blue-100/70">We sent a verification code to your email. Enter it below to continue.</p>
                        </div>

                        {errorMsg && (
                          <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-100 text-sm rounded-xl text-center backdrop-blur-sm">
                            {errorMsg}
                          </div>
                        )}
                        {successMsg && (
                          <div className="p-3 bg-green-500/20 border border-green-500/50 text-green-100 text-sm rounded-xl text-center backdrop-blur-sm">
                            {successMsg}
                          </div>
                        )}

                        <div>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-[#3498DB]/50 focus:border-transparent transition-all placeholder:text-white/10"
                              placeholder="000000"
                              autoFocus
                            />
                          </div>
                          <div className="flex justify-between items-center mt-2 px-1">
                             <div className="text-xs text-blue-200/50 flex items-center gap-1.5">
                               {resendTimer > 0 && (
                                 <>
                                   <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                                   Expiry in {resendTimer}s
                                 </>
                               )}
                             </div>
                             <button 
                               type="button" 
                               disabled={resendTimer > 0 || loading}
                               onClick={handleResendOtp}
                               className="text-xs font-bold text-[#F39C12] hover:text-[#E67E22] transition-colors disabled:opacity-30 disabled:pointer-events-none uppercase tracking-tighter"
                             >
                               {resendTimer > 0 ? 'Wait to Resend' : 'Resend Code'}
                             </button>
                          </div>
                        </div>

                        <button 
                          type="submit" 
                          disabled={loading || otpCode.length < 4}
                          className="w-full bg-gradient-to-r from-[#1B4F72] to-[#2E86C1] hover:from-[#154360] hover:to-[#1B4F72] text-white font-medium rounded-xl px-4 py-3.5 mt-2 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:pointer-events-none border border-white/10"
                        >
                          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Verify & Enter'}
                        </button>
                        
                        <button 
                          type="button" 
                          onClick={() => { setStep(1); setOtpCode(''); setErrorMsg(''); }}
                          className="w-full text-sm text-blue-200/50 hover:text-white transition-colors py-2 flex items-center justify-center gap-1"
                        >
                          <ChevronRight className="w-4 h-4 rotate-180" /> Back to login
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
        
      {/* Barangays Grid Section */}
      <section className="py-24 px-6 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-16 space-y-6">
            <div className="flex justify-center items-center mb-2">
                <img 
                  src={mambuLogo} 
                  alt="Mamburao Logo" 
                  className="w-20 h-20 object-contain drop-shadow-xl border-4 border-white rounded-full bg-white p-1.5"
                />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#1B4F72] tracking-tight">One Mamburao, 15 Communities</h2>
              <div className="mt-4 flex flex-col items-center">
                <div className="h-1 w-20 bg-[#F39C12] rounded-full mb-3" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Developed by</p>
                <p className="text-xl md:text-2xl font-black text-[#2E86C1] mt-1 tracking-tight">Arvin Marasigan Dela Rosa</p>
              </div>
            </div>
            <p className="text-gray-500 leading-relaxed text-lg max-w-2xl mx-auto italic">
              "Serving every corner of our municipality. From our coastal shores to our fertile fields, we provide digital governance across all 15 barangays."
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: 'Balansay', captain: 'Hon. Melquiades B. Ramirez', captainRole: 'Barangay Captain', imgs: ['https://images.unsplash.com/photo-1540331547168-8b63109225b7?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=800'], desc: 'Known for its scenic coastal views and thriving fishing community.' },
              { name: 'Fatima', captain: 'Hon. Doc Wyn Esperanza', captainRole: 'Barangay Captain', imgs: ['https://images.unsplash.com/photo-1528605105345-5f44cbdbf28e?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80&w=800'], desc: 'A vibrant residential area with rich local tradition and coastal charm.' },
              { name: 'Payompon', captain: 'Hon. Arnel Tinamisan', captainRole: 'Barangay Captain', imgs: ['https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800'], desc: 'The gateway to Mamburao, serving as a bustling commercial and transport hub.' },
              { name: 'Poblacion 1', captain: 'Hon. Ser Tyrone Del Rosario', captainRole: 'Barangay Captain', imgs: ['https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1449156001437-3a1340477a34?auto=format&fit=crop&q=80&w=800'], desc: 'Administrative center of the municipality and hub for government services.' },
              { name: 'Poblacion 2', captain: 'Hon. Joel Dulce', captainRole: 'Barangay Captain', imgs: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'], desc: 'Dynamic urban core with a mix of residential and small business zones.' },
              { name: 'Poblacion 3', captain: 'Hon. Kapmel Ramirez', captainRole: 'Barangay Captain', imgs: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1430285561322-7808604715df?auto=format&fit=crop&q=80&w=800'], desc: 'Close-knit community in the heart of the town, known for local festivals.' },
              { name: 'Poblacion 4', captain: 'Hon. Oli Mataro', captainRole: 'Barangay Captain', imgs: ['https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800'], desc: 'Growing residential area with focus on youth and sports development.' },
              { name: 'Poblacion 5', captain: 'Hon. Kap Ricky Pantoja', captainRole: 'Barangay Captain', imgs: ['https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1441339387413-db312a0f8b1b?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=800'], desc: 'Center of local trade and progressive community initiatives.' },
              { name: 'Poblacion 6', captain: 'Hon. Eboy Villaflores', captainRole: 'Barangay Captain', imgs: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80&w=800'], desc: 'Quiet and peaceful neighborhood with green spaces and clean surroundings.' },
              { name: 'Poblacion 7', captain: 'Hon. Les Calabio', captainRole: 'Barangay Captain', imgs: ['https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=800'], desc: 'Community-driven barangay highlighting local empowerment and safety.' },
              { name: 'Poblacion 8', captain: 'Hon. Brian Bautista', captainRole: 'Barangay Captain', imgs: ['https://images.unsplash.com/photo-1469474968028-56623f02e72e?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80&w=800'], desc: 'Modernizing zone with emphasis on technology and smart utility services.' },
              { name: 'San Luis', captain: 'Hon. Rondel Pedraza', captainRole: 'Barangay Captain', imgs: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800'], desc: 'Vast agricultural lands contributing to the town’s food security.' },
              { name: 'Talabaan', captain: 'Hon. Jimmy Patal', captainRole: 'Barangay Captain', imgs: ['https://images.unsplash.com/photo-1518173946687-a4c8a3b7468e?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800'], desc: 'Serene landscapes with a focus on agricultural modernization.' },
              { name: 'Tangkalan', captain: 'Hon. Gagan Balderas', captainRole: 'Barangay Captain', imgs: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1441339387413-db312a0f8b1b?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=800'], desc: 'Historical gateway with lush landscapes and cultural sites.' },
              { name: 'Tayamaan', captain: 'Hon. Nilo Villanueva', captainRole: 'Barangay Captain', imgs: ['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80&w=800'], desc: 'Strong communal bonds and a model for social and economic stability.' }
            ].map((brgy, idx) => (
              <motion.div
                key={brgy.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => { setSelectedBrgy(brgy); setSlideIdx(0); }}
                className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white shadow-lg border border-slate-200"
              >
                <div className="h-40 overflow-hidden relative">
                  <img src={brgy.imgs[0]} alt={brgy.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 tracking-tight">{brgy.name}</h3>
                  <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1">Explore Community</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Barangay Detail Modal */}
      <AnimatePresence>
        {selectedBrgy && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBrgy(null)}
              className="absolute inset-0 bg-[#0a192f]/90 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative w-full max-w-6xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedBrgy(null)}
                className="absolute top-6 right-6 z-[110] p-3 bg-gray-100/80 backdrop-blur-md hover:bg-gray-200 text-gray-800 rounded-full transition-all shadow-md active:scale-95 border border-white"
              >
                <X size={24} />
              </button>

              <div className="w-full md:w-1/2 relative h-80 md:h-auto overflow-hidden bg-gray-900">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={slideIdx}
                    src={selectedBrgy.imgs[slideIdx]} 
                    alt={`${selectedBrgy.name} slide ${slideIdx}`}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.8, ease: "anticipate" }}
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                </AnimatePresence>
                
                {/* Glass indicator for Captain Slide */}
                {slideIdx === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 20 }}
                    className="absolute top-10 right-10 z-20 bg-blue-500/80 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-xl border border-white/20"
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Serving the People</p>
                    <p className="text-xl font-black">{selectedBrgy.captain}</p>
                  </motion.div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10" />
                
                {/* Carousel Dots */}
                <div className="absolute bottom-10 left-8 z-20 flex gap-2">
                   {selectedBrgy.imgs.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === slideIdx ? 'w-8 bg-[#3498DB]' : 'w-2 bg-white/30'}`} />
                   ))}
                </div>

                <div className="absolute bottom-8 left-6 z-20 text-white">
                   <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-1">{selectedBrgy.name}</h2>
                   <p className="text-blue-200 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                     <MapPin size={12} />
                     Mamburao, Occidental Mindoro
                   </p>
                </div>
              </div>

              <div className="w-full md:w-1/2 p-8 md:p-14 overflow-y-auto bg-white flex flex-col justify-center">
                <div className="space-y-10">
                  <motion.div 
                    key={slideIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                      Brgy Intelligence Insight
                    </div>
                    
                    <p className="text-gray-800 text-xl leading-relaxed font-medium tracking-tight">
                      {slideIdx === 0 && selectedBrgy.desc}
                      {slideIdx === 1 && (
                        <span className="block">
                          <span className="text-blue-600 font-black block mb-2">{selectedBrgy.captainRole}:</span>
                          {selectedBrgy.captain} is dedicated to serving the community of {selectedBrgy.name}. Under their leadership, the barangay focusing on digital integration and rapid response services through the CPRS Portal.
                        </span>
                      )}
                      {slideIdx === 2 && `This community plays a vital role in our local economy. With ongoing infrastructure projects and direct support from the municipality, ${selectedBrgy.name} continues to thrive.`}
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 group hover:border-[#3498DB]/30 transition-colors">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Systems</p>
                      <p className="text-[#1B4F72] font-bold text-sm">CPRS Digitized</p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 group hover:border-[#3498DB]/30 transition-colors">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Leader Presence</p>
                      <p className="text-[#1B4F72] font-bold text-sm">Active Monitoring</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedBrgy(null)}
                    className="w-full bg-gradient-to-r from-[#1B4F72] to-[#2E86C1] hover:scale-[1.03] active:scale-[0.97] text-white font-bold py-5 rounded-3xl transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
                  >
                    Salute to {selectedBrgy.name} 
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Local Officials Section */}
      <section className="py-24 px-6 bg-[#0a192f] relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[150px]" />
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedSection className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
              Honorable Leaders of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3498DB] to-[#F39C12]">Mamburao</span>
            </h2>
            <p className="text-blue-200/60 text-lg max-w-2xl mx-auto font-light leading-relaxed">
              Meet the dedicated public servants steering our municipality towards a smarter and more progressive future.
            </p>
          </AnimatedSection>

          {/* Mayor & Vice Mayor */}
          <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
            {[
              { 
                name: 'Atty. Glicerio "E-K" S. Almero III', 
                role: 'Municipal Mayor', 
                birthday: 'August 15, 1980',
                imgs: [
                  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
                  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600'
                ],
                motto: '"Building a Smarter Mamburao through Digital Governance."',
                bio: 'A dedicated lawyer and public servant committed to bringing modern governance to Mamburao. Atty. E-K leads with a vision of transparency, efficiency, and technological progress.'
              },
              { 
                name: 'Raul "Boy" V. Masangkay', 
                role: 'Municipal Vice Mayor', 
                birthday: 'May 22, 1975',
                imgs: [
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600'
                ],
                motto: '"Unity and Progress for every Mamburao resident."',
                bio: 'With decades of experience in local legislation, Vice Mayor Masangkay ensures that every policy serves the best interests of the community.'
              }
            ].map((leader, idx) => (
              <motion.div
                key={leader.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                onClick={() => { setSelectedOfficial(leader); setSlideIdx(0); }}
                className="group relative cursor-pointer"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-[#3498DB] to-[#F39C12] rounded-[2.5rem] blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center text-center space-y-4 h-full">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                    <img src={leader.imgs[0]} alt={leader.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{leader.name}</h3>
                    <p className="text-[#3498DB] font-black uppercase tracking-[0.2em] text-xs mt-1">{leader.role}</p>
                  </div>
                  <p className="text-blue-100/60 italic text-sm leading-relaxed max-w-[250px]">
                    {leader.motto}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sangguniang Bayan Members */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {[
              { name: 'Atty. Yanna Abeleda', role: 'SB Member', birthday: 'September 10', imgs: ['https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400'], bio: 'Legislative expert focusing on social welfare and community empowerment.' },
              { name: 'Dr. Wyn Esperanza', role: 'SB Member', birthday: 'October 15', imgs: ['https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400', 'https://images.unsplash.com/photo-1519494140261-028630db0d1c?auto=format&fit=crop&q=80&w=400'], bio: 'Medical professional leading health initiatives and rural medical missions.' },
              { name: 'Melquiades Ramirez', role: 'SB Member', birthday: 'January 25', imgs: ['https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=400', 'https://images.unsplash.com/photo-1544168190-79c17527004f?auto=format&fit=crop&q=80&w=400'], bio: 'Agricultural advocate ensuring the prosperity of Mamburao’s farmers.' },
              { name: 'Oliver P. Mataro', role: 'SB Member', birthday: 'March 14', imgs: ['https://images.unsplash.com/photo-1544168190-79c17527004f?auto=format&fit=crop&q=80&w=400', 'https://images.unsplash.com/photo-1552058544-3e98e709e992?auto=format&fit=crop&q=80&w=400'], bio: 'Project development specialist working on infrastructure and growth.' },
              { name: 'Eboy Villaflores', role: 'SB Member', birthday: 'December 05', imgs: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', 'https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?auto=format&fit=crop&q=80&w=400'], bio: 'Grassroots leader dedicated to community safety and peace.' },
              { name: 'Ricky Pantoja', role: 'SB Member', birthday: 'June 30', imgs: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&q=80&w=400'], bio: 'Advocate for youth development and sports across the 15 barangays.' },
              { name: 'Les Calabio', role: 'SB Member', birthday: 'July 18', imgs: ['https://images.unsplash.com/photo-1492562080023-ab3dbdf5bb3d?auto=format&fit=crop&q=80&w=400', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'], bio: 'Promoting local culture and tourism to showcase Mamburao’s beauty.' },
              { name: 'Brian Bautista', role: 'SB Member', birthday: 'November 12', imgs: ['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'], bio: 'Resource management expert focusing on fiscal responsibility.' }
            ].map((member, idx) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => { setSelectedOfficial(member); setSlideIdx(0); }}
                className="bg-white/5 backdrop-blur-xl border border-white/5 p-6 rounded-3xl text-center group cursor-pointer transition-all duration-300 hover:bg-white/10"
              >
                <div className="relative w-24 h-24 mx-auto rounded-2xl overflow-hidden mb-4 border-2 border-white/10 shadow-lg">
                  <img src={member.imgs[0]} alt={member.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                </div>
                <h4 className="font-bold text-white text-sm tracking-tight leading-tight">{member.name}</h4>
                <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mt-1">Sangguniang Bayan</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Official Detail Modal */}
        <AnimatePresence>
          {selectedOfficial && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedOfficial(null)}
                className="absolute inset-0 bg-[#0a192f]/90 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                className="relative w-full max-w-5xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
              >
                <button 
                  onClick={() => setSelectedOfficial(null)}
                  className="absolute top-6 right-6 z-[110] p-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition-all shadow-md active:scale-95"
                >
                  <X size={24} />
                </button>

                {/* Left Side: Photo Carousel */}
                <div className="w-full md:w-[45%] relative h-80 md:h-auto overflow-hidden bg-gray-900">
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={slideIdx}
                      src={selectedOfficial.imgs[slideIdx]} 
                      alt={selectedOfficial.name}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.8, ease: "anticipate" }}
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10" />
                  
                  {/* Indicators */}
                  <div className="absolute bottom-10 left-8 z-20 flex gap-2">
                     {selectedOfficial.imgs.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === slideIdx ? 'w-8 bg-[#3498DB]' : 'w-2 bg-white/30'}`} />
                     ))}
                  </div>
                </div>

                {/* Right Side: Information */}
                <div className="w-full md:w-[55%] p-8 md:p-14 overflow-y-auto bg-white flex flex-col">
                  <div className="space-y-8 my-auto">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#3498DB] font-black text-[10px] uppercase tracking-widest">
                         Service & Leadership
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight">
                        {selectedOfficial.name}
                      </h2>
                      <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Layout size={18} className="text-[#3498DB]" />
                          <span className="font-bold text-sm uppercase tracking-wider">{selectedOfficial.role}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 border-l border-gray-200 pl-4">
                          <Users size={18} className="text-[#F39C12]" />
                          <span className="font-bold text-sm uppercase tracking-wider">Birthday: {selectedOfficial.birthday}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-20 h-1.5 bg-gradient-to-r from-[#3498DB] to-[#F39C12] rounded-full" />

                    <div className="space-y-4">
                      <p className="text-gray-600 text-lg md:text-xl leading-relaxed font-light italic">
                        {selectedOfficial.bio}
                      </p>
                      {selectedOfficial.motto && (
                        <div className="p-6 bg-gray-50 rounded-3xl border-l-4 border-[#3498DB] italic text-gray-700">
                          "{selectedOfficial.motto}"
                        </div>
                      )}
                    </div>

                    <div className="pt-4">
                       <button 
                        onClick={() => setSelectedOfficial(null)}
                        className="w-full bg-[#0a192f] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-900/10"
                       >
                         Salute to Leadership
                       </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* Transitional Intro with Infra Image */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
         <img 
            src="https://images.unsplash.com/photo-1590496739665-648b253da5c7?q=80&w=1920&auto=format&fit=crop" 
            alt="Infrastructure" 
            className="w-full h-full object-cover absolute inset-0 z-0"
         />
         <div className="absolute inset-0 bg-[#1B4F72]/80 backdrop-blur-[2px] z-10" />
         <div className="max-w-4xl mx-auto px-6 text-center relative z-20 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Continuous Infrastructure & Economic Development</h2>
            <div className="w-24 h-1 bg-[#F39C12] mx-auto" />
            <p className="text-white/80 text-lg font-light leading-relaxed">
               Balancing natural resources with modern growth to ensure a progressive future for every Mamburao resident.
            </p>
         </div>
      </section>

      {/* Features Showcase Section */}
      <section id="features" className="py-24 px-6 bg-[#F8FAFC] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-blue-50 opacity-50 rounded-bl-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-orange-50 opacity-50 rounded-tr-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto space-y-32 relative z-10">
          
          <AnimatedSection className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1B4F72] tracking-tight">A Benchmark in Local Governance</h2>
            <p className="text-lg text-gray-500">
              CPRS brings enterprise-grade management tools to the barangay level, offering unprecedented clarity, security, and true operational efficiency.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <AnimatedSection>
              <div className="relative group perspective">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#2E86C1]/20 to-[#F39C12]/10 rounded-[2rem] transform rotate-3 scale-105 blur-xl group-hover:rotate-6 group-hover:scale-110 transition duration-700"></div>
                <div className="aspect-[4/3] bg-white rounded-[2rem] shadow-2xl overflow-hidden relative z-10 p-2 transform transition duration-500 group-hover:-translate-y-2 group-hover:shadow-3xl">
                   <div className="absolute inset-0 bg-[#1B4F72]/5 group-hover:bg-transparent transition duration-500 z-20 pointer-events-none"></div>
                   <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80" alt="Dashboard Preview" className="rounded-[1.5rem] object-cover w-full h-full transform group-hover:scale-[1.03] transition duration-700 ease-out" />
                </div>
              </div>
            </AnimatedSection>
            
            <AnimatedSection className="space-y-6 md:pl-8">
              <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-[#2E86C1] mb-8 shadow-sm">
                <Database size={28} />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Intelligent Dashboards</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Visualize demographics, track household growth, and monitor document requests in real-time. Make data-driven decisions that impact your constituency instantly using beautifully crafted visualizations.
              </p>
            </AnimatedSection>
          </div>

          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center flex-col-reverse md:flex-row-reverse">
            <AnimatedSection className="order-1 md:order-2">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#27AE60]/20 to-[#1B4F72]/10 rounded-[2rem] transform -rotate-3 scale-105 blur-xl group-hover:-rotate-6 group-hover:scale-110 transition duration-700"></div>
                <div className="aspect-[4/3] bg-white rounded-[2rem] shadow-2xl overflow-hidden relative z-10 p-2 transform transition duration-500 group-hover:-translate-y-2 group-hover:shadow-3xl">
                    <img src="/src/assets/mamburao_gis_preview.png" alt="Map Preview" className="rounded-[1.5rem] object-cover w-full h-full transform group-hover:scale-[1.03] transition duration-700 ease-out grayscale-[20%] group-hover:grayscale-0" />
                </div>
              </div>
            </AnimatedSection>
            
            <AnimatedSection className="space-y-6 md:pr-8 order-2 md:order-1">
              <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center text-[#27AE60] mb-8 shadow-sm">
                <Map size={28} />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">GIS Heatmaps & Tracking</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Plot households on interactive maps. Overlay zone boundaries, track high-density areas, and locate exactly where your constituents reside for responsive resource allocation and emergency planning.
              </p>
            </AnimatedSection>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <AnimatedSection>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#F39C12]/20 to-[#1B4F72]/10 rounded-[2rem] transform rotate-3 scale-105 blur-xl group-hover:rotate-6 group-hover:scale-110 transition duration-700"></div>
                <div className="aspect-[4/3] bg-white rounded-[2rem] shadow-2xl overflow-hidden relative z-10 flex items-center justify-center p-2 transform transition duration-500 group-hover:-translate-y-2 group-hover:shadow-3xl">
                   <div className="absolute inset-2 rounded-[1.5rem] bg-[#11243A] overflow-hidden flex items-center justify-center border border-gray-100">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CiAgPGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiM0NDQiLz4KPC9zdmc+')] opacity-30 group-hover:scale-110 group-hover:opacity-50 transition duration-1000"></div>
                      <div className="relative z-30 bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl text-center transform group-hover:scale-105 transition duration-500">
                        <Fingerprint size={64} className="mx-auto mb-4 text-[#F39C12] drop-shadow-md" />
                        <h4 className="text-white font-semibold text-xl tracking-wide">ID & QR System</h4>
                      </div>
                   </div>
                </div>
              </div>
            </AnimatedSection>
            
            <AnimatedSection className="space-y-6 md:pl-8">
              <div className="w-14 h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-[#F39C12] mb-8 shadow-sm">
                <Fingerprint size={28} />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Smart IDs & Verification</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Generate and print secure Barangay IDs embedded with cryptographic QR codes. Scan them via webcam to instantly log visitor access, verify clear records, and completely digitize physical check-ins.
              </p>
            </AnimatedSection>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
              <div className="flex -space-x-1.5">
                <img 
                  src={mambuLogo} 
                  alt="CPRS Logo" 
                  className="w-8 h-8 object-contain"
                />
                <img 
                  src={dilgLogo} 
                  alt="DILG Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="font-bold text-xl text-gray-800 tracking-tight">CPRS</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} LGU Mamburao, Occidental Mindoro. A Smart Barangay Initiative.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
             System Online
          </div>
        </div>
      </footer>
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </div>
  );
};

export default Login;
