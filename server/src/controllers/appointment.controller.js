import Appointment from '../models/Appointment.js'
import Client from '../models/Client.js'

// Obtener todas las citas del usuario
export const getAppointments = async (req, res, next) => {
  try {
    const { startDate, endDate, status, clientId } = req.query
    const filter = { designer: req.user._id }

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    if (status) {
      filter.status = status
    }

    if (clientId) {
      filter.client = clientId
    }

    const appointments = await Appointment.find(filter)
      .populate('client', 'name phone email')
      .sort({ date: 1 })
      .lean()

    res.json({ appointments })
  } catch (err) {
    next(err)
  }
}

// Obtener una cita por ID
export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      designer: req.user._id,
    })
      .populate('client', 'name phone email')
      .lean()

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' })
    }

    res.json(appointment)
  } catch (err) {
    next(err)
  }
}

// Crear cita
export const createAppointment = async (req, res, next) => {
  try {
    const { client: clientId, title, type, date, duration, notes, reminders } = req.body

    // Verificar que el cliente existe y pertenece al usuario
    const client = await Client.findOne({
      _id: clientId,
      designer: req.user._id,
      isArchived: false,
    })

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }

    const appointment = await Appointment.create({
      client: clientId,
      designer: req.user._id,
      title,
      type,
      date: new Date(date),
      duration,
      notes,
      reminders,
    })

    const populated = await Appointment.findById(appointment._id)
      .populate('client', 'name phone email')
      .lean()

    res.status(201).json(populated)
  } catch (err) {
    next(err)
  }
}

// Actualizar cita
export const updateAppointment = async (req, res, next) => {
  try {
    const { title, type, date, duration, status, notes, reminders } = req.body

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, designer: req.user._id },
      {
        title,
        type,
        date: date ? new Date(date) : undefined,
        duration,
        status,
        notes,
        reminders,
      },
      { new: true, runValidators: true }
    )
      .populate('client', 'name phone email')
      .lean()

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' })
    }

    res.json(appointment)
  } catch (err) {
    next(err)
  }
}

// Eliminar cita
export const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      designer: req.user._id,
    })

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' })
    }

    res.json({ message: 'Cita eliminada' })
  } catch (err) {
    next(err)
  }
}

// Obtener citas próximas (dashboard)
export const getUpcomingAppointments = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5

    const appointments = await Appointment.find({
      designer: req.user._id,
      date: { $gte: new Date() },
      status: { $in: ['pendiente', 'confirmada'] },
    })
      .populate('client', 'name phone')
      .sort({ date: 1 })
      .limit(limit)
      .lean()

    res.json({ appointments })
  } catch (err) {
    next(err)
  }
}

// Estadísticas de citas
export const getAppointmentStats = async (req, res, next) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const [total, thisMonth, pending, today] = await Promise.all([
      Appointment.countDocuments({ designer: req.user._id }),
      Appointment.countDocuments({
        designer: req.user._id,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      }),
      Appointment.countDocuments({
        designer: req.user._id,
        status: 'pendiente',
        date: { $gte: now },
      }),
      Appointment.countDocuments({
        designer: req.user._id,
        date: {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lt: new Date(now.setHours(23, 59, 59, 999)),
        },
      }),
    ])

    res.json({ total, thisMonth, pending, today })
  } catch (err) {
    next(err)
  }
}
