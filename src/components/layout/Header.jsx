import React, { useEffect } from 'react';
import { Menu, Bell, Wifi, WifiOff, RefreshCw, QrCode } from 'lucide-react';
import { useAuthStore, useUiStore } from '../../store';
import { attendanceAPI } from '../../api';
import Modal from '../ui/Modal';

const Header = () => {
  const { user } = useAuthStore();
  const { toggleSidebar, onlineStatus, setOnlineStatus, pendingSyncCount } = useUiStore();
  const [isQrModalOpen, setIsQrModalOpen] = React.useState(false);
  const [workerQr, setWorkerQr] = React.useState(null);
  const [loadingQr, setLoadingQr] = React.useState(false);

  const handleOpenQr = async () => {
    setIsQrModalOpen(true);
    if (!workerQr) {
      setLoadingQr(true);
      try {
        const res = await attendanceAPI.getWorkerQR(user.id);
        if (res.data.success) setWorkerQr(res.data.data.qr_data_url);
      } catch (err) {
        console.error('Failed to load QR:', err);
      } finally {
        setLoadingQr(false);
      }
    }
  };

  useEffect(() => {
    const handleOnline = () => setOnlineStatus('online');
    const handleOffline = () => setOnlineStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setOnlineStatus(navigator.onLine ? 'online' : 'offline');
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  const StatusIndicator = () => {
    if (onlineStatus === 'syncing') {
      return (
        <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full text-xs font-semibold">
          <RefreshCw size={14} className="animate-spin" />
          <span>Syncing {pendingSyncCount} items...</span>
        </div>
      );
    }
    if (onlineStatus === 'offline') {
      return (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-red-100">
          <WifiOff size={14} />
          <span>Offline Mode</span>
          {pendingSyncCount > 0 && <span className="ml-1 bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[10px]">{pendingSyncCount}</span>}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-green-100">
        <Wifi size={14} />
        <span>System Online</span>
      </div>
    );
  };

  return (
    <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shadow-sm/50">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar} 
          className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
        >
          <Menu size={20} />
        </button>
        <div className="hidden md:block">
          <h2 className="text-[15px] font-semibold text-gray-800">
            {user?.role === 'lgu_viewer'
              ? 'LGU — All Barangays View (Mamburao)'
              : user?.Barangay
                ? `Barangay ${user.Barangay.barangay_name} (${user.Barangay.barangay_code})`
                : 'DILG System Administrator'
            }
          </h2>
          <p className="text-xs text-gray-500 capitalize">
            {user?.role === 'lgu_viewer' ? '🔒 Read-Only Access' : `${user?.role?.replace(/_/g, ' ')} Portal`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <StatusIndicator />
        
        <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-semibold text-gray-800 leading-tight">{user?.full_name}</p>
            <p className="text-[11px] text-gray-500">{user?.position}</p>
          </div>
          <button 
            onClick={handleOpenQr}
            title="View My QR Badge"
            className="w-10 h-10 rounded-full bg-[#1B4F72] text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer relative group"
          >
            {user?.full_name?.charAt(0) || 'U'}
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100 text-blue-600 transition-transform group-hover:scale-110">
              <QrCode size={12} />
            </div>
          </button>
        </div>
      </div>

      <Modal 
        isOpen={isQrModalOpen} 
        onClose={() => setIsQrModalOpen(false)} 
        title="My Employee QR Badge" 
        size="sm"
      >
        <div className="p-4 text-center">
          <p className="text-sm text-gray-600 mb-6">Scan this QR code using the Employee Attendance scanner to record your Time In and Time Out.</p>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 inline-block mx-auto mb-6">
            {loadingQr ? (
              <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-xl">
                 <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : workerQr ? (
              <img src={workerQr} alt="Worker QR Badge" className="w-48 h-48 object-contain" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-red-50 text-red-500 rounded-xl text-sm">
                 Failed to load QR
              </div>
            )}
          </div>

          <div className="text-left bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div className="font-bold text-gray-800 text-lg">{user?.full_name}</div>
            <div className="text-sm text-blue-600 font-semibold mb-1">{user?.position || 'Barangay Worker'}</div>
            <div className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')} Access</div>
          </div>
        </div>
      </Modal>
    </header>
  );
};

export default Header;
