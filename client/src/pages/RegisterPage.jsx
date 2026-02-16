import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Scissors, User, Mail, Lock, Store } from 'lucide-react'

const schema = z.object({
  name:       z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email:      z.string().email('Email inválido'),
  studioName: z.string().optional(),
  password:   z.string().min(8, 'Mínimo 8 caracteres'),
  confirm:    z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm'],
})

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async ({ confirm, ...data }) => {
    try {
      await registerUser(data)
      toast.success('¡Cuenta creada! Bienvenida.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Error al registrarse')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4 shadow-lg">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">ModaMedidas</h1>
          <p className="text-gray-500 mt-1">Crea tu cuenta de diseñadora</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Registro</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="measure-label">Nombre completo *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input {...register('name')} type="text" placeholder="Tu nombre" className="input-field pl-11" />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="measure-label">Nombre del taller (opcional)</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input {...register('studioName')} type="text" placeholder="Mi Taller de Moda" className="input-field pl-11" />
              </div>
            </div>

            <div>
              <label className="measure-label">Correo electrónico *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input {...register('email')} type="email" placeholder="tu@email.com" className="input-field pl-11" />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="measure-label">Contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input {...register('password')} type="password" placeholder="Mínimo 8 caracteres" className="input-field pl-11" />
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="measure-label">Confirmar contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input {...register('confirm')} type="password" placeholder="Repite tu contraseña" className="input-field pl-11" />
              </div>
              {errors.confirm && <p className="text-red-500 text-sm mt-1">{errors.confirm.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-lg mt-2">
              {isSubmitting
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'Crear cuenta'
              }
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
