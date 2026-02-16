import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import {
  getOrders,
  getOrdersKanban,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  addPayment,
  getOrderStats,
  getUpcomingOrders,
} from '../controllers/order.controller.js'

const router = Router()

router.use(protect)

// Rutas especiales
router.get('/kanban', getOrdersKanban)
router.get('/upcoming', getUpcomingOrders)
router.get('/stats', getOrderStats)
router.patch('/:id/status', updateOrderStatus)
router.post('/:id/payment', addPayment)

// CRUD
router.route('/')
  .get(getOrders)
  .post(createOrder)

router.route('/:id')
  .get(getOrderById)
  .put(updateOrder)
  .delete(deleteOrder)

export default router
