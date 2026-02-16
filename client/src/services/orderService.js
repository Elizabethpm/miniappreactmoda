import api from './api'

export const orderService = {
  // Obtener todos los pedidos
  getAll: async (params = {}) => {
    const { data } = await api.get('/orders', { params })
    return data
  },

  // Obtener pedidos en formato Kanban
  getKanban: async () => {
    const { data } = await api.get('/orders/kanban')
    return data
  },

  // Obtener pedido por ID
  getById: async (id) => {
    const { data } = await api.get(`/orders/${id}`)
    return data
  },

  // Próximos pedidos
  getUpcoming: async (limit = 5) => {
    const { data } = await api.get('/orders/upcoming', { params: { limit } })
    return data
  },

  // Estadísticas
  getStats: async () => {
    const { data } = await api.get('/orders/stats')
    return data
  },

  // Crear pedido
  create: async (orderData) => {
    const { data } = await api.post('/orders', orderData)
    return data
  },

  // Actualizar pedido
  update: async (id, orderData) => {
    const { data } = await api.put(`/orders/${id}`, orderData)
    return data
  },

  // Actualizar solo estado (para Kanban)
  updateStatus: async (id, status, notes = '') => {
    const { data } = await api.patch(`/orders/${id}/status`, { status, notes })
    return data
  },

  // Agregar pago
  addPayment: async (id, amount) => {
    const { data } = await api.post(`/orders/${id}/payment`, { amount })
    return data
  },

  // Eliminar pedido
  delete: async (id) => {
    const { data } = await api.delete(`/orders/${id}`)
    return data
  },
}
