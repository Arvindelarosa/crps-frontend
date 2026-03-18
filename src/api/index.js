import api from './axios';

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  directLogin: (credentials) => api.post('/auth/login/direct', credentials),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  getMe: () => api.get('/auth/me'),
  register: (data) => api.post('/auth/register', data),
  getBarangays: () => api.get('/auth/barangays'),
};

export const residentsAPI = {
  getAll: (params) => api.get('/residents', { params }),
  getDeleted: (params) => api.get('/residents/deleted', { params }),
  getById: (id) => api.get(`/residents/${id}`),
  create: (data) => api.post('/residents', data),
  update: (id, data) => api.put(`/residents/${id}`, data),
  softDelete: (id, reason) => api.delete(`/residents/${id}`, { data: { reason } }),
  restore: (id) => api.post(`/residents/${id}/restore`),
};

export const householdsAPI = {
  getAll: (params) => api.get('/households', { params }),
  getById: (id) => api.get(`/households/${id}`),
  create: (data) => api.post('/households', data),
  update: (id, data) => api.put(`/households/${id}`, data),
  remove: (id) => api.delete(`/households/${id}`),
};

export const documentsAPI = {
  getAll: (params) => api.get('/documents', { params }),
  getResidentDocs: (residentId) => api.get(`/documents/resident/${residentId}`),
  getById: (id) => api.get(`/documents/${id}`),
  create: (data) => api.post('/documents', data),
  updateStatus: (id, status, or_number) => api.patch(`/documents/${id}/status`, { status, or_number }),
};

export const kpAPI = {
  getAll: (params) => api.get('/kp', { params }),
  getById: (id) => api.get(`/kp/${id}`),
  create: (data) => api.post('/kp', data),
  update: (id, data) => api.put(`/kp/${id}`, data),
  addHearing: (id, data) => api.post(`/kp/${id}/hearings`, data),
};

export const reportsAPI = {
  getDashboardStats: (params) => api.get('/reports/dashboard', { params }),
  getSectorReport: (params) => api.get('/reports/sectors', { params }),
  getResidentList: (params) => api.get('/reports/residents', { params }),
};

export const qrAPI = {
  scan: (data) => api.post('/qr/scan', data),
  getVisitorLog: (params) => api.get('/qr/visitor-log', { params }),
  generateId: (residentId) => api.post(`/qr/generate-id/${residentId}`),
  getExistingId: (residentId) => api.get(`/qr/id/${residentId}`),
};

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  toggleActive: (id) => api.patch(`/users/${id}/toggle`),
};

export const syncAPI = {
  getPending: (params) => api.get('/sync/pending', { params }),
  addToQueue: (data) => api.post('/sync/queue', data),
  markSynced: (id) => api.patch(`/sync/${id}/synced`),
  getAnalytics: () => api.get('/sync/analytics'),
};
