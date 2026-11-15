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
  submit: (payload) => apiClient.post('/payments/submit', payload),
  confirm: (payload) => apiClient.post('/payments/confirm', payload),
  config: () => apiClient.get('/payments/config'),
  show: (transactionId, token) => apiClient.get(`/payments/${transactionId}`, { params: { token } }),
}

export const resultsApi = {
  list: (category) => apiClient.get('/results', { params: category ? { category } : {} }),
}

export const certificateApi = {
  lookup: (bib, phone) => apiClient.get('/certificates/lookup', { params: { bib, phone } }),
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
  // The export is behind bearer auth, so it must be fetched (not linked) and saved as a blob.
  exportCsv: (params = {}) =>
    apiClient.get('/admin/participants/export', { params, responseType: 'blob' }),
  importResults: (rows) => apiClient.post('/admin/results/import', { rows }),
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
