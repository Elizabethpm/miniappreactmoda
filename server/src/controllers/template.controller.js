import GarmentTemplate from '../models/GarmentTemplate.js'

// Plantillas predefinidas del sistema
const SYSTEM_TEMPLATES = [
  {
    name: 'Vestido de novia',
    category: 'vestido',
    icon: '👰',
    description: 'Medidas completas para confección de vestido de novia',
    requiredMeasures: {
      upper: [
        'contornoBusto', 'contornoBajoBusto', 'contornoCintura', 'contornoCadera',
        'hombros', 'anchoHombro', 'anchoBusto', 'alturaBusto', 'largoTalle',
        'largoTalleCentro', 'largoBrazo', 'contornoBiceps'
      ],
      lower: [
        'largoTalleTrasero', 'anchoHombrosTrasero', 'largoCentroTrasero',
        'anchoToraxTrasero', 'anchoOmoplatosTrasero', 'anchoCinturaTrasero'
      ],
    },
    optionalMeasures: {
      upper: ['contornoSobreBusto', 'contornoCuello', 'caidaHombro', 'alturaCapdera'],
      lower: ['reboqueCuelloTrasero', 'largoCaidaTrasero'],
    },
    defaultFitType: 'ceñido',
    estimatedDays: 30,
    basePrice: 0,
  },
  {
    name: 'Vestido de gala',
    category: 'vestido',
    icon: '✨',
    description: 'Medidas para vestido de fiesta o gala',
    requiredMeasures: {
      upper: [
        'contornoBusto', 'contornoBajoBusto', 'contornoCintura', 'contornoCadera',
        'hombros', 'anchoBusto', 'alturaBusto', 'largoTalle'
      ],
      lower: ['largoTalleTrasero', 'anchoHombrosTrasero', 'anchoToraxTrasero'],
    },
    optionalMeasures: {
      upper: ['largoBrazo', 'contornoBiceps', 'caidaHombro'],
      lower: ['anchoOmoplatosTrasero'],
    },
    defaultFitType: 'ceñido',
    estimatedDays: 14,
    basePrice: 0,
  },
  {
    name: 'Vestido de quinceañera',
    category: 'vestido',
    icon: '🎀',
    description: 'Medidas completas para vestido de XV años',
    requiredMeasures: {
      upper: [
        'contornoBusto', 'contornoBajoBusto', 'contornoCintura', 'contornoCadera',
        'hombros', 'anchoHombro', 'anchoBusto', 'alturaBusto', 'largoTalle',
        'largoBrazo', 'contornoBiceps'
      ],
      lower: [
        'largoTalleTrasero', 'anchoHombrosTrasero', 'anchoToraxTrasero',
        'anchoOmoplatosTrasero'
      ],
    },
    optionalMeasures: {
      upper: ['contornoSobreBusto', 'caidaHombro'],
      lower: ['largoCentroTrasero', 'anchoCinturaTrasero'],
    },
    defaultFitType: 'ceñido',
    estimatedDays: 21,
    basePrice: 0,
  },
  {
    name: 'Blusa básica',
    category: 'superior',
    icon: '👚',
    description: 'Medidas esenciales para blusa o top',
    requiredMeasures: {
      upper: [
        'contornoBusto', 'contornoCintura', 'hombros', 'anchoHombro',
        'largoTalle', 'largoBrazo', 'contornoBiceps'
      ],
      lower: ['largoTalleTrasero', 'anchoHombrosTrasero'],
    },
    optionalMeasures: {
      upper: ['anchoBusto', 'alturaBusto', 'caidaHombro'],
      lower: ['anchoToraxTrasero'],
    },
    defaultFitType: 'regular',
    estimatedDays: 5,
    basePrice: 0,
  },
  {
    name: 'Blazer / Saco',
    category: 'superior',
    icon: '🧥',
    description: 'Medidas para saco o blazer estructurado',
    requiredMeasures: {
      upper: [
        'contornoBusto', 'contornoCintura', 'contornoCadera', 'hombros',
        'anchoHombro', 'largoTalle', 'largoBrazo', 'contornoBiceps'
      ],
      lower: [
        'largoTalleTrasero', 'anchoHombrosTrasero', 'anchoToraxTrasero',
        'anchoOmoplatosTrasero'
      ],
    },
    optionalMeasures: {
      upper: ['caidaHombro'],
      lower: ['largoCentroTrasero'],
    },
    defaultFitType: 'regular',
    estimatedDays: 10,
    basePrice: 0,
  },
  {
    name: 'Falda',
    category: 'inferior',
    icon: '👗',
    description: 'Medidas para falda',
    requiredMeasures: {
      upper: ['contornoCintura', 'contornoCadera', 'alturaCapdera'],
      lower: ['anchoCinturaTrasero'],
    },
    optionalMeasures: {
      upper: [],
      lower: [],
    },
    defaultFitType: 'regular',
    estimatedDays: 3,
    basePrice: 0,
  },
  {
    name: 'Pantalón',
    category: 'inferior',
    icon: '👖',
    description: 'Medidas para pantalón',
    requiredMeasures: {
      upper: ['contornoCintura', 'contornoCadera', 'alturaCapdera'],
      lower: ['anchoCinturaTrasero'],
    },
    optionalMeasures: {
      upper: [],
      lower: [],
    },
    defaultFitType: 'regular',
    estimatedDays: 5,
    basePrice: 0,
  },
  {
    name: 'Traje completo',
    category: 'traje',
    icon: '👔',
    description: 'Todas las medidas para traje formal completo',
    requiredMeasures: {
      upper: [
        'contornoBusto', 'contornoBajoBusto', 'contornoCintura', 'contornoCadera',
        'contornoCuello', 'hombros', 'anchoHombro', 'caidaHombro', 'anchoBusto',
        'alturaBusto', 'alturaCapdera', 'largoTalle', 'largoTalleCentro',
        'largoBrazo', 'contornoBiceps'
      ],
      lower: [
        'largoTalleTrasero', 'anchoHombrosTrasero', 'largoCentroTrasero',
        'reboqueCuelloTrasero', 'largoCaidaTrasero', 'anchoToraxTrasero',
        'anchoOmoplatosTrasero', 'anchoCinturaTrasero'
      ],
    },
    optionalMeasures: {
      upper: ['contornoSobreBusto'],
      lower: [],
    },
    defaultFitType: 'regular',
    estimatedDays: 21,
    basePrice: 0,
  },
]

// Obtener todas las plantillas (sistema + usuario)
export const getTemplates = async (req, res, next) => {
  try {
    const { category, includeSystem = 'true' } = req.query

    const filter = {
      $or: [
        { designer: req.user._id },
        ...(includeSystem === 'true' ? [{ designer: null }] : []),
      ],
      isActive: true,
    }

    if (category) {
      filter.category = category
    }

    let templates = await GarmentTemplate.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .lean()

    // Si no hay plantillas del sistema en la DB, retornar las predefinidas
    const systemTemplatesInDb = templates.filter((t) => !t.designer)
    if (systemTemplatesInDb.length === 0 && includeSystem === 'true') {
      templates = [...SYSTEM_TEMPLATES.map((t, i) => ({ ...t, _id: `system-${i}`, isSystem: true })), ...templates]
    }

    res.json({ templates })
  } catch (err) {
    next(err)
  }
}

// Obtener plantilla por ID
export const getTemplateById = async (req, res, next) => {
  try {
    // Verificar si es plantilla del sistema
    if (req.params.id.startsWith('system-')) {
      const index = parseInt(req.params.id.split('-')[1])
      if (SYSTEM_TEMPLATES[index]) {
        return res.json({ ...SYSTEM_TEMPLATES[index], _id: req.params.id, isSystem: true })
      }
      return res.status(404).json({ message: 'Plantilla no encontrada' })
    }

    const template = await GarmentTemplate.findOne({
      _id: req.params.id,
      $or: [{ designer: req.user._id }, { designer: null }],
    }).lean()

    if (!template) {
      return res.status(404).json({ message: 'Plantilla no encontrada' })
    }

    res.json(template)
  } catch (err) {
    next(err)
  }
}

// Crear plantilla personalizada
export const createTemplate = async (req, res, next) => {
  try {
    const {
      name,
      category,
      icon,
      description,
      requiredMeasures,
      optionalMeasures,
      defaultFitType,
      estimatedDays,
      basePrice,
    } = req.body

    const template = await GarmentTemplate.create({
      designer: req.user._id,
      name,
      category,
      icon,
      description,
      requiredMeasures,
      optionalMeasures,
      defaultFitType,
      estimatedDays,
      basePrice,
    })

    res.status(201).json(template)
  } catch (err) {
    next(err)
  }
}

// Actualizar plantilla (solo las propias)
export const updateTemplate = async (req, res, next) => {
  try {
    const {
      name,
      category,
      icon,
      description,
      requiredMeasures,
      optionalMeasures,
      defaultFitType,
      estimatedDays,
      basePrice,
      isActive,
    } = req.body

    const template = await GarmentTemplate.findOneAndUpdate(
      { _id: req.params.id, designer: req.user._id },
      {
        name,
        category,
        icon,
        description,
        requiredMeasures,
        optionalMeasures,
        defaultFitType,
        estimatedDays,
        basePrice,
        isActive,
      },
      { new: true, runValidators: true }
    )

    if (!template) {
      return res.status(404).json({ message: 'Plantilla no encontrada o no tienes permiso' })
    }

    res.json(template)
  } catch (err) {
    next(err)
  }
}

// Eliminar plantilla (solo las propias)
export const deleteTemplate = async (req, res, next) => {
  try {
    const template = await GarmentTemplate.findOneAndDelete({
      _id: req.params.id,
      designer: req.user._id,
    })

    if (!template) {
      return res.status(404).json({ message: 'Plantilla no encontrada o no tienes permiso' })
    }

    res.json({ message: 'Plantilla eliminada' })
  } catch (err) {
    next(err)
  }
}

// Inicializar plantillas del sistema (solo admin)
export const initSystemTemplates = async (req, res, next) => {
  try {
    // Verificar si ya existen
    const existing = await GarmentTemplate.countDocuments({ designer: null })
    if (existing > 0) {
      return res.json({ message: 'Las plantillas del sistema ya existen', count: existing })
    }

    // Crear plantillas del sistema
    const templates = await GarmentTemplate.insertMany(
      SYSTEM_TEMPLATES.map((t, i) => ({ ...t, designer: null, sortOrder: i }))
    )

    res.status(201).json({ message: 'Plantillas creadas', count: templates.length })
  } catch (err) {
    next(err)
  }
}
