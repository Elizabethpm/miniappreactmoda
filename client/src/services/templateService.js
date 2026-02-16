import api from './api'

export const templateService = {
  // Obtener todas las plantillas
  getAll: async (params = {}) => {
    const { data } = await api.get('/templates', { params })
    return data
  },

  // Obtener plantilla por ID
  getById: async (id) => {
    const { data } = await api.get(`/templates/${id}`)
    return data
  },

  // Crear plantilla personalizada
  create: async (templateData) => {
    const { data } = await api.post('/templates', templateData)
    return data
  },

  // Actualizar plantilla
  update: async (id, templateData) => {
    const { data } = await api.put(`/templates/${id}`, templateData)
    return data
  },

  // Eliminar plantilla
  delete: async (id) => {
    const { data } = await api.delete(`/templates/${id}`)
    return data
  },

  // Inicializar plantillas del sistema
  initSystem: async () => {
    const { data } = await api.post('/templates/init-system')
    return data
  },
}
