import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { clientService } from '../services/clientService'
import { measureService } from '../services/measureService'
import { Users, Plus, Ruler, Calendar, Sparkles, ChevronRight } from 'lucide-react'
import { format, startOfMonth, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'
import clsx from 'clsx'

// ── Tarjeta de estadística ────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, isLoading }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="min-w-0">
        {isLoading ? (
          <div className="space-y-1.5">
            <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 truncate">{sub || label}</p>
          </>
        )}
      </div>
    </div>
  )
}

// ── Esqueleto de fila ─────────────────────────────────
function RowSkeleton() {
  return (
    <div className="card animate-pulse flex items-center gap-4">
      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
      <div className="h-4 w-16 bg-gray-100 rounded" />
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: clientsData, isLoading: loadingClients } = useQuery(
    ['clients-dashboard'],
    () => clientService.getAll({ limit: 5 }),
    { staleTime: 30_000 }
  )

  const { data: recentData, isLoading: loadingRecent } = useQuery(
    ['measures-recent'],
    () => measureService.getRecent(5),
    { staleTime: 30_000 }
  )

  const clients      = clientsData?.clients || []
  const total        = clientsData?.pagination?.total || 0
  const recentMeas   = recentData?.measures || []

  // Clientas este mes
  const thisMonthStart = startOfMonth(new Date())
  const clientsThisMonth = clients.filter(c => isAfter(new Date(c.createdAt), thisMonthStart)).length

  // Última sesión
  const lastSession = recentMeas[0]
  const lastSessionDate = lastSession
    ? format(new Date(lastSession.createdAt), "d MMM", { locale: es })
    : '—'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tablet:text-3xl font-bold text-gray-900">
            {greeting}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 mt-0.5 capitalize">
            {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </div>
        <Link to="/clients/new" className="btn-primary flex-shrink-0">
          <Plus className="w-5 h-5" />
          <span className="hidden xs:inline">Nuevo cliente</span>
        </Link>
      </div>

      {/* ── Estadísticas ── */}
      <div className="grid grid-cols-2 tablet:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total clientes"
          value={total}
          sub="clientes registrados"
          color="bg-primary-500"
          isLoading={loadingClients}
        />
        <StatCard
          icon={Plus}
          label="Este mes"
          value={clientsThisMonth}
          sub="nuevas este mes"
          color="bg-accent-500"
          isLoading={loadingClients}
        />
        <StatCard
          icon={Ruler}
          label="Sesiones recientes"
          value={recentMeas.length}
          sub="últimas sesiones"
          color="bg-stone-500"
          isLoading={loadingRecent}
        />
        <StatCard
          icon={Calendar}
          label="Última sesión"
          value={lastSessionDate}
          sub={lastSession?.client?.name || 'Sin sesiones'}
          color="bg-primary-700"
          isLoading={loadingRecent}
        />
      </div>

      {/* ── Banner de acción rápida ── */}
      <div className="card overflow-hidden p-0">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary-200" />
                <span className="text-primary-200 text-sm font-medium">Atelier Elizabeth</span>
              </div>
              <h3 className="font-display text-lg font-semibold">Nueva sesión de medidas</h3>
              <p className="text-primary-200 text-sm mt-0.5">Registra un nuevo cliente o continúa con uno existente</p>
            </div>
            <Link
              to="/clients/new"
              className="btn-secondary bg-white/10 text-white border-white/20 hover:bg-white/20 flex-shrink-0 backdrop-blur-sm"
            >
              <Plus className="w-5 h-5" />
              Comenzar
            </Link>
          </div>
        </div>
      </div>

      <div className="grid tablet:grid-cols-2 gap-6">
        {/* ── Clientes recientes ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">Mis clientes</h2>
            <Link to="/clients" className="text-primary-600 text-sm font-medium hover:underline">
              Ver todas →
            </Link>
          </div>

          {loadingClients ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <RowSkeleton key={i} />)}
            </div>
          ) : clients.length === 0 ? (
            <div className="card text-center py-10">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 font-medium text-sm">Aún no tienes clientes</p>
              <Link to="/clients/new" className="btn-primary mx-auto mt-3 text-sm py-2 px-4">
                <Plus className="w-4 h-4" /> Nuevo cliente
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {clients.map((client) => (
                <Link
                  key={client._id}
                  to={`/clients/${client._id}`}
                  className="card-hover flex items-center gap-3 py-3 px-4"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-base flex-shrink-0">
                    {client.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-sm">{client.name}</p>
                    <p className="text-xs text-gray-500 truncate">{client.phone || client.email || 'Sin contacto'}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {client.latestMeasure?.suggestedSize && (
                      <span className="badge bg-primary-100 text-primary-700 text-xs">
                        Talla {client.latestMeasure.suggestedSize}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Últimas medidas registradas ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">Últimas sesiones</h2>
          </div>

          {loadingRecent ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <RowSkeleton key={i} />)}
            </div>
          ) : recentMeas.length === 0 ? (
            <div className="card text-center py-10">
              <Ruler className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 font-medium text-sm">Sin sesiones registradas</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentMeas.map((m) => (
                <Link
                  key={m._id}
                  to={`/clients/${m.client?._id}`}
                  className="card-hover flex items-center gap-3 py-3 px-4"
                >
                  <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center text-accent-700 font-bold text-base flex-shrink-0">
                    {m.client?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-sm">{m.client?.name || 'Cliente'}</p>
                    <p className="text-xs text-gray-500 truncate">{m.label || 'Sin etiqueta'}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {m.suggestedSize && (
                      <span className="badge bg-accent-100 text-accent-700 text-xs">
                        {m.suggestedSize}
                      </span>
                    )}
                    <p className="text-xs text-gray-400">
                      {format(new Date(m.createdAt), 'd MMM', { locale: es })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
