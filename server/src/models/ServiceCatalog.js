import mongoose from 'mongoose'

const serviceCatalogSchema = new mongoose.Schema(
  {
    // Relación
    designer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Datos del servicio
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    category: {
      type: String,
      enum: ['confeccion', 'arreglos', 'diseno', 'consultoria', 'otro'],
      default: 'confeccion',
    },

    // Precios
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    priceUnit: {
      type: String,
      enum: ['unidad', 'hora', 'metro', 'pieza'],
      default: 'unidad',
    },

    // Tiempo estimado
    estimatedHours: {
      type: Number,
      min: 0,
    },
    estimatedDays: {
      type: Number,
      min: 0,
    },

    // Estado
    isActive: {
      type: Boolean,
      default: true,
    },

    // Orden
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

serviceCatalogSchema.index({ designer: 1, isActive: 1 })
serviceCatalogSchema.index({ category: 1 })

export default mongoose.model('ServiceCatalog', serviceCatalogSchema)
