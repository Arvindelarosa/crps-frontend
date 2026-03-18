import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore, useUiStore } from '../../store';
import { 
  LayoutDashboard, Users, Home, FileText, 
  Settings, CreditCard, LogOut, ShieldAlert,
  Map, Activity, QrCode, Globe
} from 'lucide-react';

// Role badge config
const ROLE_LABELS = {
  super_admin:    { label: 'Super Admin',     color: '#E74C3C' },
  barangay_admin: { label: 'Brgy. Secretary', color: '#2E86C1' },
  encoder:        { label: 'Encoder',         color: '#27AE60' },
  lgu_viewer:     { label: 'LGU Viewer',      color: '#8E44AD' },
};

// Master nav list — each item declares which roles can see it
const ALL_NAV_ITEMS = [
  { name: 'Dashboard',                 path: '/dashboard',  icon: LayoutDashboard, roles: ['super_admin','barangay_admin','encoder','lgu_viewer'] },
  { name: 'Residents Profile',         path: '/residents',  icon: Users,            roles: ['super_admin','barangay_admin','encoder'] },
  { name: 'Households Tracker',        path: '/households', icon: Home,             roles: ['super_admin','barangay_admin','encoder'] },
  { name: 'Barangay Identifications',  path: '/barangay-id',icon: CreditCard,       roles: ['super_admin','barangay_admin','encoder'] },
  { name: 'Certificates & Clearances', path: '/certificates',icon: FileText,        roles: ['super_admin','barangay_admin','encoder'] },
  { name: 'Katarungang Pambarangay',   path: '/kp-cases',   icon: ShieldAlert,      roles: ['super_admin','barangay_admin','encoder'] },
  { name: 'QR Scan / Visitor Log',     path: '/qr-scan',    icon: QrCode,           roles: ['super_admin','barangay_admin','encoder'] },
  { name: 'GIS Threat Mapping',        path: '/map',        icon: Map,              roles: ['super_admin','barangay_admin','encoder','lgu_viewer'] },
  { name: 'Reports & Analytics',       path: '/reports',    icon: Activity,         roles: ['super_admin','barangay_admin','lgu_viewer'] },
  { name: 'System Settings',           path: '/settings',   icon: Settings,         roles: ['super_admin','barangay_admin'] },
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
    <aside className={`sidebar bg-[#1B2631] text-[#ECF0F1] flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300 ${sidebarCollapsed ? 'collapsed' : ''}`}>
      
      {/* Branding */}
      <div className="flex items-center justify-center h-[72px] border-b border-gray-700/50 bg-[#151D26]">
        {sidebarCollapsed ? (
          <div className="font-bold text-xl text-[#F39C12]">CRPS</div>
        ) : (
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-xl tracking-wider text-white">CRPS</h1>
            <span className="text-[10px] text-[#AED6F1] uppercase tracking-widest">
              {user?.role === 'lgu_viewer' ? 'LGU — Mamburao' : (user?.Barangay?.barangay_name || 'System')}
            </span>
          </div>
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
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3 scrollbar-thin scrollbar-thumb-gray-600">
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
            
            {/* Collapsed tooltip */}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 invisible group-hover:visible bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer: role badge + logout */}
      <div className="p-4 border-t border-gray-700/50">
        {!sidebarCollapsed && (
          <div className="mb-2 px-3 py-1.5 rounded-md flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full shrink-0"
              style={{ background: roleMeta.color }}
            />
            <span className="text-[11px] font-semibold" style={{ color: roleMeta.color }}>
              {roleMeta.label}
            </span>
          </div>
        )}
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
