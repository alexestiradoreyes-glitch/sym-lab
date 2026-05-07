'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Upload, X, FileText, ImageIcon, AlertCircle,
  Loader2, ChevronRight, File as FileIcon, Link2, Mic,
} from 'lucide-react'
import { CATEGORIAS, NIVELES_MADUREZ } from '@/lib/types'
import AudioRecorder from './AudioRecorder'

/* ─── Schema de validación ─── */
const schema = z.object({
  nombre:              z.string().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
  empresa:             z.string().max(120).optional(),
  email:               z.string().email('Introduce un email válido'),
  telefono:            z.string().max(20).optional(),
  titulo:              z.string().min(5, 'Mínimo 5 caracteres').max(200, 'Máximo 200 caracteres'),
  categoria:           z.enum(['Innovación', 'Investigación', 'Desarrollo', 'Mejora de proceso', 'Sostenibilidad', 'Inteligencia artificial', 'Otro'], {
    required_error: 'Selecciona una categoría',
  }),
  descripcion:         z.string().min(50, 'Describe tu idea con al menos 50 caracteres').max(5000),
  problemaResuelve:    z.string().min(20, 'Mínimo 20 caracteres').max(2000),
  beneficiosEsperados: z.string().min(20, 'Mínimo 20 caracteres').max(2000),
  nivelMadurez:        z.enum(['Idea inicial', 'Prototipo', 'Validada parcialmente', 'Lista para desarrollar'], {
    required_error: 'Selecciona el nivel de madurez',
  }),
  enlacesReferencia:   z.string().max(2000).optional(),
  consentimiento: z.boolean().refine(v => v === true, {
    message: 'Debes aceptar el tratamiento de datos para continuar',
  }),
})

type FormValues = z.infer<typeof schema>

const MAX_ARCHIVOS   = 5
const MAX_TAMANO_MB  = 10
const TIPOS_VALIDOS  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif',
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']

/* ─── Helpers UI ─── */
function icono(tipo: string) {
  if (tipo.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-blue-400" />
  if (tipo === 'application/pdf') return <FileText className="w-4 h-4 text-red-400" />
  return <FileIcon className="w-4 h-4 text-slate-400" />
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* ─── Componente ─── */
export default function IdeaForm() {
  const [archivos, setArchivos]           = useState<File[]>([])
  const [archivoError, setArchivoError]   = useState<string | null>(null)
  const [dragOver, setDragOver]           = useState(false)
  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [submitError, setSubmitError]     = useState<string | null>(null)
  const [audioBlob, setAudioBlob]         = useState<Blob | null>(null)
  const [audioDuracion, setAudioDuracion] = useState(0)
  const inputRef     = useRef<HTMLInputElement>(null)
  const router       = useRouter()
  const searchParams = useSearchParams()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  // Pre-rellenar enlace si viene desde la sección de enlaces
  useEffect(() => {
    const enlace = searchParams.get('enlace')
    if (enlace) setValue('enlacesReferencia', enlace)
  }, [searchParams, setValue])

  const descripcion = watch('descripcion') ?? ''

  /* ── Gestión de archivos ── */
  const agregarArchivos = useCallback((nuevos: FileList | File[]) => {
    setArchivoError(null)
    const lista = Array.from(nuevos)

    const invalidos = lista.filter(f => !TIPOS_VALIDOS.includes(f.type))
    if (invalidos.length) {
      setArchivoError('Tipo de archivo no permitido. Usa imágenes, PDF o documentos Word/Excel.')
      return
    }
    const grandes = lista.filter(f => f.size > MAX_TAMANO_MB * 1024 * 1024)
    if (grandes.length) {
      setArchivoError(`Cada archivo debe pesar menos de ${MAX_TAMANO_MB} MB.`)
      return
    }

    setArchivos(prev => {
      const combinados = [...prev, ...lista]
      if (combinados.length > MAX_ARCHIVOS) {
        setArchivoError(`Máximo ${MAX_ARCHIVOS} archivos.`)
        return prev
      }
      return combinados
    })
  }, [])

  const eliminarArchivo = (idx: number) =>
    setArchivos(prev => prev.filter((_, i) => i !== idx))

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    agregarArchivos(e.dataTransfer.files)
  }

  /* ── Envío ── */
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

    const fd = new FormData()
    ;(Object.keys(data) as (keyof FormValues)[]).forEach(key => {
      const val = data[key]
      if (val !== undefined && val !== null) fd.append(key, String(val))
    })
    archivos.forEach(f => fd.append('archivos', f))

    // Upload audio first if the user recorded one
    if (audioBlob) {
      try {
        const afd = new FormData()
        afd.append('audio', audioBlob, 'idea.webm')
        afd.append('contexto', 'ideas')
        const ares = await fetch('/api/audio/upload', { method: 'POST', body: afd })
        if (ares.ok) {
          const { url } = await ares.json()
          fd.append('audioUrl', url)
          fd.append('audioDuracion', String(audioDuracion))
        }
      } catch {
        // Audio upload failure doesn't block idea submission
      }
    }

    try {
      const res = await fetch('/api/ideas', { method: 'POST', body: fd })
      const json = await res.json()

      if (res.ok) {
        router.push(`/gracias?id=${json.id}`)
      } else {
        setSubmitError(json.error || 'Error al enviar. Inténtalo de nuevo.')
      }
    } catch {
      setSubmitError('Error de conexión. Comprueba tu internet e inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ── Componentes internos reutilizables ── */
  const Campo = ({ nombre, label, requerido = false, className = '' }: {
    nombre: keyof FormValues
    label: string
    requerido?: boolean
    className?: string
  }) => (
    <div className={className}>
      <label htmlFor={nombre} className="input-label">
        {label} {requerido && <span className="text-sym-red">*</span>}
      </label>
      <input
        id={nombre}
        type={nombre === 'email' ? 'email' : nombre === 'telefono' ? 'tel' : 'text'}
        className="input-field"
        placeholder={
          nombre === 'email'    ? 'ejemplo@empresa.com' :
          nombre === 'telefono' ? '+34 600 000 000'     :
          nombre === 'nombre'   ? 'Nombre y apellidos'  : ''
        }
        {...register(nombre)}
      />
      {errors[nombre] && (
        <p className="input-error">
          <AlertCircle className="w-3 h-3" />
          {errors[nombre]?.message as string}
        </p>
      )}
    </div>
  )

  /* ── Render ── */
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>

      {/* Error global */}
      {submitError && (
        <div className="bg-red-950/60 border border-red-800/60 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{submitError}</p>
        </div>
      )}

      {/* ─── SECCIÓN 1: Datos personales ─── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="w-7 h-7 bg-sym-red rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</span>
          <div>
            <h2 className="text-white font-bold text-lg">Datos personales</h2>
            <p className="text-slate-500 text-sm">¿Quién propone esta idea?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Campo nombre="nombre"   label="Nombre y apellidos"      requerido className="sm:col-span-2" />
          <Campo nombre="empresa"  label="Empresa u organización"  />
          <Campo nombre="email"    label="Correo electrónico"      requerido />
          <Campo nombre="telefono" label="Teléfono de contacto"    />
        </div>
      </section>

      <div className="border-t border-sym-bord" />

      {/* ─── SECCIÓN 2: La idea ─── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="w-7 h-7 bg-sym-red rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</span>
          <div>
            <h2 className="text-white font-bold text-lg">Tu idea</h2>
            <p className="text-slate-500 text-sm">Cuéntanos en qué consiste</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Título */}
          <div>
            <label htmlFor="titulo" className="input-label">
              Título de la idea <span className="text-sym-red">*</span>
            </label>
            <input
              id="titulo"
              type="text"
              className="input-field"
              placeholder="Un título claro y descriptivo"
              {...register('titulo')}
            />
            {errors.titulo && <p className="input-error"><AlertCircle className="w-3 h-3" />{errors.titulo.message}</p>}
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="categoria" className="input-label">
              Categoría <span className="text-sym-red">*</span>
            </label>
            <select id="categoria" className="input-field" {...register('categoria')}>
              <option value="">— Selecciona una categoría —</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.categoria && <p className="input-error"><AlertCircle className="w-3 h-3" />{errors.categoria.message}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="input-label">
              Descripción completa de la idea <span className="text-sym-red">*</span>
            </label>
            <textarea
              id="descripcion"
              rows={6}
              className="input-field resize-y"
              placeholder="Describe tu idea con el mayor detalle posible. ¿En qué consiste? ¿Cómo funcionaría? ¿Qué tecnologías utilizaría?"
              {...register('descripcion')}
            />
            <div className="flex justify-between mt-1">
              {errors.descripcion
                ? <p className="input-error"><AlertCircle className="w-3 h-3" />{errors.descripcion.message}</p>
                : <span />
              }
              <span className={`text-xs ${descripcion.length < 50 ? 'text-slate-600' : 'text-slate-400'}`}>
                {descripcion.length} / 5000
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-sym-bord" />

      {/* ─── SECCIÓN 3: Impacto ─── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="w-7 h-7 bg-sym-red rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</span>
          <div>
            <h2 className="text-white font-bold text-lg">Impacto y madurez</h2>
            <p className="text-slate-500 text-sm">¿Qué problema resuelve y en qué estado se encuentra?</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Problema */}
          <div>
            <label htmlFor="problemaResuelve" className="input-label">
              Problema que resuelve <span className="text-sym-red">*</span>
            </label>
            <textarea
              id="problemaResuelve"
              rows={4}
              className="input-field resize-y"
              placeholder="¿Qué problema existe actualmente? ¿A quién afecta? ¿Por qué es importante resolverlo?"
              {...register('problemaResuelve')}
            />
            {errors.problemaResuelve && <p className="input-error"><AlertCircle className="w-3 h-3" />{errors.problemaResuelve.message}</p>}
          </div>

          {/* Beneficios */}
          <div>
            <label htmlFor="beneficiosEsperados" className="input-label">
              Beneficios esperados <span className="text-sym-red">*</span>
            </label>
            <textarea
              id="beneficiosEsperados"
              rows={4}
              className="input-field resize-y"
              placeholder="¿Qué mejoras o beneficios aportaría tu idea? ¿Eficiencia, ahorro, sostenibilidad, calidad...?"
              {...register('beneficiosEsperados')}
            />
            {errors.beneficiosEsperados && <p className="input-error"><AlertCircle className="w-3 h-3" />{errors.beneficiosEsperados.message}</p>}
          </div>

          {/* Nivel de madurez */}
          <div>
            <p className="input-label">
              Nivel de madurez de la idea <span className="text-sym-red">*</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NIVELES_MADUREZ.map(nivel => (
                <label
                  key={nivel}
                  className="flex items-center gap-3 p-4 rounded-xl border border-sym-bord bg-sym-surf
                             cursor-pointer hover:border-sym-red/50 transition-colors
                             has-[:checked]:border-sym-red has-[:checked]:bg-sym-red/5"
                >
                  <input
                    type="radio"
                    value={nivel}
                    className="accent-sym-red w-4 h-4 flex-shrink-0"
                    {...register('nivelMadurez')}
                  />
                  <span className="text-slate-300 text-sm font-medium">{nivel}</span>
                </label>
              ))}
            </div>
            {errors.nivelMadurez && <p className="input-error mt-2"><AlertCircle className="w-3 h-3" />{errors.nivelMadurez.message}</p>}
          </div>
        </div>
      </section>

      <div className="border-t border-sym-bord" />

      {/* ─── SECCIÓN 4: Referencias ─── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="w-7 h-7 bg-sym-red rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">4</span>
          <div>
            <h2 className="text-white font-bold text-lg">Referencias externas</h2>
            <p className="text-slate-500 text-sm">Enlaces que inspiraron o complementan esta idea</p>
          </div>
        </div>
        <div>
          <label htmlFor="enlacesReferencia" className="input-label flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" />
            Enlaces de referencia <span className="text-slate-600 font-normal">(opcional)</span>
          </label>
          <textarea
            id="enlacesReferencia"
            rows={3}
            className="input-field resize-y"
            placeholder="Pega uno o varios enlaces relacionados, uno por línea.&#10;https://ejemplo.com&#10;https://otro-recurso.com"
            {...register('enlacesReferencia')}
          />
          {errors.enlacesReferencia && (
            <p className="input-error"><AlertCircle className="w-3 h-3" />{errors.enlacesReferencia.message}</p>
          )}
        </div>
      </section>

      <div className="border-t border-sym-bord" />

      {/* ─── SECCIÓN 5: Audio explicativo ─── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="w-7 h-7 bg-sym-red rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">5</span>
          <div>
            <h2 className="text-white font-bold text-lg">Audio explicativo de la idea</h2>
            <p className="text-slate-500 text-sm">
              Opcional — explica tu idea con tu propia voz
            </p>
          </div>
        </div>
        <AudioRecorder
          onAudioChange={(blob, dur) => { setAudioBlob(blob); setAudioDuracion(dur) }}
          maxSegundos={180}
          disabled={isSubmitting}
        />
        <p className="text-slate-600 text-xs mt-3 flex items-center gap-1.5">
          <Mic className="w-3 h-3" />
          Máximo 3 minutos. El audio se guardará junto con tu idea.
        </p>
      </section>

      <div className="border-t border-sym-bord" />

      {/* ─── SECCIÓN 6: Archivos y consentimiento ─── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="w-7 h-7 bg-sym-red rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">6</span>
          <div>
            <h2 className="text-white font-bold text-lg">Documentación y privacidad</h2>
            <p className="text-slate-500 text-sm">Adjuntos opcionales y consentimiento</p>
          </div>
        </div>

        {/* Upload de archivos */}
        <div className="mb-6">
          <p className="input-label">Archivos adjuntos <span className="text-slate-600 font-normal">(opcional)</span></p>
          <p className="text-slate-600 text-xs mb-3">
            Imágenes, PDF o documentos Word/Excel. Máx. {MAX_ARCHIVOS} archivos de {MAX_TAMANO_MB} MB cada uno.
          </p>

          {/* Zona de drop */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                        ${dragOver ? 'border-sym-red bg-sym-red/5' : 'border-sym-bord hover:border-sym-red/40 hover:bg-sym-surf'}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className={`w-8 h-8 mx-auto mb-3 ${dragOver ? 'text-sym-red' : 'text-slate-600'}`} />
            <p className="text-slate-400 text-sm mb-1">
              <span className="text-white font-medium">Haz clic para seleccionar</span> o arrastra los archivos aquí
            </p>
            <p className="text-slate-600 text-xs">PNG, JPG, PDF, DOCX, XLSX</p>
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx"
            className="hidden"
            onChange={e => e.target.files && agregarArchivos(e.target.files)}
          />

          {archivoError && (
            <p className="input-error mt-2"><AlertCircle className="w-3 h-3" />{archivoError}</p>
          )}

          {/* Lista de archivos seleccionados */}
          {archivos.length > 0 && (
            <ul className="mt-3 space-y-2">
              {archivos.map((f, i) => (
                <li key={i} className="flex items-center gap-3 bg-sym-surf border border-sym-bord rounded-lg px-4 py-2.5">
                  {icono(f.type)}
                  <span className="text-slate-300 text-sm flex-1 truncate">{f.name}</span>
                  <span className="text-slate-600 text-xs flex-shrink-0">{formatBytes(f.size)}</span>
                  <button
                    type="button"
                    onClick={() => eliminarArchivo(i)}
                    className="text-slate-600 hover:text-red-400 transition-colors ml-2"
                    aria-label="Eliminar archivo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Consentimiento RGPD */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="accent-sym-red w-4 h-4 mt-0.5 flex-shrink-0"
              {...register('consentimiento')}
            />
            <span className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
              <span className="text-white font-medium">Acepto el tratamiento de mis datos personales</span> conforme
              al Reglamento General de Protección de Datos (RGPD / UE 2016/679). Los datos facilitados serán
              utilizados exclusivamente para la gestión y evaluación de mi propuesta de innovación por parte de
              SYM LAB, y no serán cedidos a terceros.
              <span className="text-sym-red"> *</span>
            </span>
          </label>
          {errors.consentimiento && (
            <p className="input-error mt-2"><AlertCircle className="w-3 h-3" />{errors.consentimiento.message}</p>
          )}
        </div>
      </section>

      {/* ─── BOTÓN ENVIAR ─── */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full flex items-center justify-center gap-3 text-base py-4"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enviando tu idea...
            </>
          ) : (
            <>
              Enviar mi idea
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
        <p className="text-slate-600 text-xs text-center mt-3">
          Los campos marcados con <span className="text-sym-red">*</span> son obligatorios
        </p>
      </div>
    </form>
  )
}
