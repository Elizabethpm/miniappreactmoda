import api from './api'

export const appointmentService = {
  // Obtener todas las citas
  getAll: async (params = {}) => {
    const { data } = await api.get('/appointments', { params })
    return data
  },

  // Obtener citas por rango de fechas
  getByDateRange: async (startDate, endDate) => {
    const { data } = await api.get('/appointments', {
      params: { startDate, endDate },
    })
    return data
  },

  // Obtener cita por ID
  getById: async (id) => {
    const { data } = await api.get(`/appointments/${id}`)
    return data
  },

  // Próximas citas
  getUpcoming: async (limit = 5) => {
    const { data } = await api.get('/appointments/upcoming', { params: { limit } })
    return data
  },

  // Estadísticas
  getStats: async () => {
    const { data } = await api.get('/appointments/stats')
    return data
  },

  // Crear cita
  create: async (appointmentData) => {
    const { data } = await api.post('/appointments', appointmentData)
    return data
  },

  // Actualizar cita
  update: async (id, appointmentData) => {
    const { data } = await api.put(`/appointments/${id}`, appointmentData)
    return data
  },

  // Eliminar cita
  delete: async (id) => {
    const { data } = await api.delete(`/appointments/${id}`)
    return data
  },
}
