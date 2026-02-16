import { validationResult } from 'express-validator'

export function validateRequest(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors:  errors.array().map((e) => ({ field: e.path, message: e.msg })),
    })
  }
  next()
}
