import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link, useNavigate } from 'react-router-dom'
import { quoteService } from '../services/quoteService'
import { clientService } from '../services/clientService'
import { serviceService } from '../services/serviceCatalogService'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { FileText, Plus, Search, ChevronRight, Send, Check, X, Trash2, Package } from 'lucide-react'

const STATUS_CONFIG = {
  borrador: { label: 'Borrador', color: 'bg-gray-100 text-gray-700', icon: FileText },
  enviada: { label: 'Enviada', color: 'bg-blue-100 text-blue-700', icon: Send },
  aceptada: { label: 'Aceptada', color: 'bg-green-100 text-green-700', icon: Check },
  rechazada: { label: 'Rechazada', color: 'bg-red-100 text-red-700', icon: X },
  expirada: { label: 'Expirada', color: 'bg-yellow-100 text-yellow-700', icon: FileText },
}

export default function QuotesPage() {
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('')
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery(
    ['quotes', filter],
    () => quoteService.getAll({ status: filter || undefined }),
    { staleTime: 30_000 }
  )

  const { data: statsData } = useQuery(
    ['quotes-stats'],
    () => quoteService.getStats(),
    { staleTime: 60_000 }
  )

  const quotes = data?.quotes || []
  const stats = statsData || {}

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl tablet:text-3xl font-bold text-gray-900">
          <FileText className="w-7 h-7 inline-block mr-2 text-primary-500" />
          Cotizaciones
        </h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-5 h-5" />
          <span className="hidden xs:inline">Nueva</span>
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3">
        <StatCard label="Total" value={stats.total || 0} color="bg-gray-500" />
        <StatCard label="Pendientes" value={stats.pending || 0} color="bg-blue-500" />
        <StatCard label="Aceptadas" value={stats.accepted || 0} color="bg-green-500" />
        <StatCard label="Este mes" value={stats.thisMonth || 0} color="bg-primary-500" />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <FilterChip active={!filter} onClick={() => setFilter('')}>Todas</FilterChip>
        <FilterChip active={filter === 'borrador'} onClick={() => setFilter('borrador')}>Borradores</FilterChip>
        <FilterChip active={filter === 'enviada'} onClick={() => setFilter('enviada')}>Enviadas</FilterChip>
        <FilterChip active={filter === 'aceptada'} onClick={() => setFilter('aceptada')}>Aceptadas</FilterChip>
        <FilterChip active={filter === 'rechazada'} onClick={() => setFilter('rechazada')}>Rechazadas</FilterChip>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse h-24" />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="card text-center py-16">
          <FileText className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-lg">No hay cotizaciones</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mx-auto mt-5">
            <Plus className="w-4 h-4" /> Crear cotización
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((quote) => (
            <QuoteCard key={quote._id} quote={quote} />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <NewQuoteModal
          onClose={() => setShowModal(false)}
          onSave={() => { qc.invalidateQueries('quotes'); setShowModal(false) }}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="card flex items-center gap-3">
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center text-white', color)}>
        <FileText className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
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

function QuoteCard({ quote }) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const statusConfig = STATUS_CONFIG[quote.status]
  const StatusIcon = statusConfig.icon

  const convertMutation = useMutation(() => quoteService.convertToOrder(quote._id), {
    onSuccess: () => {
      toast.success('Pedido creado desde cotización')
      qc.invalidateQueries('quotes')
      navigate('/orders')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  })

  const updateStatusMutation = useMutation(
    (status) => quoteService.updateStatus(quote._id, status),
    {
      onSuccess: () => {
        toast.success('Estado actualizado')
        qc.invalidateQueries('quotes')
      },
    }
  )

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm text-gray-500">{quote.quoteNumber}</span>
            <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1', statusConfig.color)}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </span>
          </div>
          <p className="font-semibold text-gray-900 truncate">{quote.client?.name}</p>
          <p className="text-sm text-gray-500">{quote.garmentType || 'Sin especificar'}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-lg text-gray-900">${quote.total?.toLocaleString()}</p>
          <p className="text-xs text-gray-400">{format(new Date(quote.createdAt), 'd MMM yy', { locale: es })}</p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2 mt-3 pt-3 border-t">
        {quote.status === 'borrador' && (
          <>
            <button
              onClick={() => updateStatusMutation.mutate('enviada')}
              className="btn-secondary text-sm flex-1"
            >
              <Send className="w-4 h-4" /> Enviar
            </button>
          </>
        )}
        {quote.status === 'enviada' && (
          <>
            <button
              onClick={() => updateStatusMutation.mutate('aceptada')}
              className="btn-primary text-sm flex-1"
            >
              <Check className="w-4 h-4" /> Aceptar
            </button>
            <button
              onClick={() => updateStatusMutation.mutate('rechazada')}
              className="btn-ghost text-red-500 text-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
        {quote.status === 'aceptada' && (
          <button
            onClick={() => convertMutation.mutate()}
            disabled={convertMutation.isLoading}
            className="btn-primary text-sm flex-1"
          >
            <Package className="w-4 h-4" /> Crear pedido
          </button>
        )}
      </div>
    </div>
  )
}

function NewQuoteModal({ onClose, onSave }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    client: '',
    garmentType: '',
    description: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    discount: 0,
    discountType: 'fijo',
    estimatedDays: 14,
    validUntil: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    notes: '',
  })

  const { data: clientsData } = useQuery(['clients-list'], () => clientService.getAll({ limit: 100 }))
  const { data: servicesData } = useQuery(['services'], () => serviceService.getAll())

  const clients = clientsData?.clients || []
  const services = servicesData?.services || []

  const createMutation = useMutation(quoteService.create, {
    onSuccess: () => { toast.success('Cotización creada'); onSave() },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  })

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }],
    })
  }

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index),
      })
    }
  }

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    setFormData({ ...formData, items: newItems })
  }

  const addService = (service) => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: service.name, quantity: 1, unitPrice: service.basePrice }],
    })
  }

  const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const discount = formData.discountType === 'porcentaje' ? subtotal * (formData.discount / 100) : formData.discount
  const total = subtotal - discount

  const handleSubmit = () => {
    if (!formData.client) {
      toast.error('Selecciona un cliente')
      return
    }
    if (formData.items.every(i => !i.description)) {
      toast.error('Agrega al menos un servicio')
      return
    }

    createMutation.mutate(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="font-display text-lg font-semibold">Nueva Cotización</h3>
          <button onClick={onClose} className="btn-ghost p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Cliente y tipo */}
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
            <div>
              <label className="measure-label">Cliente *</label>
              <select
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="input-field mt-1"
              >
                <option value="">Seleccionar...</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="measure-label">Tipo de prenda</label>
              <input
                type="text"
                value={formData.garmentType}
                onChange={(e) => setFormData({ ...formData, garmentType: e.target.value })}
                placeholder="Ej: Vestido de novia"
                className="input-field mt-1"
              />
            </div>
          </div>

          {/* Servicios rápidos */}
          {services.length > 0 && (
            <div>
              <label className="measure-label mb-2 block">Agregar servicio rápido</label>
              <div className="flex flex-wrap gap-2">
                {services.slice(0, 6).map((s) => (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => addService(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 hover:bg-primary-100"
                  >
                    + {s.name} (${s.basePrice})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          <div>
            <label className="measure-label mb-2 block">Servicios / Conceptos</label>
            <div className="space-y-2">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    placeholder="Descripción"
                    className="input-field flex-1"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                    min="1"
                    className="input-field w-16 text-center"
                  />
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                    min="0"
                    placeholder="Precio"
                    className="input-field w-24"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="btn-ghost text-red-400 p-2"
                    disabled={formData.items.length === 1}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addItem} className="btn-ghost text-sm mt-2">
              <Plus className="w-4 h-4" /> Agregar línea
            </button>
          </div>

          {/* Descuento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="measure-label">Descuento</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  min="0"
                  className="input-field flex-1"
                />
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="input-field w-24"
                >
                  <option value="fijo">$</option>
                  <option value="porcentaje">%</option>
                </select>
              </div>
            </div>
            <div>
              <label className="measure-label">Días estimados</label>
              <input
                type="number"
                value={formData.estimatedDays}
                onChange={(e) => setFormData({ ...formData, estimatedDays: parseInt(e.target.value) || 14 })}
                min="1"
                className="input-field mt-1"
              />
            </div>
          </div>

          {/* Totales */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Descuento</span>
                <span>-${discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="measure-label">Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Condiciones, observaciones..."
              className="input-field resize-none mt-1"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 p-4 border-t sticky bottom-0 bg-white">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isLoading}
            className="btn-primary flex-1"
          >
            {createMutation.isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Crear cotización</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
