import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import {
  getGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getCategories,
  getPublicGallery,
} from '../controllers/gallery.controller.js'

const router = Router()

// Ruta pública para portafolio
router.get('/public', getPublicGallery)

// Rutas protegidas
router.use(protect)

router.get('/categories', getCategories)

router.route('/')
  .get(getGalleryItems)
  .post(createGalleryItem)

router.route('/:id')
  .get(getGalleryItemById)
  .put(updateGalleryItem)
  .delete(deleteGalleryItem)

export default router
