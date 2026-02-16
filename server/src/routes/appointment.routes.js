import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getUpcomingAppointments,
  getAppointmentStats,
} from '../controllers/appointment.controller.js'

const router = Router()

// Todas las rutas requieren autenticación
router.use(protect)

// Rutas especiales
router.get('/upcoming', getUpcomingAppointments)
router.get('/stats', getAppointmentStats)

// CRUD
router.route('/')
  .get(getAppointments)
  .post(createAppointment)

router.route('/:id')
  .get(getAppointmentById)
  .put(updateAppointment)
  .delete(deleteAppointment)

export default router
