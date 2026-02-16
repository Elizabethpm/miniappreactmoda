import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema(
  {
    // Relaciones
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    designer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Datos de la cita
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ['medidas', 'prueba', 'entrega', 'consulta', 'otro'],
      default: 'medidas',
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    duration: {
      type: Number, // minutos
      default: 60,
      min: 15,
      max: 480,
    },
    status: {
      type: String,
      enum: ['pendiente', 'confirmada', 'completada', 'cancelada'],
      default: 'pendiente',
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },

    // Recordatorios
    reminders: {
      email24h: { type: Boolean, default: false },
      email2h: { type: Boolean, default: false },
      whatsapp24h: { type: Boolean, default: false },
      whatsapp2h: { type: Boolean, default: false },
    },
    remindersSent: {
      email24h: { type: Boolean, default: false },
      email2h: { type: Boolean, default: false },
      whatsapp24h: { type: Boolean, default: false },
      whatsapp2h: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
)

// Índices compuestos
appointmentSchema.index({ designer: 1, date: 1 })
appointmentSchema.index({ client: 1, date: -1 })

export default mongoose.model('Appointment', appointmentSchema)
