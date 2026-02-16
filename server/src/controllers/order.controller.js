import Order from '../models/Order.js'
import Client from '../models/Client.js'

// Obtener todos los pedidos
export const getOrders = async (req, res, next) => {
  try {
    const { status, clientId, priority, page = 1, limit = 50 } = req.query
    const filter = { designer: req.user._id }

    if (status) {
      filter.status = { $in: status.split(',') }
    }
    if (clientId) filter.client = clientId
    if (priority) filter.priority = priority

    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('client', 'name phone email')
        .populate('quote', 'quoteNumber total')
        .sort({ dueDate: 1, priority: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter),
    ])

    res.json({
      orders,
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

// Obtener pedidos agrupados por estado (Kanban)
export const getOrdersKanban = async (req, res, next) => {
  try {
    const orders = await Order.find({
      designer: req.user._id,
      status: { $nin: ['entregado', 'cancelado'] },
    })
      .populate('client', 'name phone')
      .sort({ dueDate: 1, priority: -1 })
      .lean()

    // Agrupar por estado
    const kanban = {
      confirmado: [],
      en_diseno: [],
      cortando: [],
      confeccionando: [],
      prueba: [],
      ajustes: [],
      terminado: [],
    }

    orders.forEach((order) => {
      if (kanban[order.status]) {
        kanban[order.status].push(order)
      }
    })

    res.json({ kanban })
  } catch (err) {
    next(err)
  }
}

// Obtener pedido por ID
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      designer: req.user._id,
    })
      .populate('client', 'name phone email')
      .populate('quote', 'quoteNumber items total')
      .populate('measure')
      .lean()

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }

    res.json(order)
  } catch (err) {
    next(err)
  }
}

// Crear pedido
export const createOrder = async (req, res, next) => {
  try {
    const {
      client: clientId,
      title,
      garmentType,
      description,
      priority,
      dueDate,
      totalAmount,
      notes,
      measure,
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

    const order = await Order.create({
      client: clientId,
      designer: req.user._id,
      title,
      garmentType,
      description,
      priority: priority || 'normal',
      dueDate: new Date(dueDate),
      totalAmount: totalAmount || 0,
      notes,
      measure,
      status: 'confirmado',
    })

    const populated = await Order.findById(order._id)
      .populate('client', 'name phone email')
      .lean()

    res.status(201).json(populated)
  } catch (err) {
    next(err)
  }
}

// Actualizar pedido
export const updateOrder = async (req, res, next) => {
  try {
    const {
      title,
      garmentType,
      description,
      status,
      priority,
      dueDate,
      totalAmount,
      paidAmount,
      notes,
    } = req.body

    const order = await Order.findOne({
      _id: req.params.id,
      designer: req.user._id,
    })

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }

    if (title !== undefined) order.title = title
    if (garmentType !== undefined) order.garmentType = garmentType
    if (description !== undefined) order.description = description
    if (status) order.status = status
    if (priority) order.priority = priority
    if (dueDate) order.dueDate = new Date(dueDate)
    if (totalAmount !== undefined) order.totalAmount = totalAmount
    if (paidAmount !== undefined) order.paidAmount = paidAmount
    if (notes !== undefined) order.notes = notes

    // Si se entrega, registrar fecha
    if (status === 'entregado' && !order.deliveredDate) {
      order.deliveredDate = new Date()
    }

    await order.save()

    const populated = await Order.findById(order._id)
      .populate('client', 'name phone email')
      .lean()

    res.json(populated)
  } catch (err) {
    next(err)
  }
}

// Actualizar solo el estado (para drag & drop en Kanban)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body

    const order = await Order.findOne({
      _id: req.params.id,
      designer: req.user._id,
    })

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }

    order.status = status
    if (notes) {
      order.timeline[order.timeline.length - 1].notes = notes
    }

    if (status === 'entregado' && !order.deliveredDate) {
      order.deliveredDate = new Date()
    }

    await order.save()

    res.json({ message: 'Estado actualizado', status: order.status })
  } catch (err) {
    next(err)
  }
}

// Eliminar pedido
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      designer: req.user._id,
    })

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }

    res.json({ message: 'Pedido eliminado' })
  } catch (err) {
    next(err)
  }
}

// Agregar pago
export const addPayment = async (req, res, next) => {
  try {
    const { amount } = req.body

    const order = await Order.findOne({
      _id: req.params.id,
      designer: req.user._id,
    })

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }

    order.paidAmount = (order.paidAmount || 0) + amount
    await order.save()

    res.json({
      paidAmount: order.paidAmount,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
    })
  } catch (err) {
    next(err)
  }
}

// Estadísticas de pedidos
export const getOrderStats = async (req, res, next) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [total, active, dueThisWeek, overdue, completedThisMonth] = await Promise.all([
      Order.countDocuments({ designer: req.user._id }),
      Order.countDocuments({
        designer: req.user._id,
        status: { $nin: ['entregado', 'cancelado'] },
      }),
      Order.countDocuments({
        designer: req.user._id,
        status: { $nin: ['entregado', 'cancelado'] },
        dueDate: {
          $gte: now,
          $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
      Order.countDocuments({
        designer: req.user._id,
        status: { $nin: ['entregado', 'cancelado'] },
        dueDate: { $lt: now },
      }),
      Order.countDocuments({
        designer: req.user._id,
        status: 'entregado',
        deliveredDate: { $gte: startOfMonth },
      }),
    ])

    // Total por cobrar
    const pendingPayments = await Order.aggregate([
      {
        $match: {
          designer: req.user._id,
          status: { $nin: ['cancelado'] },
        },
      },
      {
        $group: {
          _id: null,
          totalPending: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } },
        },
      },
    ])

    res.json({
      total,
      active,
      dueThisWeek,
      overdue,
      completedThisMonth,
      pendingPayments: pendingPayments[0]?.totalPending || 0,
    })
  } catch (err) {
    next(err)
  }
}

// Pedidos próximos a vencer (dashboard)
export const getUpcomingOrders = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5

    const orders = await Order.find({
      designer: req.user._id,
      status: { $nin: ['entregado', 'cancelado'] },
    })
      .populate('client', 'name')
      .sort({ dueDate: 1 })
      .limit(limit)
      .lean()

    res.json({ orders })
  } catch (err) {
    next(err)
  }
}
