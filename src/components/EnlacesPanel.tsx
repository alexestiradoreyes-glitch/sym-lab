'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Link2, Plus, Search, X, Copy, Check,
  ExternalLink, Lightbulb, Trash2, Calendar,
  User, Tag,
} from 'lucide-react'
import { Enlace, CATEGORIAS_ENLACE } from '@/lib/types'
import type { CategoriaEnlace } from '@/lib/types'

const CATEGORIA_COLORES: Record<CategoriaEnlace, string> = {
  'Proyecto':      'bg-blue-900/40 text-blue-300 border-blue-700/40',
  'Tecnología':    'bg-cyan-900/40 text-cyan-300 border-cyan-700/40',
  'Investigación': 'bg-purple-900/40 text-purple-300 border-purple-700/40',
  'Convocatoria':  'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
  'Empresa':       'bg-green-900/40 text-green-300 border-green-700/40',
  'Artículo':      'bg-orange-900/40 text-orange-300 border-orange-700/40',
  'Otro':          'bg-slate-800 text-slate-300 border-slate-700/40',
}

function FormularioEnlace({ onGuardado }: { onGuardado: (e: Enlace) => void }) {
  const [titulo,      setTitulo]      = useState('')
  const [url,         setUrl]         = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria,   setCategoria]   = useState<CategoriaEnlace>('Proyecto')
  const [persona,     setPersona]     = useState('')
  const [enviando,    setEnviando]    = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [abierto,     setAbierto]     = useState(false)

  const handleGuardar = async () => {
    if (!titulo.trim() || !url.trim() || !persona.trim()) {
      setError('Título, URL y nombre son obligatorios.')
      return
    }
    setError(null)
    setEnviando(true)
    try {
      const res = await fetch('/api/enlaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, url, descripcion, categoria, persona }),
      })
      if (res.ok) {
        const nuevo = await res.json()
        onGuardado(nuevo)
        setTitulo('')
        setUrl('')
        setDescripcion('')
        setCategoria('Proyecto')
        setPersona('')
        setAbierto(false)
      } else {
        setError('Error al guardar el enlace.')
      }
    } catch {
      setError('Error de conexión.')
    } finally {
      setEnviando(false)
    }
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="btn-primary flex items-center gap-2 text-sm"
      >
        <Plus className="w-4 h-4" />
        Añadir enlace
      </button>
    )
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-white font-semibold flex items-center gap-2">
          <Link2 className="w-4 h-4 text-sym-red" />
          Nuevo enlace
        </p>
        <button onClick={() => setAbierto(false)} className="text-slate-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="input-label">Título <span className="text-sym-red">*</span></label>
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value.slice(0, 150))}
            placeholder="Nombre descriptivo del enlace"
            className="input-field"
          />
          <p className={`text-xs text-right mt-0.5 ${titulo.length >= 150 ? 'text-red-400' : 'text-slate-600'}`}>{titulo.length}/150</p>
        </div>
        <div>
          <label className="input-label">Persona que lo añade <span className="text-sym-red">*</span></label>
          <input
            type="text"
            value={persona}
            onChange={e => setPersona(e.target.value)}
            placeholder="Tu nombre"
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="input-label">URL <span className="text-sym-red">*</span></label>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value.slice(0, 500))}
          placeholder="https://..."
          className="input-field"
        />
        <p className={`text-xs text-right mt-0.5 ${url.length >= 500 ? 'text-red-400' : 'text-slate-600'}`}>{url.length}/500</p>
      </div>

      <div>
        <label className="input-label">Descripción breve</label>
        <textarea
          value={descripcion}
          onChange={e => setDescripcion(e.target.value.slice(0, 300))}
          placeholder="¿De qué trata este enlace? ¿Por qué es relevante?"
          rows={2}
          className="input-field resize-none"
        />
        <p className={`text-xs text-right mt-0.5 ${descripcion.length >= 300 ? 'text-red-400' : 'text-slate-600'}`}>{descripcion.length}/300</p>
      </div>

      <div>
        <label className="input-label">Categoría</label>
        <select
          value={categoria}
          onChange={e => setCategoria(e.target.value as CategoriaEnlace)}
          className="input-field"
        >
          {CATEGORIAS_ENLACE.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex justify-end gap-3 pt-1">
        <button onClick={() => setAbierto(false)} className="btn-secondary text-sm py-2 px-4">
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          disabled={enviando}
          className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
        >
          <Link2 className="w-4 h-4" />
          {enviando ? 'Guardando...' : 'Guardar enlace'}
        </button>
      </div>
    </div>
  )
}

function TarjetaEnlace({
  enlace,
  onEliminar,
}: {
  enlace: Enlace
  onEliminar: (id: string) => void
}) {
  const [copiado,    setCopiado]    = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const router = useRouter()

  const copiar = () => {
    navigator.clipboard.writeText(enlace.url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const crearIdea = () => {
    router.push(`/ideas/nueva?enlace=${encodeURIComponent(enlace.url)}`)
  }

  const eliminar = async () => {
    if (!confirm('¿Eliminar este enlace?')) return
    setEliminando(true)
    try {
      const res = await fetch(`/api/enlaces?id=${enlace.id}`, { method: 'DELETE' })
      if (res.ok) onEliminar(enlace.id)
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="card p-5 flex flex-col gap-3 card-hover">
      {/* Cabecera */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-xs px-2.5 py-0.5 rounded-full border ${CATEGORIA_COLORES[enlace.categoria]}`}>
              {enlace.categoria}
            </span>
          </div>
          <h3 className="text-white font-semibold text-base leading-snug">{enlace.titulo}</h3>
        </div>
      </div>

      {/* URL */}
      <a
        href={enlace.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm break-all underline"
      >
        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
        {enlace.url}
      </a>

      {/* Descripción */}
      {enlace.descripcion && (
        <p className="text-slate-400 text-sm leading-relaxed">{enlace.descripcion}</p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1 border-t border-sym-bord/50">
        <span className="flex items-center gap-1"><User className="w-3 h-3" />{enlace.persona}</span>
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{enlace.fecha}</span>
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={copiar}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors border border-sym-bord rounded-lg px-3 py-1.5"
        >
          {copiado ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copiado ? 'Copiado' : 'Copiar enlace'}
        </button>
        <button
          onClick={crearIdea}
          className="flex items-center gap-1.5 text-xs text-sym-red hover:text-red-400 transition-colors border border-sym-red/30 rounded-lg px-3 py-1.5"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          Crear idea desde este enlace
        </button>
        <button
          onClick={eliminar}
          disabled={eliminando}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-400 transition-colors ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {eliminando ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </div>
  )
}

export default function EnlacesPanel() {
  const [enlaces,    setEnlaces]    = useState<Enlace[]>([])
  const [cargando,   setCargando]   = useState(true)
  const [busqueda,   setBusqueda]   = useState('')
  const [catFiltro,  setCatFiltro]  = useState<string>('todas')

  useEffect(() => {
    fetch('/api/enlaces')
      .then(r => r.json())
      .then(data => { setEnlaces(data); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  const enlacesFiltrados = useMemo(() => {
    return enlaces.filter(e => {
      if (catFiltro !== 'todas' && e.categoria !== catFiltro) return false
      if (busqueda) {
        const q = busqueda.toLowerCase()
        return (
          e.titulo.toLowerCase().includes(q)      ||
          e.descripcion.toLowerCase().includes(q) ||
          e.url.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [enlaces, busqueda, catFiltro])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-slate-400 text-base">
          Recopila recursos, convocatorias y referencias que puedan inspirar nuevas ideas.
        </p>
        <FormularioEnlace
          onGuardado={nuevo => setEnlaces(prev => [nuevo, ...prev])}
        />
      </div>

      {/* Filtros */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por título, descripción o URL..."
              className="input-field pl-10"
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={catFiltro}
            onChange={e => setCatFiltro(e.target.value)}
            className="input-field flex-shrink-0 w-auto"
          >
            <option value="todas">Todas las categorías</option>
            {CATEGORIAS_ENLACE.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <p className="text-slate-600 text-xs mt-3">
          Mostrando <strong className="text-slate-400">{enlacesFiltrados.length}</strong> de {enlaces.length} enlaces
        </p>
      </div>

      {/* Lista */}
      {cargando ? (
        <div className="card p-16 text-center">
          <p className="text-slate-500">Cargando enlaces...</p>
        </div>
      ) : enlacesFiltrados.length === 0 ? (
        <div className="card p-16 text-center">
          <Tag className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">
            {enlaces.length === 0
              ? 'Todavía no hay enlaces. ¡Añade el primero!'
              : 'No hay enlaces con los filtros seleccionados.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enlacesFiltrados.map(e => (
            <TarjetaEnlace
              key={e.id}
              enlace={e}
              onEliminar={id => setEnlaces(prev => prev.filter(x => x.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
