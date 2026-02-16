import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { appointmentService } from '../services/appointmentService'
import { clientService } from '../services/clientService'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, User, X, Check, Trash2 } from 'lucide-react'

const TYPE_COLORS = {
  medidas: 'bg-primary-100 text-primary-700 border-primary-200',
  prueba: 'bg-amber-100 text-amber-700 border-amber-200',
  entrega: 'bg-green-100 text-green-700 border-green-200',
  consulta: 'bg-blue-100 text-blue-700 border-blue-200',
  otro: 'bg-gray-100 text-gray-700 border-gray-200',
}

const TYPE_LABELS = {
  medidas: 'Medidas',
  prueba: 'Prueba',
  entrega: 'Entrega',
  consulta: 'Consulta',
  otro: 'Otro',
}

const STATUS_COLORS = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  confirmada: 'bg-green-100 text-green-700',
  completada: 'bg-gray-100 text-gray-500',
  cancelada: 'bg-red-100 text-red-700',
}

export default function AppointmentsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const qc = useQueryClient()

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const { data: appointmentsData, isLoading } = useQuery(
    ['appointments', format(monthStart, 'yyyy-MM'), format(monthEnd, 'yyyy-MM')],
    () => appointmentService.getByDateRange(monthStart.toISOString(), monthEnd.toISOString()),
    { staleTime: 30_000 }
  )

  const { data: clientsData } = useQuery(
    ['clients-list'],
    () => clientService.getAll({ limit: 100 }),
    { staleTime: 60_000 }
  )

  const appointments = appointmentsData?.appointments || []
  const clients = clientsData?.clients || []
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getAppointmentsForDay = (day) => {
    return appointments.filter((apt) => isSameDay(parseISO(apt.date), day))
  }

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const handleDayClick = (day) => {
    setSelectedDate(day)
    setEditingAppointment(null)
    setShowModal(true)
  }

  const handleAppointmentClick = (e, apt) => {
    e.stopPropagation()
    setEditingAppointment(apt)
    setSelectedDate(parseISO(apt.date))
    setShowModal(true)
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl tablet:text-3xl font-bold text-gray-900">
          <Calendar className="w-7 h-7 inline-block mr-2 text-primary-500" />
          Agenda
        </h1>
        <button
          onClick={() => { setSelectedDate(new Date()); setEditingAppointment(null); setShowModal(true) }}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden xs:inline">Nueva cita</span>
        </button>
      </div>

      {/* Navegación del mes */}
      <div className="card flex items-center justify-between">
        <button onClick={handlePrevMonth} className="btn-ghost p-2">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-display text-xl font-semibold text-gray-900 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <button onClick={handleNextMonth} className="btn-ghost p-2">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendario */}
      <div className="card p-0 overflow-hidden">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
            <div key={day} className="p-2 text-center text-xs font-semibold text-gray-500 uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Días del calendario */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayAppointments = getAppointmentsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={idx}
                onClick={() => handleDayClick(day)}
                className={clsx(
                  'min-h-[80px] tablet:min-h-[100px] p-1 border-b border-r cursor-pointer transition-colors hover:bg-gray-50',
                  !isCurrentMonth && 'bg-gray-50/50',
                  isToday && 'bg-primary-50/50'
                )}
              >
                <div className={clsx(
                  'text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full',
                  isToday && 'bg-primary-500 text-white',
                  !isCurrentMonth && 'text-gray-400'
                )}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map((apt) => (
                    <div
                      key={apt._id}
                      onClick={(e) => handleAppointmentClick(e, apt)}
                      className={clsx(
                        'text-xs p-1 rounded truncate border cursor-pointer hover:opacity-80',
                        TYPE_COLORS[apt.type]
                      )}
                    >
                      <span className="font-medium">{format(parseISO(apt.date), 'HH:mm')}</span>
                      {' '}{apt.client?.name?.split(' ')[0]}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayAppointments.length - 2} más
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 justify-center">
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <div key={key} className={clsx('text-xs px-2 py-1 rounded-full border', TYPE_COLORS[key])}>
            {label}
          </div>
        ))}
      </div>

      {/* Modal de cita */}
      {showModal && (
        <AppointmentModal
          date={selectedDate}
          appointment={editingAppointment}
          clients={clients}
          onClose={() => { setShowModal(false); setEditingAppointment(null) }}
          onSave={() => { qc.invalidateQueries('appointments'); setShowModal(false); setEditingAppointment(null) }}
        />
      )}
    </div>
  )
}

// Modal de cita
function AppointmentModal({ date, appointment, clients, onClose, onSave }) {
  const [formData, setFormData] = useState({
    client: appointment?.client?._id || '',
    title: appointment?.title || '',
    type: appointment?.type || 'medidas',
    date: appointment?.date ? format(parseISO(appointment.date), "yyyy-MM-dd'T'HH:mm") : format(date, "yyyy-MM-dd'T'10:00"),
    duration: appointment?.duration || 60,
    status: appointment?.status || 'pendiente',
    notes: appointment?.notes || '',
  })

  const createMutation = useMutation(appointmentService.create, {
    onSuccess: () => { toast.success('Cita creada'); onSave() },
    onError: (err) => toast.error(err.response?.data?.message || 'Error al crear'),
  })

  const updateMutation = useMutation(
    (data) => appointmentService.update(appointment._id, data),
    {
      onSuccess: () => { toast.success('Cita actualizada'); onSave() },
      onError: (err) => toast.error(err.response?.data?.message || 'Error al actualizar'),
    }
  )

  const deleteMutation = useMutation(() => appointmentService.delete(appointment._id), {
    onSuccess: () => { toast.success('Cita eliminada'); onSave() },
    onError: (err) => toast.error(err.response?.data?.message || 'Error al eliminar'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.client || !formData.title) {
      toast.error('Completa los campos requeridos')
      return
    }

    const data = { ...formData, date: new Date(formData.date).toISOString() }
    
    if (appointment) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDelete = () => {
    if (window.confirm('¿Eliminar esta cita?')) {
      deleteMutation.mutate()
    }
  }

  const isLoading = createMutation.isLoading || updateMutation.isLoading

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-display text-lg font-semibold">
            {appointment ? 'Editar cita' : 'Nueva cita'}
          </h3>
          <button onClick={onClose} className="btn-ghost p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Cliente */}
          <div>
            <label className="measure-label">Cliente *</label>
            <select
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              className="input-field mt-1"
              required
            >
              <option value="">Seleccionar cliente...</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Título */}
          <div>
            <label className="measure-label">Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Toma de medidas vestido"
              className="input-field mt-1"
              required
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="measure-label">Tipo de cita</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <label
                  key={key}
                  className={clsx(
                    'flex items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition-all text-sm',
                    formData.type === key
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <input
                    type="radio"
                    name="type"
                    value={key}
                    checked={formData.type === key}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="measure-label">Fecha y hora</label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="measure-label">Duración (min)</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="input-field mt-1"
              >
                <option value={30}>30 min</option>
                <option value={60}>1 hora</option>
                <option value={90}>1.5 horas</option>
                <option value={120}>2 horas</option>
                <option value={180}>3 horas</option>
              </select>
            </div>
          </div>

          {/* Estado (solo si es edición) */}
          {appointment && (
            <div>
              <label className="measure-label">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field mt-1"
              >
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="measure-label">Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Detalles adicionales..."
              className="input-field resize-none mt-1"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            {appointment && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isLoading}
                className="btn-ghost text-red-500 hover:bg-red-50 p-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>{appointment ? 'Guardar' : 'Crear cita'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
