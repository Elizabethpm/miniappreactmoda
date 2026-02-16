import api from './api'

export const clientService = {
  // CRUD Clientas
  getAll:    (params)     => api.get('/clients', { params }),
  getById:   (id)         => api.get(`/clients/${id}`),
  create:    (data)       => api.post('/clients', data),
  update:    (id, data)   => api.put(`/clients/${id}`, data),
  delete:    (id)         => api.delete(`/clients/${id}`),

  // Foto de referencia
  uploadPhoto: (clientId, formData) =>
    api.post(`/clients/${clientId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
}
