import mongoose from 'mongoose'

// Sub-esquema para timeline del pedido
const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
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
    quote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quote',
    },
    measure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Measure',
    },

    // Número de pedido
    orderNumber: {
      type: String,
      unique: true,
    },

    // Detalles del pedido
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    garmentType: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },

    // Estado del pedido
    status: {
      type: String,
      enum: [
        'cotizado',
        'confirmado',
        'en_diseno',
        'cortando',
        'confeccionando',
        'prueba',
        'ajustes',
        'terminado',
        'entregado',
        'cancelado',
      ],
      default: 'confirmado',
      index: true,
    },

    // Prioridad
    priority: {
      type: String,
      enum: ['baja', 'normal', 'alta', 'urgente'],
      default: 'normal',
    },

    // Fechas
    startDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    deliveredDate: {
      type: Date,
    },

    // Pagos
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pendiente', 'anticipo', 'pagado'],
      default: 'pendiente',
    },

    // Timeline
    timeline: [timelineEntrySchema],

    // Notas
    notes: {
      type: String,
      default: '',
      maxlength: 2000,
    },

    // Fotos del progreso
    progressPhotos: [
      {
        url: String,
        caption: String,
        stage: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Generar número de pedido antes de guardar
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const year = new Date().getFullYear()
    const count = await mongoose.model('Order').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1),
      },
    })
    this.orderNumber = `PED-${year}-${String(count + 1).padStart(4, '0')}`
  }
  
  // Actualizar estado de pago
  if (this.paidAmount >= this.totalAmount && this.totalAmount > 0) {
    this.paymentStatus = 'pagado'
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'anticipo'
  }
  
  next()
})

// Agregar entrada al timeline cuando cambia el estado
orderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      date: new Date(),
    })
  }
  next()
})

orderSchema.index({ designer: 1, status: 1 })
orderSchema.index({ dueDate: 1 })

export default mongoose.model('Order', orderSchema)
