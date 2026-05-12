'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ChevronDown, ChevronUp, Calendar, Building,
  AlertCircle, Send, Loader2, CheckCircle2,
  RefreshCw, MessageSquare, Tag,
} from 'lucide-react'
import type { Problema, ProblemasSolucion } from '@/lib/types'
import { IMPACTO_COLORES, FRECUENCIA_COLORES } from '@/lib/types'

/* ─── Subcomponente: historial de soluciones + formulario ─── */
function SeccionSoluciones({ problema, onResuelto }: { problema: Problema; onResuelto: () => void }) {
  const [soluciones,  setSoluciones]  = useState<ProblemasSolucion[]>([])
  const [cargando,    setCargando]    = useState(true)
  const [nombre,      setNombre]      = useState('')
  const [solucion,    setSolucion]    = useState('')
  const [enviando,    setEnviando]    = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [marcando,    setMarcando]    = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const res = await fetch(`/api/problemas/soluciones?problemaId=${problema.id}`)
      if (res.ok) setSoluciones(await res.json())
    } finally {
      setCargando(false)
    }
  }, [problema.id])

  useEffect(() => { cargar() }, [cargar])

  const handleEnviar = async () => {
    if (!nombre.trim()) { setError('Introduce tu nombre.'); return }
    if (!solucion.trim()) { setError('Escribe tu propuesta de solución.'); return }
    setError(null)
    setEnviando(true)
    try {
      const res = await fetch('/api/problemas/soluciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemaId: problema.id, nombre, solucion }),
      })
      if (res.ok) {
        const nueva = await res.json()
        setSoluciones(prev => [...prev, nueva])
        setNombre('')
        setSolucion('')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Error al enviar la propuesta.')
      }
    } catch {
      setError('Error de conexión.')
    } finally {
      setEnviando(false)
    }
  }

  const handleMarcarResuelto = async () => {
    setMarcando(true)
    try {
      await fetch('/api/problemas/estado', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemaId: problema.id, estado: 'Resuelto' }),
      })
      onResuelto()
    } catch {
      setMarcando(false)
    }
  }

  return (
    <div className="border-t border-sym-bord/60 mt-4 pt-5 space-y-5">

      {/* Historial de propuestas */}
      <div>
        <p className="text-slate-500 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" />
          Propuestas de solución ({soluciones.length})
        </p>

        {cargando ? (
          <p className="text-slate-600 text-sm">Cargando propuestas...</p>
        ) : soluciones.length === 0 ? (
          <p className="text-slate-600 text-sm italic">Todavía no hay propuestas. Sé el primero en aportar una.</p>
        ) : (
          <div className="space-y-3">
            {soluciones.map(s => (
              <div key={s.id} className="bg-blue-950/20 border border-blue-800/30 rounded-xl p-4">
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <span className="text-white text-sm font-semibold">{s.nombre}</span>
                  <span className="text-slate-600 text-xs">{s.fechaHora}</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{s.solucion}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulario proponer solución */}
      <div className="bg-sym-surf/40 border border-sym-bord/60 rounded-xl p-4 space-y-3">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Proponer solución</p>

        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Tu nombre o usuario"
          className="input-field text-sm py-2"
        />

        <textarea
          value={solucion}
          onChange={e => setSolucion(e.target.value.slice(0, 2000))}
          placeholder="Describe tu propuesta de solución..."
          rows={4}
          className="input-field text-sm resize-y"
        />
        <p className={`text-xs text-right ${solucion.length >= 2000 ? 'text-red-400' : 'text-slate-600'}`}>
          {solucion.length} / 2000
        </p>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          type="button"
          onClick={handleEnviar}
          disabled={enviando}
          className="btn-primary flex items-center gap-2 text-sm py-2 px-4 ml-auto"
        >
          {enviando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          {enviando ? 'Enviando...' : 'Enviar solución'}
        </button>
      </div>

      {/* Marcar como resuelto */}
      <div className="border-t border-sym-bord/40 pt-4 flex justify-end">
        <button
          type="button"
          onClick={handleMarcarResuelto}
          disabled={marcando}
          className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 bg-green-900/20 hover:bg-green-900/30 border border-green-700/40 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
        >
          {marcando
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <CheckCircle2 className="w-4 h-4" />
          }
          {marcando ? 'Marcando...' : 'Marcar como resuelto'}
        </button>
      </div>
    </div>
  )
}

/* ─── Panel principal del registro ─── */
export default function ProblemaRegistro() {
  const [problemas,   setProblemas]   = useState<Problema[]>([])
  const [cargando,    setCargando]    = useState(true)
  const [expandido,   setExpandido]   = useState<string | null>(null)
  const [refreshing,  setRefreshing]  = useState(false)

  const cargar = useCallback(async () => {
    try {
      const res = await fetch('/api/problemas')
      if (res.ok) {
        const todos: Problema[] = await res.json()
        setProblemas(todos.filter(p => p.estado !== 'Resuelto'))
      }
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const handleRefrescar = async () => {
    setRefreshing(true)
    await cargar()
    setRefreshing(false)
  }

  const handleResuelto = (id: string) => {
    setProblemas(prev => prev.filter(p => p.id !== id))
    setExpandido(null)
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-7 h-7 text-slate-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Cabecera con contador y refresh */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          <span className="text-white font-semibold">{problemas.length}</span>{' '}
          {problemas.length === 1 ? 'problema sin solución' : 'problemas sin solución'}
        </p>
        <button
          onClick={handleRefrescar}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white border border-sym-bord/60 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Lista vacía */}
      {problemas.length === 0 && (
        <div className="card p-16 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500/40 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No hay problemas pendientes de solución.</p>
          <p className="text-slate-600 text-sm mt-1">¡Todos los problemas registrados han sido resueltos!</p>
        </div>
      )}

      {/* Tarjetas de problemas */}
      {problemas.map(p => (
        <div key={p.id} className="card overflow-hidden">

          {/* Cabecera de la tarjeta */}
          <button
            className="w-full text-left p-5 flex items-start gap-4 hover:bg-sym-surf/50 transition-colors"
            onClick={() => setExpandido(expandido === p.id ? null : p.id)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {/* Badge: Sin solución */}
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-900/40 text-red-300 border border-red-700/40">
                  Sin solución
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full ${IMPACTO_COLORES[p.impacto]}`}>
                  Impacto: {p.impacto}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full ${FRECUENCIA_COLORES[p.frecuencia]}`}>
                  {p.frecuencia}
                </span>
                {p.area && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 flex items-center gap-1">
                    <Tag className="w-3 h-3" />{p.area}
                  </span>
                )}
              </div>

              <h3 className="text-white font-semibold text-base leading-snug mb-1">{p.titulo}</h3>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="font-medium text-slate-400">{p.nombre}</span>
                {p.empresa && (
                  <span className="flex items-center gap-1"><Building className="w-3 h-3" />{p.empresa}</span>
                )}
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.fechaEnvio}</span>
              </div>
            </div>

            <div className="flex-shrink-0 text-slate-600 mt-1">
              {expandido === p.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          {/* Detalle expandido */}
          {expandido === p.id && (
            <div className="border-t border-sym-bord px-5 pb-5 bg-sym-surf/20">

              {/* Descripción */}
              <div className="border-l-4 border-orange-600 pl-4 py-1 mt-5">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Descripción del problema</p>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{p.descripcion}</p>
              </div>

              {p.contexto?.trim() && (
                <div className="border-l-4 border-yellow-600 pl-4 py-1 mt-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Contexto</p>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{p.contexto}</p>
                </div>
              )}

              {/* Alerta recordatorio */}
              <div className="mt-4 flex items-start gap-2 bg-orange-950/30 border border-orange-800/30 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <p className="text-orange-200 text-xs leading-relaxed">
                  Este problema todavía no tiene solución. Si conoces una forma de resolverlo, escríbela abajo.
                </p>
              </div>

              {/* Soluciones + formulario */}
              <SeccionSoluciones
                problema={p}
                onResuelto={() => handleResuelto(p.id)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
