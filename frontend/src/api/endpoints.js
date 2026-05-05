import { apiClient } from './client'

export const eventApi = {
  info: () => apiClient.get('/event'),
  sponsors: () => apiClient.get('/event/sponsors'),
  volunteers: () => apiClient.get('/event/volunteers'),
}

export const slotsApi = {
  current: () => apiClient.get('/slots'),
}

export const registrationApi = {
  register: (payload) => apiClient.post('/registration', payload),
}

export const paymentsApi = {
  initiate: (payload) => apiClient.post('/payments/initiate', payload),
  confirm: (payload) => apiClient.post('/payments/confirm', payload),
  show: (transactionId) => apiClient.get(`/payments/${transactionId}`),
}

export const certificateApi = {
  lookup: (query) => apiClient.get('/certificates/lookup', { params: { query } }),
  verify: (uuid) => apiClient.get(`/certificates/${uuid}/verify`),
  downloadUrl: (uuid) =>
    `${apiClient.defaults.baseURL}/certificates/${uuid}/download`,
}

export const adminAuthApi = {
  login: (payload) => apiClient.post('/admin/login', payload),
  me: () => apiClient.get('/admin/me'),
  logout: () => apiClient.post('/admin/logout'),
}

export const adminApi = {
  dashboard: () => apiClient.get('/admin/dashboard'),
  participants: (params) => apiClient.get('/admin/participants', { params }),
  participant: (id) => apiClient.get(`/admin/participants/${id}`),
  updateParticipant: (id, payload) => apiClient.patch(`/admin/participants/${id}`, payload),
  verifyPayment: (id) => apiClient.post(`/admin/participants/${id}/verify-payment`),
  exportUrl: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return `${apiClient.defaults.baseURL}/admin/participants/export${query ? `?${query}` : ''}`
  },
  bulkNotify: (payload) => apiClient.post('/admin/notifications/bulk', payload),
  sponsors: () => apiClient.get('/admin/sponsors'),
  createSponsor: (payload) => apiClient.post('/admin/sponsors', payload),
  updateSponsor: (id, payload) => apiClient.put(`/admin/sponsors/${id}`, payload),
  deleteSponsor: (id) => apiClient.delete(`/admin/sponsors/${id}`),
  volunteers: () => apiClient.get('/admin/volunteers'),
  createVolunteer: (payload) => apiClient.post('/admin/volunteers', payload),
  updateVolunteer: (id, payload) => apiClient.put(`/admin/volunteers/${id}`, payload),
  deleteVolunteer: (id) => apiClient.delete(`/admin/volunteers/${id}`),
}
