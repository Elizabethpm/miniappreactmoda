import api from './api'

export const galleryService = {
  // Obtener galería
  getAll: async (params = {}) => {
    const { data } = await api.get('/gallery', { params })
    return data
  },

  // Obtener item por ID
  getById: async (id) => {
    const { data } = await api.get(`/gallery/${id}`)
    return data
  },

  // Obtener categorías
  getCategories: async () => {
    const { data } = await api.get('/gallery/categories')
    return data
  },

  // Galería pública
  getPublic: async (params = {}) => {
    const { data } = await api.get('/gallery/public', { params })
    return data
  },

  // Crear item
  create: async (itemData) => {
    const { data } = await api.post('/gallery', itemData)
    return data
  },

  // Actualizar item
  update: async (id, itemData) => {
    const { data } = await api.put(`/gallery/${id}`, itemData)
    return data
  },

  // Eliminar item
  delete: async (id) => {
    const { data } = await api.delete(`/gallery/${id}`)
    return data
  },
}
