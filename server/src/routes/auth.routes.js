import { Router } from 'express'
import { body }   from 'express-validator'
import multer     from 'multer'
import path       from 'path'
import { protect } from '../middleware/auth.middleware.js'
import {
  register,
  login,
  getMe,
  updateProfile,
  uploadLogo,
} from '../controllers/auth.controller.js'
import { validateRequest } from '../middleware/validate.middleware.js'

const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename:    (_req, file, cb) => cb(null, `logo-${Date.now()}${path.extname(file.originalname)}`),
})
const logoUpload = multer({
  storage: logoStorage,
  limits:  { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /jpeg|jpg|png|webp/.test(file.mimetype)
    ok ? cb(null, true) : cb(new Error('Solo imágenes JPG/PNG/WEBP'))
  },
})

const router = Router()

router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres'),
  ],
  validateRequest,
  register
)

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validateRequest,
  login
)

router.get('/me',         protect, getMe)
router.put('/me',         protect, updateProfile)
router.post('/me/logo',   protect, logoUpload.single('logo'), uploadLogo)

export default router
