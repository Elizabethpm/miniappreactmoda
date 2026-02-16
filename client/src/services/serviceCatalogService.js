import api from './api'

export const serviceService = {
  // Obtener todos los servicios
  getAll: async (params = {}) => {
    const { data } = await api.get('/services', { params })
    return data
  },

  // Obtener servicio por ID
  getById: async (id) => {
    const { data } = await api.get(`/services/${id}`)
    return data
  },

  // Obtener servicios por categoría
  getByCategory: async () => {
    const { data } = await api.get('/services/by-category')
    return data
  },

  // Crear servicio
  create: async (serviceData) => {
    const { data } = await api.post('/services', serviceData)
    return data
  },

  // Actualizar servicio
  update: async (id, serviceData) => {
    const { data } = await api.put(`/services/${id}`, serviceData)
    return data
  },

  // Eliminar servicio
  delete: async (id) => {
    const { data } = await api.delete(`/services/${id}`)
    return data
  },
}
