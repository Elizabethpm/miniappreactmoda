import ServiceCatalog from '../models/ServiceCatalog.js'

// Obtener todos los servicios
export const getServices = async (req, res, next) => {
  try {
    const { category, isActive = 'true' } = req.query
    const filter = { designer: req.user._id }

    if (category) filter.category = category
    if (isActive !== undefined) filter.isActive = isActive === 'true'

    const services = await ServiceCatalog.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .lean()

    res.json({ services })
  } catch (err) {
    next(err)
  }
}

// Obtener servicio por ID
export const getServiceById = async (req, res, next) => {
  try {
    const service = await ServiceCatalog.findOne({
      _id: req.params.id,
      designer: req.user._id,
    }).lean()

    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' })
    }

    res.json(service)
  } catch (err) {
    next(err)
  }
}

// Crear servicio
export const createService = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      basePrice,
      priceUnit,
      estimatedHours,
      estimatedDays,
    } = req.body

    const service = await ServiceCatalog.create({
      designer: req.user._id,
      name,
      description,
      category,
      basePrice,
      priceUnit,
      estimatedHours,
      estimatedDays,
    })

    res.status(201).json(service)
  } catch (err) {
    next(err)
  }
}

// Actualizar servicio
export const updateService = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      basePrice,
      priceUnit,
      estimatedHours,
      estimatedDays,
      isActive,
      sortOrder,
    } = req.body

    const service = await ServiceCatalog.findOneAndUpdate(
      { _id: req.params.id, designer: req.user._id },
      {
        name,
        description,
        category,
        basePrice,
        priceUnit,
        estimatedHours,
        estimatedDays,
        isActive,
        sortOrder,
      },
      { new: true, runValidators: true }
    )

    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' })
    }

    res.json(service)
  } catch (err) {
    next(err)
  }
}

// Eliminar servicio
export const deleteService = async (req, res, next) => {
  try {
    const service = await ServiceCatalog.findOneAndDelete({
      _id: req.params.id,
      designer: req.user._id,
    })

    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' })
    }

    res.json({ message: 'Servicio eliminado' })
  } catch (err) {
    next(err)
  }
}

// Obtener servicios por categoría con estadísticas
export const getServicesByCategory = async (req, res, next) => {
  try {
    const services = await ServiceCatalog.aggregate([
      { $match: { designer: req.user._id, isActive: true } },
      {
        $group: {
          _id: '$category',
          services: { $push: { name: '$name', basePrice: '$basePrice', _id: '$_id' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ])

    res.json({ services })
  } catch (err) {
    next(err)
  }
}
