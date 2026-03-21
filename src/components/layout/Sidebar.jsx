import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore, useUiStore } from '../../store';
import { 
  LayoutDashboard, Users, Home, FileText, 
  Settings, CreditCard, LogOut, ShieldAlert,
  Map, Activity, QrCode, Globe
} from 'lucide-react';
import mambuLogo from '../../assets/lgumambulogo.png';
import dilgLogo from '../../assets/DILG-Logo.png';

// Role badge config
const ROLE_LABELS = {
  super_admin:    { label: 'DILG Admin',        color: '#E74C3C' },
  barangay_admin: { label: 'Brgy. Secretary', color: '#2E86C1' },
  encoder:        { label: 'Encoder',         color: '#27AE60' },
  lgu_viewer:     { label: 'LGU Viewer',      color: '#8E44AD' },
};

// Master nav list — each item declares which roles can see it
const ALL_NAV_ITEMS = [
  { name: 'Dashboard',                 path: '/dashboard',  icon: LayoutDashboard, roles: ['super_admin','barangay_admin','encoder','lgu_viewer'] },
  { name: 'Residents Profile',         path: '/residents',  icon: Users,            roles: ['barangay_admin','encoder'] },
  { name: 'Households Tracker',        path: '/households', icon: Home,             roles: ['barangay_admin','encoder'] },
  { name: 'Barangay Identifications',  path: '/barangay-id',icon: CreditCard,       roles: ['barangay_admin','encoder'] },
  { name: 'Certificates & Clearances', path: '/certificates',icon: FileText,        roles: ['barangay_admin','encoder'] },
  { name: 'Katarungang Pambarangay',   path: '/kp-cases',   icon: ShieldAlert,      roles: ['barangay_admin','encoder'] },
  { name: 'QR Scan / Visitor Log',     path: '/qr-scan',    icon: QrCode,           roles: ['barangay_admin','encoder'] },
  { name: 'GIS Threat Mapping',        path: '/map',        icon: Map,              roles: ['super_admin','barangay_admin','encoder','lgu_viewer'] },
  { name: 'Reports & Analytics',       path: '/reports',    icon: Activity,         roles: ['super_admin','barangay_admin','lgu_viewer'] },
  { name: 'System Settings',           path: '/settings',   icon: Settings,         roles: ['super_admin'] },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed } = useUiStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Filter nav items by current user's role
  const navItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(user?.role));
  const roleMeta = ROLE_LABELS[user?.role] || { label: user?.role, color: '#666' };

  return (
    <>
      {/* Mobile Backdrop */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`sidebar bg-[#1B2631] text-[#ECF0F1] flex flex-col h-screen fixed top-0 z-50 transition-all duration-300 shadow-2xl ${
        sidebarCollapsed 
          ? '-left-64 md:left-0 md:w-[68px]' 
          : 'left-0 w-[260px]'
      }`}>
        
        {/* Branding */}
        <div className="flex items-center justify-between md:justify-center h-[72px] border-b border-gray-700/50 bg-[#151D26] px-4">
          {sidebarCollapsed ? (
            <div className="hidden md:flex flex-col items-center -space-y-1">
              <img src={mambuLogo} alt="Logo" className="w-7 h-7 object-contain" />
              <img src={dilgLogo} alt="DILG Logo" className="w-5 h-5 object-contain opacity-80" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 shrink-0">
                <img src={mambuLogo} alt="CPRS Logo" className="w-10 h-10 object-contain drop-shadow-sm relative z-20" />
                <img src={dilgLogo} alt="DILG Logo" className="w-10 h-10 object-contain drop-shadow-sm relative z-10" />
              </div>
              <div className="flex flex-col">
                <h1 className="font-bold text-xl tracking-wider text-white">CPRS</h1>
                <span className="text-[10px] text-[#AED6F1] uppercase tracking-widest leading-none">
                  {user?.role === 'lgu_viewer' ? 'LGU — Mamburao' : (user?.Barangay?.barangay_name || 'System')}
                </span>
              </div>
            </div>
          )}

          {/* Mobile close button inside sidebar */}
          {!sidebarCollapsed && (
            <button onClick={toggleSidebar} className="md:hidden p-2 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          )}
        </div>
        
        {/* LGU Read-Only Banner */}
        {user?.role === 'lgu_viewer' && !sidebarCollapsed && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-purple-900/30 border border-purple-700/40 flex items-center gap-2">
            <Globe size={14} className="text-purple-400 shrink-0" />
            <span className="text-[11px] text-purple-300 font-medium">Read-Only — All Barangays</span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) toggleSidebar();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-[#2E86C1] text-white shadow-lg shadow-[#2E86C1]/20 transform scale-[1.02]' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon size={20} className="shrink-0" />
              <span className={`font-medium text-[13px] whitespace-nowrap transition-opacity ${sidebarCollapsed ? 'md:hidden' : 'block'}`}>
                {item.name}
              </span>
              
              {/* Tooltip for desktop collapsed */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-4 invisible md:group-hover:visible bg-[#1B2631] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg whitespace-nowrap z-[100] shadow-xl border border-white/10 pointer-events-none">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700/50 space-y-2">
          {!sidebarCollapsed && (
            <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: roleMeta.color }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: roleMeta.color }}>
                {roleMeta.label}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 w-full text-left text-gray-400 hover:bg-red-900/20 hover:text-red-400 rounded-xl transition-colors group"
          >
            <LogOut size={20} className="shrink-0 transition-transform group-hover:-translate-x-1" />
            <span className={`font-medium text-[13px] ${sidebarCollapsed ? 'md:hidden' : 'block'}`}>Logout Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
