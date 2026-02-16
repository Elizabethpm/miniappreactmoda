import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { serviceService } from '../services/serviceCatalogService'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { Scissors, Plus, X, Edit2, Trash2, DollarSign, Clock } from 'lucide-react'

const CATEGORIES = [
  { id: 'confeccion', label: 'Confección', emoji: '✂️' },
  { id: 'arreglos', label: 'Arreglos', emoji: '🧵' },
  { id: 'diseno', label: 'Diseño', emoji: '✏️' },
  { id: 'consultoria', label: 'Consultoría', emoji: '💬' },
  { id: 'otro', label: 'Otro', emoji: '📦' },
]

const PRICE_UNITS = {
  unidad: 'por unidad',
  hora: 'por hora',
  metro: 'por metro',
  pieza: 'por pieza',
}

export default function ServicesPage() {
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [filter, setFilter] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery(
    ['services', filter],
    () => serviceService.getAll({ category: filter || undefined }),
    { staleTime: 30_000 }
  )

  const services = data?.services || []

  const groupedServices = CATEGORIES.map((cat) => ({
    ...cat,
    services: services.filter((s) => s.category === cat.id),
  })).filter((g) => g.services.length > 0 || !filter)

  const handleEdit = (service) => {
    setEditingService(service)
    setShowModal(true)
  }

  const handleNew = () => {
    setEditingService(null)
    setShowModal(true)
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl tablet:text-3xl font-bold text-gray-900">
          <Scissors className="w-7 h-7 inline-block mr-2 text-primary-500" />
          Catálogo de Servicios
        </h1>
        <button onClick={handleNew} className="btn-primary">
          <Plus className="w-5 h-5" />
          <span className="hidden xs:inline">Nuevo</span>
        </button>
      </div>

      <p className="text-gray-500">
        Define tus servicios y precios para agregarlos fácilmente a las cotizaciones.
      </p>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <FilterChip active={!filter} onClick={() => setFilter('')}>Todos</FilterChip>
        {CATEGORIES.map((cat) => (
          <FilterChip key={cat.id} active={filter === cat.id} onClick={() => setFilter(cat.id)}>
            {cat.emoji} {cat.label}
          </FilterChip>
        ))}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse h-20" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="card text-center py-16">
          <Scissors className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-lg">No hay servicios registrados</p>
          <p className="text-gray-400 text-sm mt-1">
            Crea un catálogo de tus servicios para agilizar las cotizaciones
          </p>
          <button onClick={handleNew} className="btn-primary mx-auto mt-5">
            <Plus className="w-4 h-4" /> Crear servicio
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedServices.map((group) => (
            group.services.length > 0 && (
              <div key={group.id}>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>{group.emoji}</span>
                  <span>{group.label}</span>
                  <span className="text-xs text-gray-400">({group.services.length})</span>
                </h3>
                <div className="space-y-2">
                  {group.services.map((service) => (
                    <ServiceCard key={service._id} service={service} onEdit={() => handleEdit(service)} />
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ServiceModal
          service={editingService}
          onClose={() => { setShowModal(false); setEditingService(null) }}
          onSave={() => { qc.invalidateQueries('services'); setShowModal(false); setEditingService(null) }}
        />
      )}
    </div>
  )
}

function FilterChip({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
        active
          ? 'bg-primary-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      )}
    >
      {children}
    </button>
  )
}

function ServiceCard({ service, onEdit }) {
  const qc = useQueryClient()

  const deleteMutation = useMutation(() => serviceService.delete(service._id), {
    onSuccess: () => {
      toast.success('Servicio eliminado')
      qc.invalidateQueries('services')
    },
  })

  const handleDelete = () => {
    if (window.confirm('¿Eliminar este servicio?')) {
      deleteMutation.mutate()
    }
  }

  return (
    <div className="card flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{service.name}</p>
        {service.description && (
          <p className="text-sm text-gray-500 truncate">{service.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          {service.estimatedHours && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {service.estimatedHours}h
            </span>
          )}
          {service.estimatedDays && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {service.estimatedDays}d
            </span>
          )}
        </div>
      </div>
      
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-lg text-primary-600">
          ${service.basePrice?.toLocaleString()}
        </p>
        <p className="text-xs text-gray-400">{PRICE_UNITS[service.priceUnit]}</p>
      </div>

      <div className="flex gap-1 flex-shrink-0">
        <button onClick={onEdit} className="btn-ghost p-2 text-gray-400 hover:text-primary-500">
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isLoading}
          className="btn-ghost p-2 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function ServiceModal({ service, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || 'confeccion',
    basePrice: service?.basePrice || 0,
    priceUnit: service?.priceUnit || 'unidad',
    estimatedHours: service?.estimatedHours || '',
    estimatedDays: service?.estimatedDays || '',
  })

  const createMutation = useMutation(serviceService.create, {
    onSuccess: () => { toast.success('Servicio creado'); onSave() },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  })

  const updateMutation = useMutation(
    (data) => serviceService.update(service._id, data),
    {
      onSuccess: () => { toast.success('Servicio actualizado'); onSave() },
      onError: (err) => toast.error(err.response?.data?.message || 'Error'),
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || formData.basePrice < 0) {
      toast.error('Completa los campos requeridos')
      return
    }

    const data = {
      ...formData,
      estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
      estimatedDays: formData.estimatedDays ? parseInt(formData.estimatedDays) : undefined,
    }

    if (service) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = createMutation.isLoading || updateMutation.isLoading

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-display text-lg font-semibold">
            {service ? 'Editar servicio' : 'Nuevo servicio'}
          </h3>
          <button onClick={onClose} className="btn-ghost p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="measure-label">Nombre del servicio *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Confección vestido de novia"
              className="input-field mt-1"
              required
            />
          </div>

          <div>
            <label className="measure-label">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Detalles del servicio..."
              className="input-field resize-none mt-1"
            />
          </div>

          <div>
            <label className="measure-label">Categoría</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-field mt-1"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="measure-label">Precio base *</label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                  min="0"
                  className="input-field pl-9"
                  required
                />
              </div>
            </div>
            <div>
              <label className="measure-label">Unidad</label>
              <select
                value={formData.priceUnit}
                onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                className="input-field mt-1"
              >
                <option value="unidad">Por unidad</option>
                <option value="hora">Por hora</option>
                <option value="metro">Por metro</option>
                <option value="pieza">Por pieza</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="measure-label">Horas estimadas</label>
              <input
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                min="0"
                placeholder="Opcional"
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="measure-label">Días estimados</label>
              <input
                type="number"
                value={formData.estimatedDays}
                onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                min="0"
                placeholder="Opcional"
                className="input-field mt-1"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>{service ? 'Guardar' : 'Crear servicio'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
