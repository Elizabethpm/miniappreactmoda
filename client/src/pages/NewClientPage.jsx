import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { clientService } from '../services/clientService'
import toast from 'react-hot-toast'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { useMutation, useQueryClient } from 'react-query'
import clsx from 'clsx'

const GENDER_OPTIONS = [
  { value: 'femenino',  label: 'Femenino',  emoji: '👗' },
  { value: 'masculino', label: 'Masculino', emoji: '👔' },
  { value: 'otro',      label: 'Otro',      emoji: '🧷' },
]

const schema = z.object({
  name:     z.string().min(2, 'El nombre es requerido'),
  gender:   z.enum(['femenino', 'masculino', 'otro']).optional(),
  phone:    z.string().optional(),
  email:    z.string().email('Email inválido').or(z.literal('')).optional(),
  birthdate: z.string().optional(),
  notes:    z.string().max(1000).optional(),
})

export default function NewClientPage() {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()

  const { mutateAsync, isLoading } = useMutation(
    (data) => clientService.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients')
        queryClient.invalidateQueries('clients-dashboard')
      },
    }
  )

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { gender: 'femenino' },
  })

  const selectedGender = watch('gender')

  const onSubmit = async (data) => {
    try {
      const res = await mutateAsync(data)
      toast.success('Cliente registrado exitosamente')
      navigate(`/clients/${res.client._id}/measures`)
    } catch (err) {
      toast.error(err.message || 'Error al guardar')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Nuevo cliente</h1>
          <p className="text-gray-500 text-sm">Completa los datos básicos</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="card space-y-5">
          <h2 className="section-title flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary-500" />
            Datos personales
          </h2>

          {/* Nombre */}
          <div>
            <label className="measure-label">Nombre completo *</label>
            <input {...register('name')} type="text" placeholder="Ej: María García" className="input-field" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          {/* Género */}
          <div>
            <label className="measure-label">Género *</label>
            <div className="grid grid-cols-3 gap-3 mt-1">
              {GENDER_OPTIONS.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('gender', value, { shouldValidate: true })}
                  className={clsx(
                    'flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 font-medium text-sm transition-all min-h-[touch]',
                    selectedGender === value
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <span className="text-2xl">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
            <input {...register('gender')} type="hidden" />
          </div>

          {/* Grid 2 cols en tablet */}
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
            <div>
              <label className="measure-label">Teléfono</label>
              <input {...register('phone')} type="tel" placeholder="+52 55 1234 5678" className="input-field" />
            </div>
            <div>
              <label className="measure-label">Email</label>
              <input {...register('email')} type="email" placeholder="correo@ejemplo.com" className="input-field" />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label className="measure-label">Fecha de nacimiento</label>
            <input {...register('birthdate')} type="date" className="input-field" />
          </div>

          <div>
            <label className="measure-label">Notas generales</label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Alergias a materiales, preferencias, etc."
              className="input-field resize-none"
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 mt-5">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary flex-1">
            {isLoading
              ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <>Guardar y tomar medidas</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}
