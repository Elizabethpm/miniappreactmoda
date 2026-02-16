import GalleryItem from '../models/GalleryItem.js'

// Obtener galería
export const getGalleryItems = async (req, res, next) => {
  try {
    const { category, clientId, isPublic, page = 1, limit = 20 } = req.query
    const filter = { designer: req.user._id }

    if (category) filter.category = category
    if (clientId) filter.client = clientId
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true'

    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      GalleryItem.find(filter)
        .populate('client', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      GalleryItem.countDocuments(filter),
    ])

    res.json({
      items,
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

// Obtener item por ID
export const getGalleryItemById = async (req, res, next) => {
  try {
    const item = await GalleryItem.findOne({
      _id: req.params.id,
      designer: req.user._id,
    })
      .populate('client', 'name')
      .populate('order', 'orderNumber')
      .lean()

    if (!item) {
      return res.status(404).json({ message: 'Elemento no encontrado' })
    }

    // Incrementar vistas
    await GalleryItem.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })

    res.json(item)
  } catch (err) {
    next(err)
  }
}

// Crear item de galería
export const createGalleryItem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      imageUrl,
      thumbnailUrl,
      category,
      tags,
      garmentType,
      fabrics,
      colors,
      isPublic,
      isFeatured,
      clientPermission,
      client,
      order,
    } = req.body

    const item = await GalleryItem.create({
      designer: req.user._id,
      title,
      description,
      imageUrl,
      thumbnailUrl: thumbnailUrl || imageUrl,
      category,
      tags: tags || [],
      garmentType,
      fabrics: fabrics || [],
      colors: colors || [],
      isPublic: isPublic || false,
      isFeatured: isFeatured || false,
      clientPermission: clientPermission || false,
      client,
      order,
    })

    res.status(201).json(item)
  } catch (err) {
    next(err)
  }
}

// Actualizar item
export const updateGalleryItem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      tags,
      garmentType,
      fabrics,
      colors,
      isPublic,
      isFeatured,
      clientPermission,
    } = req.body

    const item = await GalleryItem.findOneAndUpdate(
      { _id: req.params.id, designer: req.user._id },
      {
        title,
        description,
        category,
        tags,
        garmentType,
        fabrics,
        colors,
        isPublic,
        isFeatured,
        clientPermission,
      },
      { new: true, runValidators: true }
    )

    if (!item) {
      return res.status(404).json({ message: 'Elemento no encontrado' })
    }

    res.json(item)
  } catch (err) {
    next(err)
  }
}

// Eliminar item
export const deleteGalleryItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.findOneAndDelete({
      _id: req.params.id,
      designer: req.user._id,
    })

    if (!item) {
      return res.status(404).json({ message: 'Elemento no encontrado' })
    }

    res.json({ message: 'Elemento eliminado' })
  } catch (err) {
    next(err)
  }
}

// Obtener categorías con conteo
export const getCategories = async (req, res, next) => {
  try {
    const categories = await GalleryItem.aggregate([
      { $match: { designer: req.user._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    res.json({ categories })
  } catch (err) {
    next(err)
  }
}

// Galería pública (para portafolio)
export const getPublicGallery = async (req, res, next) => {
  try {
    const { designerId, category, page = 1, limit = 20 } = req.query

    const filter = {
      isPublic: true,
    }

    if (designerId) filter.designer = designerId
    if (category) filter.category = category

    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      GalleryItem.find(filter)
        .select('-designer')
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      GalleryItem.countDocuments(filter),
    ])

    res.json({
      items,
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
