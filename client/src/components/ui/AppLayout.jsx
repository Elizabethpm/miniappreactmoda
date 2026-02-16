import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, LogOut,
  Scissors, Menu, X, Settings,
  Calendar, FileText, Package,
  Image, ClipboardList, Globe, MessageCircle
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/clients',      icon: Users,           label: 'Clientes'       },
  { to: '/appointments', icon: Calendar,        label: 'Citas'          },
  { to: '/quotes',       icon: FileText,        label: 'Cotizaciones'   },
  { to: '/orders',       icon: Package,         label: 'Pedidos'        },
  { to: '/gallery',      icon: Image,           label: 'Galería'        },
  { to: '/services',     icon: ClipboardList,   label: 'Servicios'      },
  { to: '/settings',     icon: Settings,        label: 'Configuración'  },
]

export default function AppLayout() {
  const { user, logout }   = useAuth()
  const navigate           = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const studioLabel = user?.studioName || 'Atelier Elizabeth'

  return (
    <div className="min-h-screen flex bg-stone-50">
      {/* ─── Sidebar (tablet/desktop) ─── */}
      <aside className="hidden tablet:flex flex-col w-64 bg-white border-r border-gray-100 shadow-sm">
        {/* Logo */}
        <div className="px-6 py-7 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-gray-900 leading-tight">{studioLabel}</p>
              <p className="text-xs text-gray-400 truncate max-w-[140px]">
                Diseñadora de Modas
              </p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary-50 text-primary-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer usuario */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            {user?.logoUrl ? (
              <img
                src={user.logoUrl}
                alt="Logo"
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.plan}</p>
            </div>
          </div>
          {/* Enlaces externos */}
          {(user?.website || user?.whatsapp) && (
            <div className="flex gap-2 px-3 py-2">
              {user?.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Web
                </a>
              )}
              {user?.whatsapp && (
                <a
                  href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500
                       hover:bg-red-50 transition-colors duration-150"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ─── Mobile nav overlay ─── */}
      {mobileOpen && (
        <div className="tablet:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)}>
          <aside
            className="w-72 h-full bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-gray-900">{studioLabel}</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-5 space-y-1">
              {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all',
                    isActive ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-600'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-gray-100">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50">
                <LogOut className="w-5 h-5" />
                Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ─── Contenido principal ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar móvil */}
        <header className="tablet:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="btn-ghost p-2">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary-500" />
            <span className="font-display font-bold text-gray-900">{studioLabel}</span>
          </div>
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </header>

        {/* Área de contenido */}
        <main className="flex-1 p-4 tablet:p-6 tablet-lg:p-8 overflow-y-auto animate-fade">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
