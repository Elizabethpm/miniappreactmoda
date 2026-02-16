import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import {
  getMeasures,
  getLatestMeasure,
  getMeasure,
  createMeasure,
  updateMeasure,
  deleteMeasure,
  getRecentMeasures,
} from '../controllers/measure.controller.js'

const router = Router()
router.use(protect)

// Ruta global: recientes de todos los clientes
router.get('/measures/recent', getRecentMeasures)

// Base: /api/clients/:clientId/measures
router.get(   '/:clientId/measures',          getMeasures)
router.get(   '/:clientId/measures/latest',   getLatestMeasure)
router.get(   '/:clientId/measures/:id',      getMeasure)
router.post(  '/:clientId/measures',          createMeasure)
router.put(   '/:clientId/measures/:id',      updateMeasure)
router.delete('/:clientId/measures/:id',      deleteMeasure)

export default router
