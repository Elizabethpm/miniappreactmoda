import mongoose from 'mongoose'

const garmentTemplateSchema = new mongoose.Schema(
  {
    // Relación (null = plantilla del sistema)
    designer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Datos de la plantilla
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      enum: ['superior', 'inferior', 'vestido', 'traje', 'accesorio', 'otro'],
      default: 'otro',
    },
    icon: {
      type: String,
      default: '👗',
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },

    // Medidas requeridas
    requiredMeasures: {
      upper: [String], // nombres de campos del schema upper
      lower: [String], // nombres de campos del schema lower
    },

    // Medidas opcionales (se muestran pero no son obligatorias)
    optionalMeasures: {
      upper: [String],
      lower: [String],
    },

    // Configuración por defecto
    defaultFitType: {
      type: String,
      enum: ['ceñido', 'regular', 'holgado'],
      default: 'regular',
    },

    // Tiempo estimado de confección (días)
    estimatedDays: {
      type: Number,
      min: 1,
      default: 7,
    },

    // Precio base sugerido
    basePrice: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Activa
    isActive: {
      type: Boolean,
      default: true,
    },

    // Orden de visualización
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

garmentTemplateSchema.index({ designer: 1, isActive: 1 })
garmentTemplateSchema.index({ category: 1 })

export default mongoose.model('GarmentTemplate', garmentTemplateSchema)
