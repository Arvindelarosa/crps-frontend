import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { useAuthStore } from './store';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useSync } from './hooks/useSync';
import { Toaster } from 'react-hot-toast';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Residents = lazy(() => import('./pages/Residents'));
const Households = lazy(() => import('./pages/Households'));
const Certificates = lazy(() => import('./pages/Certificates'));
const BarangayID = lazy(() => import('./pages/BarangayID'));
const QRScanner = lazy(() => import('./pages/QRScanner'));
const KPCases = lazy(() => import('./pages/KPCases'));
const Reports = lazy(() => import('./pages/Reports'));
const GISMap = lazy(() => import('./pages/GISMap'));
const Settings = lazy(() => import('./pages/Settings'));

const Loading = () => (
  <div className="flex items-center justify-center h-screen w-full bg-[#F4F6F9]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-[#1B4F72]/20 border-t-[#1B4F72] rounded-full animate-spin"></div>
      <p className="font-medium text-gray-500 animate-pulse">Loading module...</p>
    </div>
  </div>
);

function App() {
  const { logout, isAuthenticated } = useAuthStore();
  useOnlineStatus(); 
  useSync();         

  // Inactivity timeout (30 minutes)
  React.useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
        window.location.href = '/login?reason=timeout';
      }, 30 * 60 * 1000); 
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach(event => document.removeEventListener(event, resetTimer));
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isAuthenticated, logout]);

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500'
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="residents" element={<Residents />} />
            <Route path="households" element={<Households />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="barangay-id" element={<BarangayID />} />
            <Route path="qr-scan" element={<QRScanner />} />
            <Route path="kp-cases" element={<KPCases />} />
            <Route path="reports" element={<Reports />} />
            <Route path="map" element={<GISMap />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
