import api from './api'

export const quoteService = {
  // Obtener todas las cotizaciones
  getAll: async (params = {}) => {
    const { data } = await api.get('/quotes', { params })
    return data
  },

  // Obtener cotización por ID
  getById: async (id) => {
    const { data } = await api.get(`/quotes/${id}`)
    return data
  },

  // Estadísticas
  getStats: async () => {
    const { data } = await api.get('/quotes/stats')
    return data
  },

  // Crear cotización
  create: async (quoteData) => {
    const { data } = await api.post('/quotes', quoteData)
    return data
  },

  // Actualizar cotización
  update: async (id, quoteData) => {
    const { data } = await api.put(`/quotes/${id}`, quoteData)
    return data
  },

  // Cambiar estado
  updateStatus: async (id, status) => {
    const { data } = await api.put(`/quotes/${id}`, { status })
    return data
  },

  // Convertir a pedido
  convertToOrder: async (id) => {
    const { data } = await api.post(`/quotes/${id}/convert-to-order`)
    return data
  },

  // Eliminar cotización
  delete: async (id) => {
    const { data } = await api.delete(`/quotes/${id}`)
    return data
  },
}
