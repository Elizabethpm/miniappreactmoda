import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'
import { Settings, Upload, Save, Building2, Phone, MapPin, Image, Globe, MessageCircle, ExternalLink } from 'lucide-react'
import { useRef, useState } from 'react'
import api from '../services/api'

export default function SettingsPage() {
  const { user, updateProfile, setUser } = useAuth()
  const fileInputRef = useRef(null)
  const [logoPreview, setLogoPreview] = useState(user?.logoUrl || null)
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name:       user?.name       || '',
      studioName: user?.studioName || '',
      phone:      user?.phone      || '',
      address:    user?.address    || '',
      website:    user?.website    || '',
      whatsapp:   user?.whatsapp   || '',
    },
  })

  const onSubmit = async (data) => {
    try {
      await updateProfile(data)
      toast.success('Configuración guardada')
    } catch (err) {
      toast.error(err.message || 'Error al guardar')
    }
  }

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview local inmediato
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target.result)
    reader.readAsDataURL(file)

    // Subir al servidor
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)
      const res = await api.post('/auth/me/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUser(res.user)
      setLogoPreview(res.user.logoUrl)
      toast.success('Logo actualizado')
    } catch (err) {
      toast.error(err.message || 'Error al subir el logo')
      setLogoPreview(user?.logoUrl || null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500 text-sm">Personaliza tu perfil y datos del taller</p>
        </div>
      </div>

      {/* Logo */}
      <div className="card space-y-4">
        <h2 className="section-title flex items-center gap-2">
          <Image className="w-5 h-5 text-primary-500" />
          Logo del taller
        </h2>

        <div className="flex items-center gap-5">
          {/* Preview */}
          <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
            {logoPreview ? (
              <img
                src={logoPreview.startsWith('data:') ? logoPreview : logoPreview}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2">
                <Image className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-400 mt-1">Sin logo</p>
              </div>
            )}
          </div>

          {/* Botón de subida */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleLogoChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary"
            >
              {uploading ? (
                <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? 'Subiendo...' : 'Subir logo'}
            </button>
            <p className="text-xs text-gray-400">JPG, PNG o WEBP · máx. 2 MB</p>
          </div>
        </div>
      </div>

      {/* Datos del taller */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card space-y-5">
          <h2 className="section-title flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-500" />
            Datos del taller
          </h2>

          <div>
            <label className="measure-label">Tu nombre</label>
            <input
              {...register('name')}
              type="text"
              placeholder="Elizabeth Méndez"
              className="input-field mt-1"
            />
          </div>

          <div>
            <label className="measure-label">Nombre del taller / marca</label>
            <input
              {...register('studioName')}
              type="text"
              placeholder="Ej: Atelier Elizabeth, EM Modas..."
              className="input-field mt-1"
            />
            <p className="text-xs text-gray-400 mt-1">
              Aparece en el menú lateral y en las fichas PDF
            </p>
          </div>

          <div>
            <label className="measure-label flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Teléfono
            </label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="+52 55 1234 5678"
              className="input-field mt-1"
            />
          </div>

          <div>
            <label className="measure-label flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Dirección del taller
            </label>
            <input
              {...register('address')}
              type="text"
              placeholder="Calle, ciudad, estado..."
              className="input-field mt-1"
            />
          </div>

          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
            <div>
              <label className="measure-label flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Página web
              </label>
              <input
                {...register('website')}
                type="url"
                placeholder="https://tudominio.com"
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="measure-label flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </label>
              <input
                {...register('whatsapp')}
                type="tel"
                placeholder="+1 809 123 4567"
                className="input-field mt-1"
              />
            </div>
          </div>

          {user?.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Ver mi página web
            </a>
          )}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Save className="w-5 h-5" /> Guardar cambios</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
