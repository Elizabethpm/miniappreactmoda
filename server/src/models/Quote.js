import mongoose from 'mongoose'

// Sub-esquema para items de la cotización
const quoteItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
)

const quoteSchema = new mongoose.Schema(
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

    // Número de cotización
    quoteNumber: {
      type: String,
      unique: true,
    },

    // Items
    items: [quoteItemSchema],

    // Totales
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountType: {
      type: String,
      enum: ['porcentaje', 'fijo'],
      default: 'fijo',
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Estado
    status: {
      type: String,
      enum: ['borrador', 'enviada', 'aceptada', 'rechazada', 'expirada'],
      default: 'borrador',
    },

    // Fechas
    validUntil: {
      type: Date,
    },

    // Detalles
    garmentType: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 1000,
    },

    // Tiempo estimado
    estimatedDays: {
      type: Number,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
)

// Generar número de cotización antes de guardar
quoteSchema.pre('save', async function (next) {
  if (!this.quoteNumber) {
    const year = new Date().getFullYear()
    const count = await mongoose.model('Quote').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1),
      },
    })
    this.quoteNumber = `COT-${year}-${String(count + 1).padStart(4, '0')}`
  }
  next()
})

// Calcular totales antes de guardar
quoteSchema.pre('save', function (next) {
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0)
  
  if (this.discountType === 'porcentaje') {
    this.total = this.subtotal * (1 - this.discount / 100)
  } else {
    this.total = this.subtotal - this.discount
  }
  
  this.total = Math.max(0, this.total)
  next()
})

quoteSchema.index({ designer: 1, createdAt: -1 })
quoteSchema.index({ status: 1 })

export default mongoose.model('Quote', quoteSchema)
