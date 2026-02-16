import Client  from '../models/Client.js'
import Measure from '../models/Measure.js'
import path    from 'path'
import fs      from 'fs'

// GET /api/clients
export async function getClients(req, res, next) {
  try {
    const { search = '', page = 1, limit = 20 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const filter = {
      designer: req.user._id,
      isActive: true,
      ...(search && { name: { $regex: search, $options: 'i' } }),
    }

    const [clients, total] = await Promise.all([
      Client.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('latestMeasure'),
      Client.countDocuments(filter),
    ])

    res.json({
      clients,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/clients/:id
export async function getClient(req, res, next) {
  try {
    const client = await Client.findOne({
      _id:      req.params.id,
      designer: req.user._id,
    }).populate('latestMeasure')

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }

    // Contar total de mediciones
    const measuresCount = await Measure.countDocuments({ client: client._id })
    res.json({ ...client.toObject(), measuresCount })
  } catch (err) {
    next(err)
  }
}

// POST /api/clients
export async function createClient(req, res, next) {
  try {
    const { name, phone, email, birthdate, notes } = req.body
    const client = await Client.create({
      name, phone, email, birthdate, notes,
      designer: req.user._id,
    })
    res.status(201).json({ message: 'Cliente registrado exitosamente', client })
  } catch (err) {
    next(err)
  }
}

// PUT /api/clients/:id
export async function updateClient(req, res, next) {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, designer: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado' })
    res.json({ message: 'Cliente actualizado', client })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/clients/:id  (hard delete)
export async function deleteClient(req, res, next) {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      designer: req.user._id,
    })
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado' })
    
    // Eliminar también las medidas asociadas
    await Measure.deleteMany({ client: client._id })
    
    res.json({ message: 'Cliente eliminado correctamente' })
  } catch (err) {
    next(err)
  }
}

// POST /api/clients/:id/photo
export async function uploadPhoto(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se recibió imagen' })

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, designer: req.user._id },
      { photoUrl: `/uploads/${req.file.filename}` },
      { new: true }
    )
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado' })

    res.json({ message: 'Foto actualizada', photoUrl: client.photoUrl })
  } catch (err) {
    next(err)
  }
}
