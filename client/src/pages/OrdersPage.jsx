import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { orderService } from '../services/orderService'
import { clientService } from '../services/clientService'
import { format, differenceInDays, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { Package, Plus, GripVertical, Clock, AlertTriangle, Check, X, DollarSign, ChevronRight } from 'lucide-react'

const COLUMNS = [
  { id: 'confirmado', label: 'Confirmado', color: 'bg-blue-500' },
  { id: 'en_diseno', label: 'En diseño', color: 'bg-purple-500' },
  { id: 'cortando', label: 'Cortando', color: 'bg-pink-500' },
  { id: 'confeccionando', label: 'Confeccionando', color: 'bg-orange-500' },
  { id: 'prueba', label: 'Prueba', color: 'bg-amber-500' },
  { id: 'ajustes', label: 'Ajustes', color: 'bg-yellow-500' },
  { id: 'terminado', label: 'Terminado', color: 'bg-green-500' },
]

const PRIORITY_COLORS = {
  baja: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-600',
  alta: 'bg-orange-100 text-orange-600',
  urgente: 'bg-red-100 text-red-600',
}

export default function OrdersPage() {
  const [showModal, setShowModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [draggedOrder, setDraggedOrder] = useState(null)
  const qc = useQueryClient()

  const { data: kanbanData, isLoading } = useQuery(
    ['orders-kanban'],
    () => orderService.getKanban(),
    { staleTime: 30_000 }
  )

  const { data: statsData } = useQuery(
    ['orders-stats'],
    () => orderService.getStats(),
    { staleTime: 60_000 }
  )

  const updateStatusMutation = useMutation(
    ({ id, status }) => orderService.updateStatus(id, status),
    {
      onSuccess: () => {
        qc.invalidateQueries('orders-kanban')
        qc.invalidateQueries('orders-stats')
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Error al mover'),
    }
  )

  const kanban = kanbanData?.kanban || {}
  const stats = statsData || {}

  const handleDragStart = (e, order) => {
    setDraggedOrder(order)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, status) => {
    e.preventDefault()
    if (draggedOrder && draggedOrder.status !== status) {
      updateStatusMutation.mutate({ id: draggedOrder._id, status })
    }
    setDraggedOrder(null)
  }

  const handleOrderClick = (order) => {
    setSelectedOrder(order)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto px-4">
        <h1 className="font-display text-2xl tablet:text-3xl font-bold text-gray-900">
          <Package className="w-7 h-7 inline-block mr-2 text-primary-500" />
          Pedidos
        </h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-5 h-5" />
          <span className="hidden xs:inline">Nuevo</span>
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 tablet:grid-cols-5 gap-3 max-w-7xl mx-auto px-4">
        <StatCard label="Activos" value={stats.active || 0} icon={Package} color="bg-primary-500" />
        <StatCard label="Esta semana" value={stats.dueThisWeek || 0} icon={Clock} color="bg-amber-500" />
        <StatCard label="Atrasados" value={stats.overdue || 0} icon={AlertTriangle} color="bg-red-500" />
        <StatCard label="Completados" value={stats.completedThisMonth || 0} icon={Check} color="bg-green-500" />
        <StatCard
          label="Por cobrar"
          value={`$${(stats.pendingPayments || 0).toLocaleString()}`}
          icon={DollarSign}
          color="bg-blue-500"
        />
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 px-4 min-w-max">
          {COLUMNS.map((column) => (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              className={clsx(
                'w-72 flex-shrink-0 bg-gray-50 rounded-xl p-3 min-h-[400px]',
                draggedOrder && draggedOrder.status !== column.id && 'ring-2 ring-primary-300 ring-dashed'
              )}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={clsx('w-3 h-3 rounded-full', column.color)} />
                <h3 className="font-semibold text-gray-700">{column.label}</h3>
                <span className="ml-auto bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {kanban[column.id]?.length || 0}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {isLoading ? (
                  <>
                    <div className="bg-white rounded-lg p-3 h-24 animate-pulse" />
                    <div className="bg-white rounded-lg p-3 h-24 animate-pulse" />
                  </>
                ) : (
                  kanban[column.id]?.map((order) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      onDragStart={(e) => handleDragStart(e, order)}
                      onClick={() => handleOrderClick(order)}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal nuevo pedido */}
      {showModal && (
        <NewOrderModal
          onClose={() => setShowModal(false)}
          onSave={() => { qc.invalidateQueries('orders-kanban'); qc.invalidateQueries('orders-stats'); setShowModal(false) }}
        />
      )}

      {/* Detalle de pedido */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={() => { qc.invalidateQueries('orders-kanban'); qc.invalidateQueries('orders-stats'); setSelectedOrder(null) }}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="card flex items-center gap-3">
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center text-white', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
}

function OrderCard({ order, onDragStart, onClick }) {
  const daysLeft = differenceInDays(new Date(order.dueDate), new Date())
  const isOverdue = isPast(new Date(order.dueDate))
  const isUrgent = daysLeft <= 3 && !isOverdue

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={clsx(
        'bg-white rounded-lg p-3 shadow-sm border cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow',
        isOverdue && 'border-red-300 bg-red-50/50',
        isUrgent && !isOverdue && 'border-amber-300 bg-amber-50/50'
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{order.title}</p>
          <p className="text-xs text-gray-500 truncate">{order.client?.name}</p>
        </div>
        <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', PRIORITY_COLORS[order.priority])}>
          {order.priority}
        </span>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t">
        <div className="flex items-center gap-1 text-xs">
          {isOverdue ? (
            <span className="text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {Math.abs(daysLeft)}d atrasado
            </span>
          ) : (
            <span className={clsx(isUrgent ? 'text-amber-600' : 'text-gray-500')}>
              <Clock className="w-3 h-3 inline mr-1" />
              {daysLeft}d restantes
            </span>
          )}
        </div>
        {order.paymentStatus !== 'pagado' && (
          <span className="text-xs text-gray-400">
            ${(order.totalAmount - order.paidAmount).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  )
}

function NewOrderModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    client: '',
    title: '',
    garmentType: '',
    description: '',
    priority: 'normal',
    dueDate: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    totalAmount: 0,
    notes: '',
  })

  const { data: clientsData } = useQuery(['clients-list'], () => clientService.getAll({ limit: 100 }))
  const clients = clientsData?.clients || []

  const createMutation = useMutation(orderService.create, {
    onSuccess: () => { toast.success('Pedido creado'); onSave() },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.client || !formData.title) {
      toast.error('Completa los campos requeridos')
      return
    }
    createMutation.mutate(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-display text-lg font-semibold">Nuevo Pedido</h3>
          <button onClick={onClose} className="btn-ghost p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="measure-label">Cliente *</label>
            <select
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              className="input-field mt-1"
              required
            >
              <option value="">Seleccionar...</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="measure-label">Título del pedido *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Vestido de novia - María"
              className="input-field mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="measure-label">Tipo de prenda</label>
              <input
                type="text"
                value={formData.garmentType}
                onChange={(e) => setFormData({ ...formData, garmentType: e.target.value })}
                placeholder="Vestido, blusa..."
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="measure-label">Prioridad</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input-field mt-1"
              >
                <option value="baja">Baja</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="measure-label">Fecha de entrega</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="measure-label">Monto total</label>
              <input
                type="number"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                min="0"
                className="input-field mt-1"
              />
            </div>
          </div>

          <div>
            <label className="measure-label">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Detalles del pedido..."
              className="input-field resize-none mt-1"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={createMutation.isLoading} className="btn-primary flex-1">
              {createMutation.isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Crear pedido'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function OrderDetailModal({ order, onClose, onUpdate }) {
  const [paidAmount, setPaidAmount] = useState('')
  const qc = useQueryClient()

  const addPaymentMutation = useMutation(
    (amount) => orderService.addPayment(order._id, amount),
    {
      onSuccess: () => {
        toast.success('Pago registrado')
        onUpdate()
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Error'),
    }
  )

  const markDeliveredMutation = useMutation(
    () => orderService.updateStatus(order._id, 'entregado'),
    {
      onSuccess: () => {
        toast.success('Pedido entregado')
        onUpdate()
      },
    }
  )

  const handleAddPayment = () => {
    const amount = parseFloat(paidAmount)
    if (amount > 0) {
      addPaymentMutation.mutate(amount)
    }
  }

  const remaining = order.totalAmount - order.paidAmount

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <p className="text-sm text-gray-500 font-mono">{order.orderNumber}</p>
            <h3 className="font-display text-lg font-semibold">{order.title}</h3>
          </div>
          <button onClick={onClose} className="btn-ghost p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Cliente</p>
              <p className="font-medium">{order.client?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fecha de entrega</p>
              <p className="font-medium">{format(new Date(order.dueDate), "d 'de' MMMM", { locale: es })}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Prioridad</p>
              <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', PRIORITY_COLORS[order.priority])}>
                {order.priority}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Estado</p>
              <p className="font-medium capitalize">{order.status.replace('_', ' ')}</p>
            </div>
          </div>

          {order.description && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Descripción</p>
              <p className="text-sm text-gray-700">{order.description}</p>
            </div>
          )}

          {/* Pagos */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold mb-3">Pagos</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-bold">${order.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Pagado</span>
                <span>${order.paidAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Restante</span>
                <span className={remaining > 0 ? 'text-red-600' : 'text-green-600'}>
                  ${remaining.toLocaleString()}
                </span>
              </div>
            </div>

            {remaining > 0 && (
              <div className="flex gap-2 mt-3">
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="Monto"
                  className="input-field flex-1"
                />
                <button
                  onClick={handleAddPayment}
                  disabled={addPaymentMutation.isLoading}
                  className="btn-primary"
                >
                  <DollarSign className="w-4 h-4" />
                  Agregar
                </button>
              </div>
            )}
          </div>

          {/* Timeline */}
          {order.timeline?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Historial</h4>
              <div className="space-y-2">
                {order.timeline.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                    <span className="capitalize">{entry.status.replace('_', ' ')}</span>
                    <span className="text-gray-400 ml-auto">
                      {format(new Date(entry.date), 'd MMM HH:mm', { locale: es })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acciones */}
          {order.status === 'terminado' && (
            <button
              onClick={() => markDeliveredMutation.mutate()}
              disabled={markDeliveredMutation.isLoading}
              className="btn-primary w-full"
            >
              <Check className="w-4 h-4" /> Marcar como entregado
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
