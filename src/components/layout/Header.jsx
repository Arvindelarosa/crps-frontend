import React, { useEffect } from 'react';
import { Menu, Bell, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useAuthStore, useUiStore } from '../../store';

const Header = () => {
  const { user } = useAuthStore();
  const { toggleSidebar, onlineStatus, setOnlineStatus, pendingSyncCount } = useUiStore();

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
    <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm/50">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar} 
          className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
        >
          <Menu size={20} />
        </button>
        <div className="hidden md:block">
          <h2 className="text-[15px] font-semibold text-gray-800">
            {user?.Barangay ? `Barangay ${user.Barangay.barangay_name} (${user.Barangay.barangay_code})` : 'System Administration'}
          </h2>
          <p className="text-xs text-gray-500 capitalize">{user?.role.replace('_', ' ')} Portal</p>
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
          <div className="w-10 h-10 rounded-full bg-[#1B4F72] text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
