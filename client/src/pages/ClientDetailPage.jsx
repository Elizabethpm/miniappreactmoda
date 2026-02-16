import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { clientService } from '../services/clientService'
import { measureService } from '../services/measureService'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Ruler, Trash2, Phone,
  Mail, Calendar, FileText, Plus, ChevronRight, StickyNote
} from 'lucide-react'
import { generatePDF } from '../utils/pdfGenerator'
import { useAuth } from '../context/AuthContext'
import clsx from 'clsx'

const GENDER_META = {
  femenino:  { emoji: '👗', label: 'Femenino',  cls: 'bg-pink-50 text-pink-700 border-pink-200'  },
  masculino: { emoji: '👔', label: 'Masculino', cls: 'bg-blue-50 text-blue-700 border-blue-200'  },
  otro:      { emoji: '🧷', label: 'Otro',      cls: 'bg-gray-50 text-gray-700 border-gray-200'  },
}

const FIT_COLOR = {
  ceñido:  'bg-rose-100 text-rose-700',
  regular: 'bg-primary-100 text-primary-700',
  holgado: 'bg-accent-100 text-accent-700',
}

export default function ClientDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const qc       = useQueryClient()
  const { user } = useAuth()

  const { data: clientData, isLoading: loadingClient } = useQuery(
    ['client', id],
    () => clientService.getById(id)
  )
  const { data: measData, isLoading: loadingMeas } = useQuery(
    ['measures', id],
    () => measureService.getByClient(id)
  )

  const { mutate: deleteClient, isLoading: deleting } = useMutation(
    () => clientService.delete(id),
    {
      onSuccess: () => {
        qc.invalidateQueries('clients')
        qc.invalidateQueries('clients-dashboard')
        qc.invalidateQueries('measures-recent')
        toast.success('Cliente eliminado')
        navigate('/clients')
      },
      onError: (err) => toast.error(err.message),
    }
  )

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar a ${clientData?.name}? Esta acción no se puede deshacer.`)) deleteClient()
  }

  const handlePDF = () => {
    if (!clientData || !measData?.measures?.length) {
      toast.error('No hay medidas para generar el PDF')
      return
    }
    generatePDF(clientData, measData.measures[0], { name: user?.studioName || 'Atelier Elizabeth' })
    toast.success('PDF generado')
  }

  if (loadingClient) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!clientData) return (
    <div className="text-center py-16 text-gray-400">Cliente no encontrado</div>
  )

  const measures = measData?.measures || []
  const gender   = GENDER_META[clientData.gender]

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade">

      {/* ── Header ───────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2 flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-gray-900 truncate">
              {clientData.name}
            </h1>
            <p className="text-gray-400 text-sm">
              Registrada el {format(new Date(clientData.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handlePDF} className="btn-secondary" title="Generar PDF">
            <FileText className="w-4 h-4" />
            <span className="hidden tablet:inline">PDF</span>
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="btn-ghost text-red-400 hover:text-red-600 hover:bg-red-50 p-2">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Perfil del cliente ─────────────────────── */}
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar */}
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border border-primary-200">
            {gender ? gender.emoji : <span className="text-primary-600 font-bold text-2xl">{clientData.name[0].toUpperCase()}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-lg font-semibold text-gray-900">{clientData.name}</p>
            {gender && (
              <span className={clsx('inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border mt-1', gender.cls)}>
                {gender.emoji} {gender.label}
              </span>
            )}
          </div>
        </div>

        {/* Grid de info de contacto */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-2">
          {clientData.phone && (
            <InfoRow icon={Phone} label="Teléfono" value={clientData.phone} />
          )}
          {clientData.email && (
            <InfoRow icon={Mail} label="Email" value={clientData.email} truncate />
          )}
          {clientData.birthdate && (
            <InfoRow
              icon={Calendar}
              label="Nacimiento"
              value={format(new Date(clientData.birthdate), "d 'de' MMMM, yyyy", { locale: es })}
            />
          )}
        </div>

        {clientData.notes && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-primary-50 rounded-xl border border-primary-100">
            <StickyNote className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 leading-relaxed">{clientData.notes}</p>
          </div>
        )}
      </div>

      {/* ── Historial de medidas ─────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title flex items-center gap-2 mb-0">
            <Ruler className="w-5 h-5 text-primary-500" />
            Medidas
            <span className="text-sm font-normal text-gray-400">({measures.length})</span>
          </h2>
          <Link to={`/clients/${id}/measures`} className="btn-primary py-2.5 text-sm">
            <Plus className="w-4 h-4" />
            Nueva medición
          </Link>
        </div>

        {loadingMeas ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="card h-24 animate-pulse bg-gray-50" />)}
          </div>
        ) : measures.length === 0 ? (
          <div className="card text-center py-14 border-dashed border-2 border-gray-200 shadow-none">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Ruler className="w-7 h-7 text-primary-400" />
            </div>
            <p className="text-gray-600 font-medium mb-1">Sin medidas registradas</p>
            <p className="text-gray-400 text-sm mb-5">Toma las medidas de este cliente para comenzar</p>
            <Link to={`/clients/${id}/measures`} className="btn-primary mx-auto">
              <Plus className="w-4 h-4" /> Tomar medidas
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {measures.map((m, i) => (
              <Link
                key={m._id}
                to={`/clients/${id}/measures`}
                state={{ measureId: m._id }}
                className="card-hover block"
              >
                {/* Cabecera de la medición */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {i === 0 && (
                      <span className="badge bg-primary-500 text-white text-xs">Reciente</span>
                    )}
                    <span className="text-sm font-semibold text-gray-700">
                      {m.label || `Medición ${measures.length - i}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {m.suggestedSize && (
                      <span className="badge bg-accent-100 text-accent-700 border border-accent-200">
                        Talla {m.suggestedSize}
                      </span>
                    )}
                    {m.fitType && (
                      <span className={clsx('badge border', FIT_COLOR[m.fitType])}>
                        {m.fitType}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>

                {/* Grid de medidas clave */}
                <div className="grid grid-cols-3 tablet:grid-cols-6 gap-2">
                  {[
                    { label: 'Busto',   val: m.upper?.busto },
                    { label: 'Cintura', val: m.upper?.cintura },
                    { label: 'Cadera',  val: m.upper?.cadera },
                    { label: 'C. inf',  val: m.lower?.cintura },
                    { label: 'Falda',   val: m.lower?.largoFalda },
                    { label: 'Pant.',   val: m.lower?.largoPantalon },
                  ].filter(x => x.val).map(({ label, val }) => (
                    <MeasurePill key={label} label={label} value={val} />
                  ))}
                </div>

                {/* Fecha */}
                <p className="text-xs text-gray-400 mt-3 text-right">
                  {format(new Date(m.createdAt), "d 'de' MMMM yyyy", { locale: es })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, truncate = false }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50">
      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center border border-gray-100 flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 leading-none mb-0.5">{label}</p>
        <p className={clsx('text-sm font-medium text-gray-800', truncate && 'truncate')}>{value}</p>
      </div>
    </div>
  )
}

function MeasurePill({ label, value }) {
  return (
    <div className="bg-primary-50 border border-primary-100 rounded-xl px-2 py-2 text-center">
      <p className="text-xs text-primary-400 mb-0.5 font-medium">{label}</p>
      <p className="text-sm font-bold text-primary-700">{value} <span className="text-xs font-normal">cm</span></p>
    </div>
  )
}
