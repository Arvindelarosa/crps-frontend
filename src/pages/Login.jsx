import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, Loader2, FileDigit, Mail, ArrowRight, Database, Users, Map, FileText, ChevronRight, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { loginSchema } from '../utils/validators';
import { authAPI } from '../api';
import { useAuthStore } from '../store';

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
  
  const [step, setStep] = useState(1); // 1: Credentials, 2: OTP
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [tempUserId, setTempUserId] = useState(null);
  const [otpCode, setOtpCode] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmitCredentials = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await authAPI.login(data);
      if (res.data.success) {
        setTempUserId(res.data.data.user_id);
        setStep(2);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          const directRes = await authAPI.directLogin(data);
          if (directRes.data.success) {
            login(directRes.data.data.user, directRes.data.data.token);
            navigate('/dashboard');
            return;
          }
        } catch (dirErr) {
          setErrorMsg(dirErr.response?.data?.message || 'Invalid username or password');
        }
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
    try {
      const res = await authAPI.verifyOtp({ user_id: tempUserId, otp_code: otpCode });
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        navigate('/dashboard');
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
          <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center">
            <ShieldCheck size={24} className="text-[#1B4F72]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">CRPS Portal</span>
        </div>
        <a href="#features" className="text-sm font-medium text-white/90 hover:text-white transition-colors cursor-pointer drop-shadow-md hidden sm:block">
          Explore System
        </a>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 px-4 md:px-8 overflow-hidden bg-[#0a192f]">
        
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
                Mamburao Smart Governance
              </motion.div>
              
              <div className="space-y-4">
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]"
                >
                  Empowering <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3498DB] to-[#F39C12]">
                    Communities
                  </span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="text-lg text-blue-100/70 font-light max-w-md mx-auto lg:mx-0 leading-relaxed"
                >
                  The Centralized Residents Profiling System transforms barangay operations with cutting-edge digital management, secure QR IDs, and real-time mapping.
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
        
        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-50 hidden md:flex flex-col items-center gap-2"
        >
          <span className="text-xs text-white uppercase tracking-widest font-medium">Scroll to explore</span>
          <div className="w-0.5 h-12 bg-gradient-to-b from-white/50 to-transparent"></div>
        </motion.div>
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
              CRPS brings enterprise-grade management tools to the barangay level, offering unprecedented clarity, security, and true operational efficiency.
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
                    <img src="https://images.unsplash.com/photo-1633265486064-086b219458ce?auto=format&fit=crop&w=1000&q=80" alt="Map Preview" className="rounded-[1.5rem] object-cover w-full h-full transform group-hover:scale-[1.03] transition duration-700 ease-out grayscale-[20%] group-hover:grayscale-0" />
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
             <div className="w-10 h-10 bg-[#1B4F72] rounded-xl flex items-center justify-center shadow-md">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl text-gray-800 tracking-tight">CRPS</span>
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
    </div>
  );
};

export default Login;
