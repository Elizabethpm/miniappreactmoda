import axios from 'axios'

// Configuración dinámica de la API URL
const getApiUrl = () => {
  // En desarrollo, usar proxy de Vite
  if (import.meta.env.DEV) {
    return '/api'
  }
  // En producción, usar la URL completa del backend + /api
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  return `${backendUrl}/api`
}

// Instancia base de Axios
const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor de request: adjunta el token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor de response: manejo centralizado de errores
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Error de conexión'
    const status  = error.response?.status

    // Token expirado → logout automático
    if (status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    return Promise.reject({ message, status, original: error })
  }
)

export default api
