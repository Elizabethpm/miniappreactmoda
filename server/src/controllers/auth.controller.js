import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Genera token JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { name, email, password, studioName } = req.body

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(409).json({ message: 'Este email ya está registrado' })
    }

    const user  = await User.create({ name, email, password, studioName })
    const token = signToken(user._id)

    res.status(201).json({
      message: '¡Cuenta creada exitosamente!',
      token,
      user: user.toPublic(),
    })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const token = signToken(user._id)

    res.json({
      message: `¡Bienvenida, ${user.name}!`,
      token,
      user: user.toPublic(),
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/auth/me
export async function getMe(req, res) {
  res.json(req.user.toPublic())
}

// PUT /api/auth/me
export async function updateProfile(req, res, next) {
  try {
    const { name, studioName, phone, address, website, whatsapp } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, studioName, phone, address, website, whatsapp },
      { new: true, runValidators: true }
    )
    res.json({ message: 'Perfil actualizado', user: user.toPublic() })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/me/logo
export async function uploadLogo(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se recibió ninguna imagen' })

    const logoUrl = `/uploads/${req.file.filename}`
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { logoUrl },
      { new: true }
    )
    res.json({ message: 'Logo actualizado', user: user.toPublic() })
  } catch (err) {
    next(err)
  }
}
