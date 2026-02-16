import mongoose from 'mongoose'

const clientSchema = new mongoose.Schema(
  {
    // ── Datos personales ─────────────────────────────
    name: {
      type: String,
      required: [true, 'El nombre del cliente es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    gender: {
      type: String,
      enum: ['femenino', 'masculino', 'otro', ''],
      default: '',
    },
    birthdate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
      maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres'],
    },
    photoUrl: {
      type: String,
      default: '',
    },

    // ── Propietaria (diseñadora) ─────────────────────
    designer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ── Estado ───────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// ── Virtual: última medición (se popula externamente) ──
clientSchema.virtual('latestMeasure', {
  ref:          'Measure',
  localField:   '_id',
  foreignField: 'client',
  justOne:      true,
  options:      { sort: { createdAt: -1 } },
})

// ── Índices compuestos ────────────────────────────────
clientSchema.index({ designer: 1, name:      1 })
clientSchema.index({ designer: 1, createdAt: -1 })

export default mongoose.model('Client', clientSchema)
