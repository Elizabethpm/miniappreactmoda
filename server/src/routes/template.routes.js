import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  initSystemTemplates,
} from '../controllers/template.controller.js'

const router = Router()

router.use(protect)

// Inicializar plantillas del sistema (admin)
router.post('/init-system', initSystemTemplates)

// CRUD
router.route('/')
  .get(getTemplates)
  .post(createTemplate)

router.route('/:id')
  .get(getTemplateById)
  .put(updateTemplate)
  .delete(deleteTemplate)

export default router
