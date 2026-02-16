import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import {
  getQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  deleteQuote,
  convertToOrder,
  getQuoteStats,
} from '../controllers/quote.controller.js'

const router = Router()

router.use(protect)

// Rutas especiales
router.get('/stats', getQuoteStats)
router.post('/:id/convert-to-order', convertToOrder)

// CRUD
router.route('/')
  .get(getQuotes)
  .post(createQuote)

router.route('/:id')
  .get(getQuoteById)
  .put(updateQuote)
  .delete(deleteQuote)

export default router
