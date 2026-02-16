import Quote from '../models/Quote.js'
import Order from '../models/Order.js'
import Client from '../models/Client.js'

// Obtener todas las cotizaciones
export const getQuotes = async (req, res, next) => {
  try {
    const { status, clientId, page = 1, limit = 20 } = req.query
    const filter = { designer: req.user._id }

    if (status) filter.status = status
    if (clientId) filter.client = clientId

    const skip = (page - 1) * limit

    const [quotes, total] = await Promise.all([
      Quote.find(filter)
        .populate('client', 'name phone email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Quote.countDocuments(filter),
    ])

    res.json({
      quotes,
      pagination: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    next(err)
  }
}

// Obtener cotización por ID
export const getQuoteById = async (req, res, next) => {
  try {
    const quote = await Quote.findOne({
      _id: req.params.id,
      designer: req.user._id,
    })
      .populate('client', 'name phone email')
      .lean()

    if (!quote) {
      return res.status(404).json({ message: 'Cotización no encontrada' })
    }

    res.json(quote)
  } catch (err) {
    next(err)
  }
}

// Crear cotización
export const createQuote = async (req, res, next) => {
  try {
    const {
      client: clientId,
      items,
      discount,
      discountType,
      validUntil,
      garmentType,
      description,
      notes,
      estimatedDays,
    } = req.body

    // Verificar cliente
    const client = await Client.findOne({
      _id: clientId,
      designer: req.user._id,
      isArchived: false,
    })

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }

    // Calcular subtotales de items
    const processedItems = items.map((item) => ({
      ...item,
      subtotal: item.quantity * item.unitPrice,
    }))

    const quote = await Quote.create({
      client: clientId,
      designer: req.user._id,
      items: processedItems,
      discount: discount || 0,
      discountType: discountType || 'fijo',
      validUntil: validUntil ? new Date(validUntil) : undefined,
      garmentType,
      description,
      notes,
      estimatedDays,
    })

    const populated = await Quote.findById(quote._id)
      .populate('client', 'name phone email')
      .lean()

    res.status(201).json(populated)
  } catch (err) {
    next(err)
  }
}

// Actualizar cotización
export const updateQuote = async (req, res, next) => {
  try {
    const {
      items,
      discount,
      discountType,
      status,
      validUntil,
      garmentType,
      description,
      notes,
      estimatedDays,
    } = req.body

    const quote = await Quote.findOne({
      _id: req.params.id,
      designer: req.user._id,
    })

    if (!quote) {
      return res.status(404).json({ message: 'Cotización no encontrada' })
    }

    // Solo permitir editar si está en borrador
    if (quote.status !== 'borrador' && !status) {
      return res.status(400).json({ message: 'Solo se pueden editar cotizaciones en borrador' })
    }

    if (items) {
      quote.items = items.map((item) => ({
        ...item,
        subtotal: item.quantity * item.unitPrice,
      }))
    }

    if (discount !== undefined) quote.discount = discount
    if (discountType) quote.discountType = discountType
    if (status) quote.status = status
    if (validUntil) quote.validUntil = new Date(validUntil)
    if (garmentType !== undefined) quote.garmentType = garmentType
    if (description !== undefined) quote.description = description
    if (notes !== undefined) quote.notes = notes
    if (estimatedDays !== undefined) quote.estimatedDays = estimatedDays

    await quote.save()

    const populated = await Quote.findById(quote._id)
      .populate('client', 'name phone email')
      .lean()

    res.json(populated)
  } catch (err) {
    next(err)
  }
}

// Eliminar cotización
export const deleteQuote = async (req, res, next) => {
  try {
    const quote = await Quote.findOneAndDelete({
      _id: req.params.id,
      designer: req.user._id,
      status: 'borrador', // Solo eliminar borradores
    })

    if (!quote) {
      return res.status(404).json({ message: 'Cotización no encontrada o no se puede eliminar' })
    }

    res.json({ message: 'Cotización eliminada' })
  } catch (err) {
    next(err)
  }
}

// Convertir cotización a pedido
export const convertToOrder = async (req, res, next) => {
  try {
    const quote = await Quote.findOne({
      _id: req.params.id,
      designer: req.user._id,
    }).populate('client')

    if (!quote) {
      return res.status(404).json({ message: 'Cotización no encontrada' })
    }

    if (quote.status !== 'aceptada') {
      return res.status(400).json({ message: 'La cotización debe estar aceptada para crear un pedido' })
    }

    // Crear pedido desde la cotización
    const order = await Order.create({
      client: quote.client._id,
      designer: req.user._id,
      quote: quote._id,
      title: quote.garmentType || `Pedido de ${quote.client.name}`,
      garmentType: quote.garmentType,
      description: quote.description,
      status: 'confirmado',
      dueDate: new Date(Date.now() + (quote.estimatedDays || 14) * 24 * 60 * 60 * 1000),
      totalAmount: quote.total,
    })

    const populated = await Order.findById(order._id)
      .populate('client', 'name phone email')
      .populate('quote', 'quoteNumber')
      .lean()

    res.status(201).json(populated)
  } catch (err) {
    next(err)
  }
}

// Estadísticas
export const getQuoteStats = async (req, res, next) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [total, pending, accepted, thisMonth] = await Promise.all([
      Quote.countDocuments({ designer: req.user._id }),
      Quote.countDocuments({ designer: req.user._id, status: 'enviada' }),
      Quote.countDocuments({ designer: req.user._id, status: 'aceptada' }),
      Quote.countDocuments({
        designer: req.user._id,
        createdAt: { $gte: startOfMonth },
      }),
    ])

    // Total facturado (cotizaciones aceptadas)
    const totalRevenue = await Quote.aggregate([
      { $match: { designer: req.user._id, status: 'aceptada' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ])

    res.json({
      total,
      pending,
      accepted,
      thisMonth,
      totalRevenue: totalRevenue[0]?.total || 0,
    })
  } catch (err) {
    next(err)
  }
}
