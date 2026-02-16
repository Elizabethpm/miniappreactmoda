// 404 Not Found
export function notFound(req, res, next) {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`)
  res.status(404)
  next(error)
}

// Manejador global de errores
export function errorHandler(err, req, res, _next) {
  // Errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({
      message: 'Error de validación',
      errors:  messages,
    })
  }

  // Duplicate key (email único, etc.)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({
      message: `El campo '${field}' ya está en uso`,
    })
  }

  // JWT inválido
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token inválido' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expirado' })
  }

  // CastError (id inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'ID inválido' })
  }

  const status  = res.statusCode !== 200 ? res.statusCode : 500
  const message = err.message || 'Error interno del servidor'

  console.error(`[${new Date().toISOString()}] ${status} - ${message}`)
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack)
  }

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
}
