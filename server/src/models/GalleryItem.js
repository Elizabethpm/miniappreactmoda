import mongoose from 'mongoose'

const galleryItemSchema = new mongoose.Schema(
  {
    // Relaciones
    designer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },

    // Datos de la imagen
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },

    // Categorización
    category: {
      type: String,
      enum: ['novias', 'quinceañeras', 'gala', 'casual', 'trajes', 'accesorios', 'otro'],
      default: 'otro',
    },
    tags: [String],

    // Detalles de la prenda
    garmentType: {
      type: String,
      trim: true,
    },
    fabrics: [String],
    colors: [String],

    // Visibilidad
    isPublic: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Permiso del cliente
    clientPermission: {
      type: Boolean,
      default: false,
    },

    // Estadísticas
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

galleryItemSchema.index({ designer: 1, category: 1 })
galleryItemSchema.index({ isPublic: 1, isFeatured: -1 })
galleryItemSchema.index({ tags: 1 })

export default mongoose.model('GalleryItem', galleryItemSchema)
