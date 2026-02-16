import api from './api'

export const measureService = {
  // Medidas de una clienta
  getByClient:    (clientId)         => api.get(`/clients/${clientId}/measures`),
  getById:        (clientId, measId) => api.get(`/clients/${clientId}/measures/${measId}`),
  create:         (clientId, data)   => api.post(`/clients/${clientId}/measures`, data),
  update:         (clientId, measId, data) =>
                    api.put(`/clients/${clientId}/measures/${measId}`, data),
  delete:         (clientId, measId) =>
                    api.delete(`/clients/${clientId}/measures/${measId}`),
  getLastest:     (clientId)         => api.get(`/clients/${clientId}/measures/latest`),
  // Medidas recientes de todas las clientas
  getRecent:      (limit = 5)        => api.get(`/measures/recent?limit=${limit}`),
}
