import { useForm } from 'react-hook-form'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { clientService } from '../services/clientService'
import { measureService } from '../services/measureService'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, FileText, Info } from 'lucide-react'
import { generatePDF } from '../utils/pdfGenerator'
import { useAuth } from '../context/AuthContext'
import clsx from 'clsx'

// ── Campo de medida individual ────────────────────────
function MeasureField({ label, register, name, description }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <label className="measure-label">{label}</label>
        {description && (
          <span title={description} className="cursor-help">
            <Info className="w-3.5 h-3.5 text-gray-300" />
          </span>
        )}
      </div>
      <div className="relative">
        <input
          {...register(name, { valueAsNumber: true })}
          type="number"
          step="0.5"
          min="0"
          max="300"
          placeholder="0"
          inputMode="decimal"
          className="measure-input"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
          cm
        </span>
      </div>
    </div>
  )
}

// ── Sección con título y punto de color ───────────────
function MeasureSection({ title, children, colorClass = 'bg-primary-500' }) {
  return (
    <div className="card space-y-4">
      <h3 className="section-title flex items-center gap-2">
        <span className={clsx('w-3 h-3 rounded-full flex-shrink-0', colorClass)} />
        {title}
      </h3>
      <div className="grid grid-cols-2 tablet:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  )
}

export default function MeasuresPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const qc       = useQueryClient()
  const { user } = useAuth()

  const { data: clientData } = useQuery(['client', id], () => clientService.getById(id))
  const { data: measData }   = useQuery(['measures-latest', id], () => measureService.getLastest(id))
  const latest = measData?.measure

  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      label:          latest?.label          || '',
      fitType:        latest?.fitType        || 'regular',
      fabricType:     latest?.fabricType     || '',
      technicalNotes: latest?.technicalNotes || '',
      upper: {
        // Contornos del torso
        contornoCuello:     latest?.upper?.contornoCuello     || '',
        contornoSobreBusto: latest?.upper?.contornoSobreBusto || '',
        contornoBusto:      latest?.upper?.contornoBusto      || '',
        contornoBajoBusto:  latest?.upper?.contornoBajoBusto  || '',
        contornoCintura:    latest?.upper?.contornoCintura    || '',
        contornoCadera:     latest?.upper?.contornoCadera     || '',
        // Anchos y alturas
        hombros:            latest?.upper?.hombros            || '',
        anchoHombro:        latest?.upper?.anchoHombro        || '',
        caidaHombro:        latest?.upper?.caidaHombro        || '',
        anchoBusto:         latest?.upper?.anchoBusto         || '',
        alturaBusto:        latest?.upper?.alturaBusto        || '',
        alturaCapdera:      latest?.upper?.alturaCapdera      || '',
        // Largos del torso
        largoTalle:         latest?.upper?.largoTalle         || '',
        largoTalleCentro:   latest?.upper?.largoTalleCentro   || '',
      },
      arms: {
        largoBrazo:         latest?.arms?.largoBrazo         || latest?.upper?.largoBrazo || '',
        contornoBiceps:     latest?.arms?.contornoBiceps     || latest?.upper?.contornoBiceps || '',
        bajoElBrazo:        latest?.arms?.bajoElBrazo        || '',
        contornoCodo:       latest?.arms?.contornoCodo       || '',
        contornoMuneca:     latest?.arms?.contornoMuneca     || '',
        contornoPuno:       latest?.arms?.contornoPuno       || '',
      },
      pants: {
        contornoCintura:    latest?.pants?.contornoCintura   || '',
        alturaCadera:       latest?.pants?.alturaCadera      || '',
        contornoCadera:     latest?.pants?.contornoCadera    || '',
        alturaAsiento:      latest?.pants?.alturaAsiento     || '',
        largoPantalon:      latest?.pants?.largoPantalon     || '',
        largoFalda:         latest?.pants?.largoFalda        || '',
      },
      lower: {
        largoTalleTrasero:     latest?.lower?.largoTalleTrasero     || '',
        anchoHombrosTrasero:   latest?.lower?.anchoHombrosTrasero   || '',
        largoCentroTrasero:    latest?.lower?.largoCentroTrasero    || '',
        reboqueCuelloTrasero:  latest?.lower?.reboqueCuelloTrasero  || '',
        largoCaidaTrasero:     latest?.lower?.largoCaidaTrasero     || '',
        anchoToraxTrasero:     latest?.lower?.anchoToraxTrasero     || '',
        anchoOmoplatosTrasero: latest?.lower?.anchoOmoplatosTrasero || '',
        anchoCinturaTrasero:   latest?.lower?.anchoCinturaTrasero   || '',
      },
    },
  })

  const { mutateAsync } = useMutation(
    (data) => measureService.create(id, data),
    {
      onSuccess: () => {
        qc.invalidateQueries(['measures', id])
        qc.invalidateQueries(['measures-latest', id])
        qc.invalidateQueries(['client', id])
      },
    }
  )

  const onSubmit = async (data) => {
    const clean = (obj) =>
      Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== '' && !Number.isNaN(v))
      )
    try {
      await mutateAsync({
        ...data, 
        upper: clean(data.upper), 
        arms: clean(data.arms),
        pants: clean(data.pants),
        lower: clean(data.lower)
      })
      toast.success('Medidas guardadas correctamente')
      navigate(`/clients/${id}`)
    } catch (err) {
      toast.error(err.message || 'Error al guardar')
    }
  }

  const handlePDF = () => {
    const formData = watch()
    if (clientData && formData) {
      generatePDF(clientData, formData, { name: user?.studioName || 'Atelier Elizabeth' })
      toast.success('PDF generado')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-xl tablet:text-2xl font-bold text-gray-900">
              Medidas de {clientData?.name || '...'}
            </h1>
            <p className="text-gray-400 text-sm">Nueva sesión de medición</p>
          </div>
        </div>
        <button onClick={handlePDF} className="btn-secondary">
          <FileText className="w-5 h-5" />
          <span className="hidden tablet:inline">Ficha PDF</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Etiqueta de la sesión */}
        <div className="card">
          <label className="measure-label">Nombre de la sesión / prenda</label>
          <input
            {...register('label')}
            type="text"
            placeholder="Ej: Vestido de boda, Traje de gala..."
            className="input-field mt-1"
          />
        </div>

        {/* ── MEDIDAS DELANTERAS ── */}
        <MeasureSection title="Medidas Delanteras" colorClass="bg-primary-500">
          {/* Contornos del torso */}
          <MeasureField register={register} name="upper.contornoCuello"     label="Contorno de cuello"      description="Circunferencia del cuello" />
          <MeasureField register={register} name="upper.contornoSobreBusto" label="Contorno sobre busto"    description="Por encima del pecho" />
          <MeasureField register={register} name="upper.contornoBusto"      label="Contorno de busto"       description="Medida más amplia del pecho" />
          <MeasureField register={register} name="upper.contornoBajoBusto"  label="Contorno de bajo busto"  description="Justo debajo del busto" />
          <MeasureField register={register} name="upper.contornoCintura"    label="Contorno de cintura"     description="Parte más estrecha del torso" />
          <MeasureField register={register} name="upper.contornoCadera"     label="Contorno de cadera"      description="Parte más amplia de la cadera" />
          {/* Anchos y alturas */}
          <MeasureField register={register} name="upper.hombros"            label="Hombros"                 description="De hombro a hombro por la espalda" />
          <MeasureField register={register} name="upper.anchoHombro"        label="Ancho de hombro"         description="De punta a punta de hombro" />
          <MeasureField register={register} name="upper.caidaHombro"        label="Caída de hombro"         description="Diferencia de nivel entre hombros" />
          <MeasureField register={register} name="upper.anchoBusto"         label="Ancho de busto"          description="Ancho del pecho de costado a costado" />
          <MeasureField register={register} name="upper.alturaBusto"        label="Altura de busto"         description="De hombro al punto más alto del busto" />
          <MeasureField register={register} name="upper.alturaCapdera"      label="Altura de cadera"        description="De cintura a la parte más ancha de la cadera" />
          {/* Largos del torso */}
          <MeasureField register={register} name="upper.largoTalle"         label="Largo de talle"          description="De hombro a cintura por delante" />
          <MeasureField register={register} name="upper.largoTalleCentro"   label="Largo de talle centro"   description="De cuello al centro de cintura" />
        </MeasureSection>

        {/* ── MEDIDAS DE BRAZO ── */}
        <MeasureSection title="Medidas de Brazo" colorClass="bg-blue-500">
          <MeasureField register={register} name="arms.largoBrazo"         label="Largo de brazo"          description="Del hombro a la muñeca" />
          <MeasureField register={register} name="arms.contornoBiceps"     label="Contorno de bíceps"      description="Circunferencia del bíceps" />
          <MeasureField register={register} name="arms.bajoElBrazo"        label="Bajo el brazo"           description="Medida bajo la axila" />
          <MeasureField register={register} name="arms.contornoCodo"       label="Contorno de codo"        description="Circunferencia del codo" />
          <MeasureField register={register} name="arms.contornoMuneca"     label="Contorno de muñeca"     description="Circunferencia de la muñeca" />
          <MeasureField register={register} name="arms.contornoPuno"       label="Contorno de puño"       description="Circunferencia del puño" />
        </MeasureSection>

        {/* ── MEDIDAS DE PANTALÓN O FALDA ── */}
        <MeasureSection title="Medidas de Pantalón o Falda" colorClass="bg-green-500">
          <MeasureField register={register} name="pants.contornoCintura"   label="Contorno de cintura"     description="Circunferencia de la cintura" />
          <MeasureField register={register} name="pants.alturaCadera"      label="Altura de cadera"        description="De cintura a cadera" />
          <MeasureField register={register} name="pants.contornoCadera"    label="Contorno de cadera"      description="Circunferencia de la cadera" />
          <MeasureField register={register} name="pants.alturaAsiento"     label="Altura de asiento"       description="Altura del asiento" />
          <MeasureField register={register} name="pants.largoPantalon"     label="Largo de pantalón"       description="Largo total del pantalón" />
          <MeasureField register={register} name="pants.largoFalda"        label="Largo de falda"          description="Largo total de la falda" />
        </MeasureSection>

        {/* ── MEDIDAS TRASERAS ── */}
        <MeasureSection title="Medidas Traseras" colorClass="bg-accent-500">
          <MeasureField register={register} name="lower.largoTalleTrasero"     label="Largo de talle trasero"    description="De hombro a cintura por la espalda" />
          <MeasureField register={register} name="lower.anchoHombrosTrasero"   label="Ancho de hombros trasero"  description="De hombro a hombro por la espalda" />
          <MeasureField register={register} name="lower.largoCentroTrasero"    label="Largo centro trasero"      description="Del cuello al centro de la cintura por espalda" />
          <MeasureField register={register} name="lower.reboqueCuelloTrasero"  label="Reboque de cuello" description="Reboque del cuello en la espalda" />
          <MeasureField register={register} name="lower.largoCaidaTrasero"     label="Largo caída trasero"       description="Caída de la espalda" />
          <MeasureField register={register} name="lower.anchoToraxTrasero"     label="Ancho tórax trasero"       description="Ancho del tórax por la espalda" />
          <MeasureField register={register} name="lower.anchoOmoplatosTrasero" label="Ancho omóplatos trasero"   description="Ancho de los omóplatos" />
          <MeasureField register={register} name="lower.anchoCinturaTrasero"   label="Ancho de cintura trasero"  description="Ancho de la cintura por la espalda" />
        </MeasureSection>

        {/* ── DETALLES TÉCNICOS ── */}
        <div className="card space-y-4">
          <h3 className="section-title">Detalles técnicos</h3>

          <div>
            <label className="measure-label mb-2 block">Tipo de ajuste</label>
            <div className="grid grid-cols-3 gap-3">
              {['ceñido', 'regular', 'holgado'].map((fit) => {
                const current = watch('fitType')
                return (
                  <label
                    key={fit}
                    className={clsx(
                      'flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all min-h-[touch]',
                      current === fit
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <input {...register('fitType')} type="radio" value={fit} className="sr-only" />
                    <span className="text-xl">
                      {fit === 'ceñido' ? '✦' : fit === 'regular' ? '◆' : '◇'}
                    </span>
                    <span className="text-sm font-medium capitalize">{fit}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <label className="measure-label">Tipo de tela</label>
            <input
              {...register('fabricType')}
              type="text"
              placeholder="Ej: Seda, Algodón, Encaje..."
              className="input-field mt-1"
            />
          </div>

          <div>
            <label className="measure-label">Notas técnicas</label>
            <textarea
              {...register('technicalNotes')}
              rows={4}
              placeholder="Observaciones especiales, detalles del diseño, ajustes necesarios..."
              className="input-field resize-none mt-1"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting
              ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Save className="w-5 h-5" /> Guardar medidas</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}
