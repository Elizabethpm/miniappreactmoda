import mongoose from 'mongoose'

// ── Sub-esquema: medidas delanteras ───────────────────
const upperMeasuresSchema = new mongoose.Schema(
  {
    // Contornos
    contornoBusto:      { type: Number, min: 0, max: 200 },
    contornoBajoBusto:  { type: Number, min: 0, max: 200 },
    contornoCintura:    { type: Number, min: 0, max: 200 },
    contornoCadera:     { type: Number, min: 0, max: 200 },
    contornoSobreBusto: { type: Number, min: 0, max: 200 },
    contornoCuello:     { type: Number, min: 0, max: 100 },
    // Largos
    largoTalle:         { type: Number, min: 0, max: 100 },
    largoTalleCentro:   { type: Number, min: 0, max: 100 },
    // Anchos y alturas
    anchoBusto:         { type: Number, min: 0, max: 100 },
    alturaBusto:        { type: Number, min: 0, max: 100 },
    alturaCapdera:      { type: Number, min: 0, max: 100 },
    anchoHombro:        { type: Number, min: 0, max: 100 },
    caidaHombro:        { type: Number, min: 0, max: 100 },
    hombros:            { type: Number, min: 0, max: 100 },
  },
  { _id: false }
)

// ── Sub-esquema: medidas de brazo ────────────────────
const armMeasuresSchema = new mongoose.Schema(
  {
    largoBrazo:       { type: Number, min: 0, max: 100 },
    contornoBiceps:   { type: Number, min: 0, max: 100 },
    bajoElBrazo:      { type: Number, min: 0, max: 100 },
    contornoCodo:     { type: Number, min: 0, max: 100 },
    contornoMuneca:   { type: Number, min: 0, max: 100 },
    contornoPuno:     { type: Number, min: 0, max: 100 },
  },
  { _id: false }
)

// ── Sub-esquema: medidas de pantalón o falda ─────────
const pantsMeasuresSchema = new mongoose.Schema(
  {
    contornoCintura:  { type: Number, min: 0, max: 200 },
    alturaCadera:     { type: Number, min: 0, max: 200 },
    contornoCadera:   { type: Number, min: 0, max: 200 },
    alturaAsiento:    { type: Number, min: 0, max: 200 },
    largoPantalon:    { type: Number, min: 0, max: 200 },
    largoFalda:       { type: Number, min: 0, max: 200 },
  },
  { _id: false }
)

// ── Sub-esquema: medidas traseras ───────────────────
const lowerMeasuresSchema = new mongoose.Schema(
  {
    largoTalleTrasero:     { type: Number, min: 0, max: 200 },
    anchoHombrosTrasero:   { type: Number, min: 0, max: 200 },
    largoCentroTrasero:    { type: Number, min: 0, max: 200 },
    reboqueCuelloTrasero:  { type: Number, min: 0, max: 200 },
    largoCaidaTrasero:     { type: Number, min: 0, max: 200 },
    anchoToraxTrasero:     { type: Number, min: 0, max: 200 },
    anchoOmoplatosTrasero: { type: Number, min: 0, max: 200 },
    anchoCinturaTrasero:   { type: Number, min: 0, max: 200 },
  },
  { _id: false }
)

// ── Esquema principal ─────────────────────────────────
const measureSchema = new mongoose.Schema(
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

    // Medidas
    upper: {
      type: upperMeasuresSchema,
      default: {},
    },
    arms: {
      type: armMeasuresSchema,
      default: {},
    },
    pants: {
      type: pantsMeasuresSchema,
      default: {},
    },
    lower: {
      type: lowerMeasuresSchema,
      default: {},
    },

    // Metadatos de la prenda
    fitType: {
      type: String,
      enum: ['ceñido', 'regular', 'holgado'],
      default: 'regular',
    },
    fabricType: {
      type: String,
      trim: true,
      default: '',
    },
    technicalNotes: {
      type: String,
      default: '',
      maxlength: [2000, 'Las notas técnicas no pueden exceder 2000 caracteres'],
    },
    referencePhotoUrl: {
      type: String,
      default: '',
    },

    // Talla sugerida (calculada automáticamente)
    suggestedSize: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Personalizada', ''],
      default: '',
    },

    // Historial de cambios
    changeLog: [
      {
        date:    { type: Date, default: Date.now },
        field:   String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        note:    String,
      },
    ],

    // Etiqueta / nombre de la sesión (ej: "Vestido de boda 2024")
    label: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

// ── Índices ───────────────────────────────────────────
measureSchema.index({ client: 1, createdAt: -1 })
measureSchema.index({ designer: 1, createdAt: -1 })

// ── Método estático: calcular talla sugerida ──────────
measureSchema.statics.calculateSize = function (bustoCm) {
  if (!bustoCm) return ''
  if (bustoCm <= 80)  return 'XS'
  if (bustoCm <= 84)  return 'S'
  if (bustoCm <= 88)  return 'M'
  if (bustoCm <= 96)  return 'L'
  if (bustoCm <= 104) return 'XL'
  if (bustoCm <= 112) return 'XXL'
  return '3XL'
}

// ── Pre-save: calcular talla antes de guardar ─────────
measureSchema.pre('save', function (next) {
  if (this.upper?.contornoBusto) {
    this.suggestedSize = this.constructor.calculateSize(this.upper.contornoBusto)
  }
  next()
})

export default mongoose.model('Measure', measureSchema)
