import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Pages
import LoginPage        from './pages/LoginPage'
import RegisterPage     from './pages/RegisterPage'
import DashboardPage    from './pages/DashboardPage'
import ClientsPage      from './pages/ClientsPage'
import ClientDetailPage from './pages/ClientDetailPage'
import NewClientPage    from './pages/NewClientPage'
import MeasuresPage     from './pages/MeasuresPage'
import SettingsPage     from './pages/SettingsPage'
import NotFoundPage     from './pages/NotFoundPage'
import AppointmentsPage from './pages/AppointmentsPage'
import QuotesPage       from './pages/QuotesPage'
import OrdersPage       from './pages/OrdersPage'
import GalleryPage      from './pages/GalleryPage'
import ServicesPage     from './pages/ServicesPage'

// Layout
import AppLayout from './components/ui/AppLayout'

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}

// Public Route (redirige si ya está autenticado)
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute><RegisterPage /></PublicRoute>
      } />

      {/* Rutas protegidas con layout */}
      <Route path="/" element={
        <ProtectedRoute><AppLayout /></ProtectedRoute>
      }>
        <Route path="dashboard"             element={<DashboardPage />} />
        <Route path="clients"               element={<ClientsPage />} />
        <Route path="clients/new"           element={<NewClientPage />} />
        <Route path="clients/:id"           element={<ClientDetailPage />} />
        <Route path="clients/:id/measures"  element={<MeasuresPage />} />
        <Route path="appointments"          element={<AppointmentsPage />} />
        <Route path="quotes"                element={<QuotesPage />} />
        <Route path="orders"                element={<OrdersPage />} />
        <Route path="gallery"               element={<GalleryPage />} />
        <Route path="services"              element={<ServicesPage />} />
        <Route path="settings"              element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
