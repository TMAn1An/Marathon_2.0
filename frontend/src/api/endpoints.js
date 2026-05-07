import { apiClient } from './client'

export const platformApi = {
  info: () => apiClient.get('/event-info'),
}

export const eventsApi = {
  list: () => apiClient.get('/events'),
  show: (slug) => apiClient.get(`/events/${slug}`),
  registrationStatus: (slug) => apiClient.get(`/events/${slug}/registration-status`),
  slots: (slug) => apiClient.get(`/events/${slug}/slots`),
  register: (slug, payload) => apiClient.post(`/events/${slug}/registration`, payload),
  initiatePayment: (slug, payload) => apiClient.post(`/events/${slug}/payments/initiate`, payload),
}

export const paymentsApi = {
  confirm: (payload) => apiClient.post('/payments/confirm', payload),
}

export const postsApi = {
  list: (params) => apiClient.get('/posts', { params }),
  show: (slug) => apiClient.get(`/posts/${slug}`),
}

export const galleryApi = {
  list: (params) => apiClient.get('/gallery', { params }),
}

export const sponsorsApi = {
  list: () => apiClient.get('/event-info/sponsors'),
}

export const volunteersApi = {
  list: () => apiClient.get('/event-info/volunteers'),
}

export const certificateApi = {
  lookup: (params) => apiClient.get('/certificates/lookup', { params }),
  verify: (uuid) => apiClient.get(`/certificates/${uuid}/verify`),
  downloadUrl: (uuid) => `${apiClient.defaults.baseURL}/certificates/${uuid}/download`,
}

export const adminAuthApi = {
  login: (payload) => apiClient.post('/admin/login', payload),
  me: () => apiClient.get('/admin/me'),
  logout: () => apiClient.post('/admin/logout'),
}

export const adminApi = {
  dashboard: (params) => apiClient.get('/admin/dashboard', { params }),

  events: () => apiClient.get('/admin/events'),
  event: (id) => apiClient.get(`/admin/events/${id}`),
  createEvent: (payload) => apiClient.post('/admin/events', payload),
  updateEvent: (id, payload) => apiClient.put(`/admin/events/${id}`, payload),
  deleteEvent: (id) => apiClient.delete(`/admin/events/${id}`),
  setEventStatus: (id, payload) => apiClient.post(`/admin/events/${id}/status`, payload),
  disableOverride: (id) => apiClient.post(`/admin/events/${id}/disable-override`),

  participants: (eventId, params) =>
    apiClient.get(`/admin/events/${eventId}/participants`, { params }),
  participant: (id) => apiClient.get(`/admin/participants/${id}`),
  updateParticipant: (id, payload) =>
    apiClient.patch(`/admin/participants/${id}`, payload),
  recordResults: (id, payload) =>
    apiClient.put(`/admin/participants/${id}/results`, payload),
  verifyPayment: (id) => apiClient.post(`/admin/participants/${id}/verify-payment`),
  exportUrl: (eventId, params = {}) => {
    const q = new URLSearchParams(params).toString()
    return `${apiClient.defaults.baseURL}/admin/events/${eventId}/participants/export${q ? `?${q}` : ''}`
  },
  createGuest: (eventId, payload) =>
    apiClient.post(`/admin/events/${eventId}/guest-participants`, payload),

  posts: (params) => apiClient.get('/admin/posts', { params }),
  post: (id) => apiClient.get(`/admin/posts/${id}`),
  createPost: (payload, config) => apiClient.post('/admin/posts', payload, config),
  updatePost: (id, payload, config) => apiClient.post(`/admin/posts/${id}`, payload, config),
  deletePost: (id) => apiClient.delete(`/admin/posts/${id}`),
  publishPost: (id) => apiClient.post(`/admin/posts/${id}/publish`),
  unpublishPost: (id) => apiClient.post(`/admin/posts/${id}/unpublish`),

  certificateTemplate: (eventId) =>
    apiClient.get(`/admin/events/${eventId}/certificate-template`),
  saveCertificateTemplate: (eventId, payload, config) =>
    apiClient.post(`/admin/events/${eventId}/certificate-template`, payload, config),
  duplicateCertificateTemplate: (eventId, sourceId) =>
    apiClient.post(`/admin/events/${eventId}/certificate-template/duplicate-from/${sourceId}`),

  gallery: (params) => apiClient.get('/admin/gallery', { params }),
  uploadGallery: (formData) =>
    apiClient.post('/admin/gallery', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteGalleryItem: (id) => apiClient.delete(`/admin/gallery/${id}`),

  bulkNotify: (payload) => apiClient.post('/admin/notifications/bulk', payload),

  sponsors: () => apiClient.get('/admin/sponsors'),
  createSponsor: (payload) => apiClient.post('/admin/sponsors', payload),
  updateSponsor: (id, payload) => apiClient.put(`/admin/sponsors/${id}`, payload),
  deleteSponsor: (id) => apiClient.delete(`/admin/sponsors/${id}`),

  volunteers: () => apiClient.get('/admin/volunteers'),
  createVolunteer: (payload) => apiClient.post('/admin/volunteers', payload),
  updateVolunteer: (id, payload) => apiClient.put(`/admin/volunteers/${id}`, payload),
  deleteVolunteer: (id) => apiClient.delete(`/admin/volunteers/${id}`),

  admins: () => apiClient.get('/admin/admins'),
  createAdmin: (payload) => apiClient.post('/admin/admins', payload),
  updateAdmin: (id, payload) => apiClient.put(`/admin/admins/${id}`, payload),
  deleteAdmin: (id) => apiClient.delete(`/admin/admins/${id}`),
}
