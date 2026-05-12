'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload, X, FileText, ImageIcon, AlertCircle,
  Loader2, ChevronRight, File as FileIcon, CheckCircle2,
} from 'lucide-react'
import {
  FRECUENCIAS_PROBLEMA, IMPACTOS_PROBLEMA, AREAS_PROBLEMA,
} from '@/lib/types'

const schema = z.object({
  nombre:             z.string().min(2, 'Mínimo 2 caracteres').max(120),
  email:              z.string().email('Introduce un email válido'),
  empresa:            z.string().max(120).optional(),
  titulo:             z.string().min(5, 'Mínimo 5 caracteres').max(200, 'Máximo 200 caracteres'),
  descripcion:        z.string().min(10, 'Mínimo 10 caracteres').max(5000),
  contexto:           z.string().max(2000).optional(),
  frecuencia:         z.enum(['Puntual', 'Frecuente', 'Muy frecuente', 'Constante'], {
    required_error: 'Selecciona la frecuencia',
  }),
  impacto:            z.enum(['Bajo', 'Medio', 'Alto', 'Crítico'], {
    required_error: 'Selecciona el nivel de impacto',
  }),
  area:               z.enum(['Operaciones', 'Clientes', 'Producto', 'Equipo', 'Administración', 'Tecnología', 'Otra'], {
    required_error: 'Selecciona el área',
  }),
  enlacesReferencia:  z.string().max(2000).optional(),
})

type FormValues = z.infer<typeof schema>

const MAX_ARCHIVOS  = 5
const MAX_TAMANO_MB = 10
const TIPOS_VALIDOS = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

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

interface ProblemaFormProps {
  onSuccess?: () => void
}

export default function ProblemaForm({ onSuccess }: ProblemaFormProps = {}) {
  const [archivos, setArchivos]         = useState<File[]>([])
  const [archivoError, setArchivoError] = useState<string | null>(null)
  const [dragOver, setDragOver]         = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError]   = useState<string | null>(null)
  const [enviado, setEnviado]           = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router   = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const descripcion = watch('descripcion') ?? ''

  const agregarArchivos = useCallback((nuevos: FileList | File[]) => {
    setArchivoError(null)
    const lista = Array.from(nuevos)
    if (lista.some(f => !TIPOS_VALIDOS.includes(f.type))) {
      setArchivoError('Tipo no permitido. Usa imágenes, PDF o documentos Word/Excel.')
      return
    }
    if (lista.some(f => f.size > MAX_TAMANO_MB * 1024 * 1024)) {
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

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)
    const fd = new FormData()
    ;(Object.keys(data) as (keyof FormValues)[]).forEach(key => {
      const val = data[key]
      if (val !== undefined && val !== null) fd.append(key, String(val))
    })
    archivos.forEach(f => fd.append('archivos', f))

    try {
      const res  = await fetch('/api/problemas', { method: 'POST', body: fd })
      const json = await res.json()
      if (res.ok) {
        if (onSuccess) {
          setEnviado(true)
          setTimeout(() => { setEnviado(false); onSuccess() }, 2000)
        } else {
          router.push(`/problemas/gracias?id=${json.id}`)
        }
      } else {
        setSubmitError(json.error || 'Error al enviar. Inténtalo de nuevo.')
      }
    } catch {
      setSubmitError('Error de conexión. Comprueba tu internet e inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (enviado) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <CheckCircle2 className="w-14 h-14 text-green-400" />
        <p className="text-white font-bold text-xl">¡Problema enviado correctamente!</p>
        <p className="text-slate-400 text-sm">Redirigiendo al registro...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7 sm:space-y-10" noValidate>

      {submitError && (
        <div className="bg-red-950/60 border border-red-800/60 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{submitError}</p>
        </div>
      )}

      {/* ─── 1: Datos personales ─── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="w-7 h-7 bg-sym-red rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</span>
          <div>
            <h2 className="text-white font-bold text-lg">Datos de contacto</h2>
            <p className="text-slate-500 text-sm">¿Quién expone este problema?</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label htmlFor="nombre" className="input-label">Nombre y apellidos <span className="text-sym-red">*</span></label>
            <input id="nombre" type="text" className="input-field" placeholder="Nombre y apellidos" {...register('nombre')} />
            {errors.nombre && <p className="input-error"><AlertCircle className="w-3 h-3" />{errors.nombre.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="input-label">Correo electrónico <span className="text-sym-red">*</span></label>
            <input id="email" type="email" className="input-field" placeholder="ejemplo@empresa.com" {...register('email')} />
            {errors.email && <p className="input-error"><AlertCircle className="w-3 h-3" />{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="empresa" className="input-label">Departamento</label>
            <input id="empresa" type="text" className="input-field" {...register('empresa')} />
          </div>
        </div>
      </section>

      <div className="border-t border-sym-bord" />

      {/* ─── 2: El problema ─── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="w-7 h-7 bg-sym-red rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</span>
          <div>
            <h2 className="text-white font-bold text-lg">El problema</h2>
            <p className="text-slate-500 text-sm">Descríbelo con el mayor detalle posible</p>
          </div>
        </div>
        <div className="space-y-5">

          <div>
            <label htmlFor="titulo" className="input-label">Título del problema <span className="text-sym-red">*</span></label>
            <input id="titulo" type="text" className="input-field" placeholder="Resume el problema en pocas palabras" {...register('titulo')} />
            {errors.titulo && <p className="input-error"><AlertCircle className="w-3 h-3" />{errors.titulo.message}</p>}
          </div>

          <div>
            <label htmlFor="descripcion" className="input-label">Descripción del problema <span className="text-sym-red">*</span></label>
            <textarea id="descripcion" rows={6} className="input-field resize-y"
              placeholder="¿Qué ocurre exactamente? ¿Cómo se manifiesta? ¿Qué consecuencias tiene?"
              {...register('descripcion')}
            />
            <div className="flex justify-between mt-1">
              <span />
              <span className="text-xs text-slate-600">{descripcion.length} / 5000</span>
            </div>
            {errors.descripcion && <p className="input-error"><AlertCircle className="w-3 h-3" />{errors.descripcion.message}</p>}
          </div>

          <div>
            <label htmlFor="contexto" className="input-label">
              Contexto del problema <span className="text-slate-600 font-normal">(opcional)</span>
            </label>
            <textarea id="contexto" rows={4} className="input-field resize-y"
              placeholder="¿Dónde ocurre? ¿Cuándo ocurre? ¿A quién afecta? ¿Con qué frecuencia?"
              {...register('contexto')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Frecuencia */}
            <div>
              <label htmlFor="frecuencia" className="input-label">Frecuencia <span className="text-sym-red">*</span></label>
              <select id="frecuencia" className="input-field" {...register('frecuencia')}>
                <option value="">— Selecciona —</option>
                {FRECUENCIAS_PROBLEMA.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              {errors.frecuencia && <p className="input-error"><AlertCircle className="w-3 h-3" />{errors.frecuencia.message}</p>}
            </div>

            {/* Impacto */}
            <div>
              <label htmlFor="impacto" className="input-label">Nivel de impacto <span className="text-sym-red">*</span></label>
              <select id="impacto" className="input-field" {...register('impacto')}>
                <option value="">— Selecciona —</option>
                {IMPACTOS_PROBLEMA.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              {errors.impacto && <p className="input-error"><AlertCircle className="w-3 h-3" />{errors.impacto.message}</p>}
            </div>

            {/* Área */}
            <div>
              <label htmlFor="area" className="input-label">Área relacionada <span className="text-sym-red">*</span></label>
              <select id="area" className="input-field" {...register('area')}>
                <option value="">— Selecciona —</option>
                {AREAS_PROBLEMA.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {errors.area && <p className="input-error"><AlertCircle className="w-3 h-3" />{errors.area.message}</p>}
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-sym-bord" />

      {/* ─── 3: Archivos y referencias ─── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="w-7 h-7 bg-sym-red rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</span>
          <div>
            <h2 className="text-white font-bold text-lg">Documentación de apoyo</h2>
            <p className="text-slate-500 text-sm">Archivos y enlaces que ilustren el problema (opcionales)</p>
          </div>
        </div>

        {/* Upload */}
        <div className="mb-6">
          <p className="input-label">Archivos adjuntos <span className="text-slate-600 font-normal">(opcional)</span></p>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                        ${dragOver ? 'border-sym-red bg-sym-red/5' : 'border-sym-bord hover:border-sym-red/40 hover:bg-sym-surf'}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); agregarArchivos(e.dataTransfer.files) }}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className={`w-8 h-8 mx-auto mb-3 ${dragOver ? 'text-sym-red' : 'text-slate-600'}`} />
            <p className="text-slate-400 text-sm mb-1">
              <span className="text-white font-medium">Haz clic o toca para seleccionar archivos</span>
            </p>
            <p className="text-slate-600 text-xs">PNG, JPG, PDF, DOCX, XLSX · máx. {MAX_ARCHIVOS} archivos de {MAX_TAMANO_MB} MB</p>
          </div>
          <input
            ref={inputRef} type="file" multiple
            accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx"
            className="hidden"
            onChange={e => e.target.files && agregarArchivos(e.target.files)}
          />
          {archivoError && <p className="input-error mt-2"><AlertCircle className="w-3 h-3" />{archivoError}</p>}
          {archivos.length > 0 && (
            <ul className="mt-3 space-y-2">
              {archivos.map((f, i) => (
                <li key={i} className="flex items-center gap-3 bg-sym-surf border border-sym-bord rounded-lg px-4 py-2.5">
                  {icono(f.type)}
                  <span className="text-slate-300 text-sm flex-1 truncate">{f.name}</span>
                  <span className="text-slate-600 text-xs flex-shrink-0">{formatBytes(f.size)}</span>
                  <button type="button" onClick={() => setArchivos(prev => prev.filter((_, j) => j !== i))}
                    className="text-slate-600 hover:text-red-400 transition-colors ml-2" aria-label="Eliminar">
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label htmlFor="enlacesReferencia" className="input-label">
            Enlaces de referencia <span className="text-slate-600 font-normal">(opcional)</span>
          </label>
          <textarea id="enlacesReferencia" rows={3} className="input-field resize-y"
            placeholder="Pega uno o varios enlaces relacionados, uno por línea."
            {...register('enlacesReferencia')}
          />
        </div>
      </section>

      {/* ─── Botón enviar ─── */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full flex items-center justify-center gap-3 text-base py-4"
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" />Enviando el problema...</>
          ) : (
            <>Enviar problema<ChevronRight className="w-5 h-5" /></>
          )}
        </button>
        <p className="text-slate-600 text-xs text-center mt-3">
          Los campos marcados con <span className="text-sym-red">*</span> son obligatorios
        </p>
      </div>
    </form>
  )
}
