import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'
import { connectDB } from './config/database.js'

// Rutas
import authRoutes        from './routes/auth.routes.js'
import clientRoutes      from './routes/client.routes.js'
import measureRoutes     from './routes/measure.routes.js'
import appointmentRoutes from './routes/appointment.routes.js'
import quoteRoutes       from './routes/quote.routes.js'
import orderRoutes       from './routes/order.routes.js'
import templateRoutes    from './routes/template.routes.js'
import galleryRoutes     from './routes/gallery.routes.js'
import serviceRoutes     from './routes/service.routes.js'

// Middleware de errores
import { errorHandler, notFound } from './middleware/errorHandler.js'

const app  = express()
const PORT = process.env.PORT || 4000

// ── Seguridad ─────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://*.vercel.app'
    : process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes, intenta más tarde.' },
})
app.use('/api/', limiter)

// Rate limiting estricto para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Demasiados intentos de autenticación.' },
})
app.use('/api/auth/login',    authLimiter)
app.use('/api/auth/register', authLimiter)

// ── Parsers y utilidades ──────────────────────────────
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// ── Archivos estáticos (fotos) ────────────────────────
app.use('/uploads', express.static('uploads'))

// ── Rutas de la API ───────────────────────────────────
app.use('/api/auth',         authRoutes)
app.use('/api/clients',      clientRoutes)
app.use('/api/clients',      measureRoutes)  // /api/clients/:id/measures
app.use('/api',              measureRoutes)  // /api/measures/recent
app.use('/api/appointments', appointmentRoutes)
app.use('/api/quotes',       quoteRoutes)
app.use('/api/orders',       orderRoutes)
app.use('/api/templates',    templateRoutes)
app.use('/api/gallery',      galleryRoutes)
app.use('/api/services',     serviceRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Manejo de errores ─────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ── Arrancar servidor ─────────────────────────────────
const start = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`\n🌸 ModaMedidas API corriendo en http://localhost:${PORT}`)
    console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`)
    console.log(`   DB:      ${process.env.MONGODB_URI?.split('@')[1] || 'localhost'}\n`)
  })
}

start().catch(console.error)

export default app
