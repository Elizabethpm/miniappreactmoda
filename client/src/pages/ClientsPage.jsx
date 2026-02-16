import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { clientService } from '../services/clientService'
import { Plus, Search, Users, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useDebounce } from '../hooks/useDebounce'

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)
  const debouncedSearch     = useDebounce(search, 350)

  const { data, isLoading } = useQuery(
    ['clients', debouncedSearch, page],
    () => clientService.getAll({ search: debouncedSearch, page, limit: 15 }),
    { keepPreviousData: true }
  )

  const clients    = data?.clients || []
  const pagination = data?.pagination || {}

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl tablet:text-3xl font-bold text-gray-900">Clientes</h1>
        <Link to="/clients/new" className="btn-primary flex-shrink-0">
          <Plus className="w-5 h-5" />
          <span className="hidden xs:inline">Nueva</span>
        </Link>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          type="search"
          placeholder="Buscar por nombre..."
          className="input-field pl-12"
        />
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="card animate-pulse flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/5" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-lg">
            {search ? `No se encontraron resultados para "${search}"` : 'Sin clientes registrados'}
          </p>
          {!search && (
            <Link to="/clients/new" className="btn-primary mx-auto mt-4">
              <Plus className="w-4 h-4" /> Agregar primer cliente
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {clients.map((client) => (
              <Link
                key={client._id}
                to={`/clients/${client._id}`}
                className="card-hover flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl flex-shrink-0">
                  {client.name[0].toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {client.phone || client.email || 'Sin datos de contacto'}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {client.latestMeasure?.suggestedSize && (
                    <span className="badge bg-primary-100 text-primary-700">
                      T. {client.latestMeasure.suggestedSize}
                    </span>
                  )}
                  <p className="text-xs text-gray-400">
                    {format(new Date(client.createdAt), 'd MMM yy', { locale: es })}
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
              </Link>
            ))}
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-secondary disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                {page} / {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
