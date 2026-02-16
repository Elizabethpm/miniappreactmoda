import { Link } from 'react-router-dom'
import { Scissors } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 p-4">
      <div className="text-center">
        <Scissors className="w-16 h-16 text-primary-300 mx-auto mb-4" />
        <h1 className="font-display text-6xl font-bold text-primary-400 mb-2">404</h1>
        <p className="text-gray-600 text-lg mb-6">Esta página no existe</p>
        <Link to="/dashboard" className="btn-primary mx-auto">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
