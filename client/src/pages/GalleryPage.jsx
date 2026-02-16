import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { galleryService } from '../services/galleryService'
import { clientService } from '../services/clientService'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { Image, Plus, X, Eye, Heart, Edit2, Trash2, Globe, Lock } from 'lucide-react'

const CATEGORIES = [
  { id: 'novias', label: 'Novias', emoji: '👰' },
  { id: 'quinceañeras', label: 'Quinceañeras', emoji: '🎀' },
  { id: 'gala', label: 'Gala', emoji: '✨' },
  { id: 'casual', label: 'Casual', emoji: '👗' },
  { id: 'trajes', label: 'Trajes', emoji: '👔' },
  { id: 'accesorios', label: 'Accesorios', emoji: '💍' },
  { id: 'otro', label: 'Otro', emoji: '🧵' },
]

export default function GalleryPage() {
  const [filter, setFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // grid | list
  const qc = useQueryClient()

  const { data, isLoading } = useQuery(
    ['gallery', filter],
    () => galleryService.getAll({ category: filter || undefined }),
    { staleTime: 30_000 }
  )

  const { data: categoriesData } = useQuery(
    ['gallery-categories'],
    () => galleryService.getCategories(),
    { staleTime: 60_000 }
  )

  const items = data?.items || []
  const categories = categoriesData?.categories || []

  const getCategoryCount = (catId) => {
    const cat = categories.find((c) => c._id === catId)
    return cat?.count || 0
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl tablet:text-3xl font-bold text-gray-900">
          <Image className="w-7 h-7 inline-block mr-2 text-primary-500" />
          Galería
        </h1>
        <button onClick={() => { setSelectedItem(null); setShowModal(true) }} className="btn-primary">
          <Plus className="w-5 h-5" />
          <span className="hidden xs:inline">Agregar</span>
        </button>
      </div>

      {/* Filtros por categoría */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <FilterChip active={!filter} onClick={() => setFilter('')} count={items.length}>
          Todas
        </FilterChip>
        {CATEGORIES.map((cat) => (
          <FilterChip
            key={cat.id}
            active={filter === cat.id}
            onClick={() => setFilter(cat.id)}
            count={getCategoryCount(cat.id)}
          >
            {cat.emoji} {cat.label}
          </FilterChip>
        ))}
      </div>

      {/* Galería */}
      {isLoading ? (
        <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-16">
          <Image className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-lg">
            {filter ? 'No hay fotos en esta categoría' : 'Tu galería está vacía'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Sube tus mejores trabajos para mostrar tu talento
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary mx-auto mt-5">
            <Plus className="w-4 h-4" /> Agregar foto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-4">
          {items.map((item) => (
            <GalleryCard
              key={item._id}
              item={item}
              onClick={() => { setSelectedItem(item); setShowModal(true) }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <GalleryModal
          item={selectedItem}
          onClose={() => { setShowModal(false); setSelectedItem(null) }}
          onSave={() => { qc.invalidateQueries('gallery'); setShowModal(false); setSelectedItem(null) }}
        />
      )}
    </div>
  )
}

function FilterChip({ children, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2',
        active
          ? 'bg-primary-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      )}
    >
      {children}
      {count > 0 && (
        <span className={clsx(
          'text-xs px-1.5 py-0.5 rounded-full',
          active ? 'bg-white/20' : 'bg-gray-200'
        )}>
          {count}
        </span>
      )}
    </button>
  )
}

function GalleryCard({ item, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-gray-100"
    >
      <img
        src={item.thumbnailUrl || item.imageUrl}
        alt={item.title}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-semibold truncate">{item.title}</p>
          {item.client && (
            <p className="text-white/70 text-sm truncate">{item.client.name}</p>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="absolute top-2 right-2 flex gap-1">
        {item.isFeatured && (
          <span className="bg-amber-500 text-white p-1 rounded-full">
            <Heart className="w-3 h-3" />
          </span>
        )}
        <span className={clsx(
          'p-1 rounded-full',
          item.isPublic ? 'bg-green-500 text-white' : 'bg-gray-800/50 text-white'
        )}>
          {item.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
        </span>
      </div>

      {/* Views */}
      {item.views > 0 && (
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {item.views}
        </div>
      )}
    </div>
  )
}

function GalleryModal({ item, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    imageUrl: item?.imageUrl || '',
    category: item?.category || 'otro',
    garmentType: item?.garmentType || '',
    fabrics: item?.fabrics?.join(', ') || '',
    colors: item?.colors?.join(', ') || '',
    isPublic: item?.isPublic || false,
    isFeatured: item?.isFeatured || false,
    client: item?.client?._id || '',
    tags: item?.tags?.join(', ') || '',
  })

  const { data: clientsData } = useQuery(['clients-list'], () => clientService.getAll({ limit: 100 }))
  const clients = clientsData?.clients || []

  const createMutation = useMutation(galleryService.create, {
    onSuccess: () => { toast.success('Foto agregada'); onSave() },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  })

  const updateMutation = useMutation(
    (data) => galleryService.update(item._id, data),
    {
      onSuccess: () => { toast.success('Foto actualizada'); onSave() },
      onError: (err) => toast.error(err.response?.data?.message || 'Error'),
    }
  )

  const deleteMutation = useMutation(() => galleryService.delete(item._id), {
    onSuccess: () => { toast.success('Foto eliminada'); onSave() },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.imageUrl) {
      toast.error('Título y URL de imagen son requeridos')
      return
    }

    const data = {
      ...formData,
      fabrics: formData.fabrics ? formData.fabrics.split(',').map((s) => s.trim()) : [],
      colors: formData.colors ? formData.colors.split(',').map((s) => s.trim()) : [],
      tags: formData.tags ? formData.tags.split(',').map((s) => s.trim()) : [],
    }

    if (item) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDelete = () => {
    if (window.confirm('¿Eliminar esta foto?')) {
      deleteMutation.mutate()
    }
  }

  const isLoading = createMutation.isLoading || updateMutation.isLoading

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="font-display text-lg font-semibold">
            {item ? 'Editar foto' : 'Agregar foto'}
          </h3>
          <button onClick={onClose} className="btn-ghost p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
            {/* Preview */}
            <div>
              <label className="measure-label mb-2 block">Vista previa</label>
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full aspect-square object-cover rounded-xl bg-gray-100"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/400?text=Error'}
                />
              ) : (
                <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                  <Image className="w-12 h-12 text-gray-300" />
                </div>
              )}
            </div>

            {/* Campos principales */}
            <div className="space-y-3">
              <div>
                <label className="measure-label">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Vestido de novia clásico"
                  className="input-field mt-1"
                  required
                />
              </div>

              <div>
                <label className="measure-label">URL de imagen *</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="input-field mt-1"
                  required
                />
              </div>

              <div>
                <label className="measure-label">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field mt-1"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="measure-label">Cliente (opcional)</label>
                <select
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="input-field mt-1"
                >
                  <option value="">Sin cliente</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="measure-label">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Descripción del trabajo..."
              className="input-field resize-none mt-1"
            />
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
            <div>
              <label className="measure-label">Tipo de prenda</label>
              <input
                type="text"
                value={formData.garmentType}
                onChange={(e) => setFormData({ ...formData, garmentType: e.target.value })}
                placeholder="Vestido, blusa..."
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="measure-label">Telas (separadas por coma)</label>
              <input
                type="text"
                value={formData.fabrics}
                onChange={(e) => setFormData({ ...formData, fabrics: e.target.value })}
                placeholder="Seda, encaje..."
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="measure-label">Colores</label>
              <input
                type="text"
                value={formData.colors}
                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                placeholder="Blanco, marfil..."
                className="input-field mt-1"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="measure-label">Etiquetas (separadas por coma)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="elegante, romántico, moderno..."
              className="input-field mt-1"
            />
          </div>

          {/* Opciones */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm">
                <Globe className="w-4 h-4 inline mr-1" />
                Público
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm">
                <Heart className="w-4 h-4 inline mr-1" />
                Destacado
              </span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            {item && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isLoading}
                className="btn-ghost text-red-500 hover:bg-red-50 p-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>{item ? 'Guardar' : 'Agregar foto'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
