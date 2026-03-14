import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('crps_user') || 'null'),
  token: localStorage.getItem('crps_token') || null,
  isAuthenticated: !!localStorage.getItem('crps_token'),

  login: (user, token) => {
    localStorage.setItem('crps_token', token);
    localStorage.setItem('crps_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('crps_token');
    localStorage.removeItem('crps_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (updates) => {
    const user = { ...get().user, ...updates };
    localStorage.setItem('crps_user', JSON.stringify(user));
    set({ user });
  },

  hasRole: (...roles) => roles.includes(get().user?.role),

  canEdit: () => ['super_admin','barangay_admin','encoder'].includes(get().user?.role),
  canDelete: () => ['super_admin','barangay_admin'].includes(get().user?.role),
  canManageUsers: () => ['super_admin','barangay_admin'].includes(get().user?.role),
  canViewReports: () => ['super_admin','barangay_admin','viewer'].includes(get().user?.role),
  isSuperAdmin: () => get().user?.role === 'super_admin',
}));

export const useUiStore = create((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  onlineStatus: navigator.onLine ? 'online' : 'offline', // 'online' | 'offline' | 'syncing'
  setOnlineStatus: (status) => set({ onlineStatus: status }),
  pendingSyncCount: 0,
  setPendingSyncCount: (n) => set({ pendingSyncCount: n }),
}));
