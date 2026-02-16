import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    // ── Identidad ────────────────────────────────────
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [80, 'El nombre no puede exceder 80 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select: false, // No se retorna por defecto en queries
    },

    // ── Perfil del taller ────────────────────────────
    studioName: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    whatsapp: {
      type: String,
      trim: true,
      default: '',
    },

    // ── Control de acceso ────────────────────────────
    role: {
      type: String,
      enum: ['designer', 'admin'],
      default: 'designer',
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── SaaS (escalabilidad) ─────────────────────────
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    planExpiresAt: {
      type: Date,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt automáticos
    toJSON: {
      transform(doc, ret) {
        delete ret.password
        delete ret.__v
        return ret
      },
    },
  }
)

// ── Hash de contraseña antes de guardar ───────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// ── Método de instancia: verificar contraseña ─────────
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password)
}

// ── Método: datos públicos del usuario ────────────────
userSchema.methods.toPublic = function () {
  return {
    _id:        this._id,
    name:       this.name,
    email:      this.email,
    studioName: this.studioName,
    phone:      this.phone,
    logoUrl:    this.logoUrl,
    address:    this.address,
    website:    this.website,
    whatsapp:   this.whatsapp,
    role:       this.role,
    plan:       this.plan,
  }
}

export default mongoose.model('User', userSchema)
