import Measure from '../models/Measure.js'
import Client  from '../models/Client.js'

// GET /api/measures/recent?limit=5
export async function getRecentMeasures(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 5, 20)

    const measures = await Measure.find({ designer: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('client', 'name gender')
      .select('label fitType suggestedSize createdAt client')

    res.json({ measures })
  } catch (err) {
    next(err)
  }
}

// Verifica que la clienta pertenece al diseñador
async function verifyClientOwnership(clientId, designerId) {
  const client = await Client.findOne({ _id: clientId, designer: designerId, isActive: true })
  if (!client) throw Object.assign(new Error('Clienta no encontrada'), { status: 404 })
  return client
}

// GET /api/clients/:clientId/measures
export async function getMeasures(req, res, next) {
  try {
    await verifyClientOwnership(req.params.clientId, req.user._id)

    const measures = await Measure.find({ client: req.params.clientId })
      .sort({ createdAt: -1 })

    res.json({ measures, total: measures.length })
  } catch (err) {
    next(err)
  }
}

// GET /api/clients/:clientId/measures/latest
export async function getLatestMeasure(req, res, next) {
  try {
    await verifyClientOwnership(req.params.clientId, req.user._id)

    const measure = await Measure.findOne({ client: req.params.clientId })
      .sort({ createdAt: -1 })

    res.json({ measure: measure || null })
  } catch (err) {
    next(err)
  }
}

// GET /api/clients/:clientId/measures/:id
export async function getMeasure(req, res, next) {
  try {
    await verifyClientOwnership(req.params.clientId, req.user._id)

    const measure = await Measure.findOne({
      _id:    req.params.id,
      client: req.params.clientId,
    })
    if (!measure) return res.status(404).json({ message: 'Medición no encontrada' })

    res.json({ measure })
  } catch (err) {
    next(err)
  }
}

// POST /api/clients/:clientId/measures
export async function createMeasure(req, res, next) {
  try {
    await verifyClientOwnership(req.params.clientId, req.user._id)

    const {
      upper, lower, fitType, fabricType,
      technicalNotes, referencePhotoUrl, label
    } = req.body

    const measure = await Measure.create({
      client:   req.params.clientId,
      designer: req.user._id,
      upper,
      lower,
      fitType,
      fabricType,
      technicalNotes,
      referencePhotoUrl,
      label,
    })

    res.status(201).json({
      message: 'Medidas guardadas exitosamente',
      measure,
    })
  } catch (err) {
    next(err)
  }
}

// PUT /api/clients/:clientId/measures/:id
export async function updateMeasure(req, res, next) {
  try {
    await verifyClientOwnership(req.params.clientId, req.user._id)

    const existing = await Measure.findOne({
      _id: req.params.id, client: req.params.clientId,
    })
    if (!existing) return res.status(404).json({ message: 'Medición no encontrada' })

    // Construir change log automático
    const changelog = []
    const fieldsToTrack = ['fitType', 'fabricType', 'label']
    for (const field of fieldsToTrack) {
      if (req.body[field] !== undefined && req.body[field] !== existing[field]) {
        changelog.push({
          field,
          oldValue: existing[field],
          newValue: req.body[field],
          date: new Date(),
        })
      }
    }

    Object.assign(existing, req.body)
    if (changelog.length) existing.changeLog.push(...changelog)
    await existing.save()

    res.json({ message: 'Medidas actualizadas', measure: existing })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/clients/:clientId/measures/:id
export async function deleteMeasure(req, res, next) {
  try {
    await verifyClientOwnership(req.params.clientId, req.user._id)

    const measure = await Measure.findOneAndDelete({
      _id:    req.params.id,
      client: req.params.clientId,
    })
    if (!measure) return res.status(404).json({ message: 'Medición no encontrada' })

    res.json({ message: 'Medición eliminada' })
  } catch (err) {
    next(err)
  }
}
