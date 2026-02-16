import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByCategory,
} from '../controllers/service.controller.js'

const router = Router()

router.use(protect)

router.get('/by-category', getServicesByCategory)

router.route('/')
  .get(getServices)
  .post(createService)

router.route('/:id')
  .get(getServiceById)
  .put(updateService)
  .delete(deleteService)

export default router
