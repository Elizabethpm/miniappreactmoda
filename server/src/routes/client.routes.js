import { Router } from 'express'
import multer     from 'multer'
import path       from 'path'
import { protect } from '../middleware/auth.middleware.js'
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  uploadPhoto,
} from '../controllers/client.controller.js'

const router = Router()

// Configuración de multer para fotos
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => {
    const ext      = path.extname(file.originalname)
    const filename = `photo-${Date.now()}${ext}`
    cb(null, filename)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/
    const valid   = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase())
    valid ? cb(null, true) : cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP)'))
  },
})

// Todas las rutas requieren autenticación
router.use(protect)

router.get('/',    getClients)
router.get('/:id', getClient)
router.post('/',   createClient)
router.put('/:id', updateClient)
router.delete('/:id', deleteClient)
router.post('/:id/photo', upload.single('photo'), uploadPhoto)

export default router
