import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore, useUiStore } from '../../store';
import { 
  LayoutDashboard, Users, Home, FileText, 
  Settings, CreditCard, LogOut, ShieldAlert,
  Map, Activity, QrCode
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed } = useUiStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Residents Profile', path: '/residents', icon: Users },
    { name: 'Households Tracker', path: '/households', icon: Home },
    { name: 'Barangay Identifications', path: '/barangay-id', icon: CreditCard },
    { name: 'Certificates & Clearances', path: '/certificates', icon: FileText },
    { name: 'Katarungang Pambarangay', path: '/kp-cases', icon: ShieldAlert },
    { name: 'QR Scan / Visitor Log', path: '/qr-scan', icon: QrCode },
    { name: 'GIS Threat Mapping', path: '/map', icon: Map },
    { name: 'Reports & Analytics', path: '/reports', icon: Activity },
  ];

  if (user?.role === 'super_admin' || user?.role === 'barangay_admin') {
    navItems.push({ name: 'System Settings', path: '/settings', icon: Settings });
  }

  return (
    <aside className={`sidebar bg-[#1B2631] text-[#ECF0F1] flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300 ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="flex items-center justify-center h-[72px] border-b border-gray-700/50 bg-[#151D26]">
        {sidebarCollapsed ? (
          <div className="font-bold text-xl text-[#F39C12]">CRPS</div>
        ) : (
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-xl tracking-wider text-white">CRPS</h1>
            <span className="text-[10px] text-[#AED6F1] uppercase tracking-widest">{user?.Barangay?.barangay_name || 'System'}</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3 scrollbar-thin scrollbar-thumb-gray-600">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group relative ${
                isActive 
                  ? 'bg-[#2E86C1] text-white shadow-md shadow-[#2E86C1]/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
            title={sidebarCollapsed ? item.name : undefined}
          >
            <item.icon size={20} className="shrink-0" />
            {!sidebarCollapsed && <span className="font-medium text-[13px]">{item.name}</span>}
            
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 invisible group-hover:visible bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-gray-400 hover:bg-red-900/40 hover:text-red-400 rounded-lg transition-colors"
          title={sidebarCollapsed ? "Logout" : undefined}
        >
          <LogOut size={20} className="shrink-0" />
          {!sidebarCollapsed && <span className="font-medium text-[13px]">Logout Session</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
