import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(sessionStorage.getItem('crps_user') || 'null'),
  token: sessionStorage.getItem('crps_token') || null,
  isAuthenticated: !!sessionStorage.getItem('crps_token'),

  login: (user, token) => {
    sessionStorage.setItem('crps_token', token);
    sessionStorage.setItem('crps_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    sessionStorage.removeItem('crps_token');
    sessionStorage.removeItem('crps_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (updates) => {
    const user = { ...get().user, ...updates };
    sessionStorage.setItem('crps_user', JSON.stringify(user));
    set({ user });
  },

  hasRole: (...roles) => roles.includes(get().user?.role),

  canEdit:        () => ['super_admin','barangay_admin','encoder'].includes(get().user?.role),
  canDelete:      () => ['super_admin','barangay_admin'].includes(get().user?.role),
  canManageUsers: () => ['super_admin','barangay_admin'].includes(get().user?.role),
  canViewReports: () => ['super_admin','barangay_admin','lgu_viewer'].includes(get().user?.role),
  isLguViewer:    () => get().user?.role === 'lgu_viewer',
  isSuperAdmin:   () => get().user?.role === 'super_admin',
  isBarangayAdmin:() => get().user?.role === 'barangay_admin',
  // LGU viewers can see all barangays; barangay roles see only their own
  canViewAllBarangays: () => ['super_admin','lgu_viewer'].includes(get().user?.role),
}));

export const useUiStore = create((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  onlineStatus: navigator.onLine ? 'online' : 'offline', // 'online' | 'offline' | 'syncing'
  setOnlineStatus: (status) => set({ onlineStatus: status }),
  pendingSyncCount: 0,
  setPendingSyncCount: (n) => set({ pendingSyncCount: n }),
}));
