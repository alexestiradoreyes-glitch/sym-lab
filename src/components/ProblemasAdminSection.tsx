'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Search, ChevronDown, ChevronUp, Mail, Building,
  Calendar, FileText, X, Trash2, RefreshCw, Send,
} from 'lucide-react'
import type { Problema, EstadoProblema } from '@/lib/types'
import {
  ESTADOS_PROBLEMA, ESTADO_PROBLEMA_COLORES,
  IMPACTO_COLORES, FRECUENCIA_COLORES,
} from '@/lib/types'

const PROBLEMAS_POR_PAGINA = 20

interface AdminData {
  estado: EstadoProblema
  respuestaEquipo?: string
  solucionOficial?: string
  proximosPasos?: string
  responsable?: string
  fechaEstimada?: string
}

interface Props {
  problemas: Problema[]
}

export default function ProblemasAdminSection({ problemas }: Props) {
  const [busqueda,        setBusqueda]        = useState('')
  const [expandido,       setExpandido]       = useState<string | null>(null)
  const [adminData,       setAdminData]       = useState<Record<string, AdminData>>({})
  const [problemasVivos,  setProblemasVivos]  = useState<Problema[]>(problemas)
  const [aEliminar,       setAEliminar]       = useState<Problema | null>(null)
  const [eliminando,      setEliminando]      = useState(false)
  const [eliminarError,   setEliminarError]   = useState<string | null>(null)
  const [refreshing,      setRefreshing]      = useState(false)
  const [pagina,          setPagina]          = useState(1)
  const [guardandoResp,   setGuardandoResp]   = useState<string | null>(null)

  const [respuestas, setRespuestas] = useState<Record<string, {
    respuestaEquipo: string
    solucionOficial: string
    proximosPasos: string
    responsable: string
    fechaEstimada: string
  }>>({})

  const refetch = useCallback(() => {
    fetch('/api/problemas')
      .then(r => r.ok ? r.json() : null)
      .then((data: Problema[] | null) => { if (data) setProblemasVivos(data) })
      .catch(() => {})
  }, [])

  useEffect(() => { refetch() }, [refetch])

  useEffect(() => {
    fetch('/api/problemas/estado')
      .then(r => r.ok ? r.json() : {})
      .then(setAdminData)
      .catch(() => {})
  }, [])

  const handleRefrescar = async () => {
    setRefreshing(true)
    await fetch('/api/problemas').then(r => r.ok ? r.json() : null).then((d: Problema[] | null) => { if (d) setProblemasVivos(d) }).catch(() => {})
    setRefreshing(false)
  }

  const cambiarEstado = async (p: Problema, estado: EstadoProblema) => {
    setAdminData(prev => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), estado } }))
    await fetch('/api/problemas/estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemaId: p.id, estado }),
    }).catch(() => {})
  }

  const guardarRespuesta = async (p: Problema) => {
    const r = respuestas[p.id] || {}
    setGuardandoResp(p.id)
    await fetch('/api/problemas/estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemaId:      p.id,
        respuestaEquipo: r.respuestaEquipo || '',
        solucionOficial: r.solucionOficial || '',
        proximosPasos:   r.proximosPasos   || '',
        responsable:     r.responsable     || '',
        fechaEstimada:   r.fechaEstimada   || '',
      }),
    })
    setAdminData(prev => ({
      ...prev,
      [p.id]: {
        ...(prev[p.id] || {} as AdminData),
        respuestaEquipo: r.respuestaEquipo,
        solucionOficial: r.solucionOficial,
        proximosPasos:   r.proximosPasos,
        responsable:     r.responsable,
        fechaEstimada:   r.fechaEstimada,
      },
    }))
    setGuardandoResp(null)
  }

  const confirmarEliminar = async () => {
    if (!aEliminar) return
    setEliminando(true)
    setEliminarError(null)
    try {
      const res = await fetch(`/api/problemas?id=${aEliminar.id}`, { method: 'DELETE' })
      if (res.ok) {
        setProblemasVivos(prev => prev.filter(p => p.id !== aEliminar.id))
        setExpandido(null)
        setAEliminar(null)
      } else {
        const json = await res.json().catch(() => ({}))
        setEliminarError(json.error || 'No se pudo eliminar.')
      }
    } catch {
      setEliminarError('Error de conexión.')
    } finally {
      setEliminando(false)
    }
  }

  const filtrados = useMemo(() => {
    if (!busqueda) return problemasVivos
    const q = busqueda.toLowerCase()
    return problemasVivos.filter(p =>
      p.titulo.toLowerCase().includes(q) ||
      p.nombre.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)  ||
      p.descripcion.toLowerCase().includes(q)
    )
  }, [problemasVivos, busqueda])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PROBLEMAS_POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const pagElem      = filtrados.slice((paginaActual - 1) * PROBLEMAS_POR_PAGINA, paginaActual * PROBLEMAS_POR_PAGINA)

  const setResp = (id: string, campo: string, valor: string) =>
    setRespuestas(prev => ({ ...prev, [id]: { ...(prev[id] || { respuestaEquipo: '', solucionOficial: '', proximosPasos: '', responsable: '', fechaEstimada: '' }), [campo]: valor } }))

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total problemas',  valor: problemasVivos.length },
          { label: 'Nuevos',           valor: problemasVivos.filter(p => (adminData[p.id]?.estado ?? p.estado ?? 'Nuevo') === 'Nuevo').length },
          { label: 'En análisis',      valor: problemasVivos.filter(p => (adminData[p.id]?.estado ?? p.estado ?? 'Nuevo') === 'En análisis').length },
          { label: 'Resueltos',        valor: problemasVivos.filter(p => (adminData[p.id]?.estado ?? p.estado ?? 'Nuevo') === 'Resuelto').length },
        ].map(({ label, valor }) => (
          <div key={label} className="card p-5">
            <p className="text-3xl font-black text-white">{valor}</p>
            <p className="text-slate-500 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Buscador + refresh */}
      <div className="card p-5">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text" value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
              placeholder="Buscar por título, nombre, email..."
              className="input-field pl-10"
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button onClick={handleRefrescar} disabled={refreshing}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-sym-bord hover:border-slate-500 bg-black/30 hover:bg-white/10 py-2 px-3 rounded-xl transition-all disabled:opacity-40">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-slate-600 text-xs mt-3">
          Mostrando <strong className="text-slate-400">{filtrados.length}</strong> de {problemasVivos.length} problemas
        </p>
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="card p-16 text-center">
          <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">No hay problemas registrados todavía.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pagElem.map(p => {
            const estado = adminData[p.id]?.estado ?? p.estado ?? 'Nuevo'
            const respLocal = respuestas[p.id] || {
              respuestaEquipo: adminData[p.id]?.respuestaEquipo || '',
              solucionOficial: adminData[p.id]?.solucionOficial || '',
              proximosPasos:   adminData[p.id]?.proximosPasos   || '',
              responsable:     adminData[p.id]?.responsable     || '',
              fechaEstimada:   adminData[p.id]?.fechaEstimada   || '',
            }

            return (
              <div key={p.id} className="card overflow-hidden">
                {/* Fila principal */}
                <button
                  className="w-full text-left p-5 flex items-start gap-4 hover:bg-sym-surf/50 transition-colors"
                  onClick={() => setExpandido(expandido === p.id ? null : p.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${IMPACTO_COLORES[p.impacto]}`}>
                        {p.impacto}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full ${FRECUENCIA_COLORES[p.frecuencia]}`}>
                        {p.frecuencia}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full ${ESTADO_PROBLEMA_COLORES[estado as EstadoProblema]}`}>
                        {estado}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400">{p.area}</span>
                    </div>
                    <h3 className="text-white font-semibold text-base leading-snug mb-1 truncate">{p.titulo}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="font-medium text-slate-400">{p.nombre}</span>
                      {p.empresa && <span className="flex items-center gap-1"><Building className="w-3 h-3" />{p.empresa}</span>}
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.fechaEnvio}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-slate-600">
                    {expandido === p.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Detalle expandido */}
                {expandido === p.id && (
                  <div className="border-t border-sym-bord p-6 bg-sym-surf/30 space-y-5">

                    {/* Contacto */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Contacto</p>
                        <p className="flex items-center gap-2 text-sm text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <a href={`mailto:${p.email}`} className="hover:text-sym-red transition-colors">{p.email}</a>
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Identificador</p>
                        <code className="text-xs text-slate-400 font-mono break-all">{p.id}</code>
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="border-l-4 border-orange-600 pl-4 py-1">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Descripción del problema</p>
                      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{p.descripcion}</p>
                    </div>

                    {p.contexto?.trim() && (
                      <div className="border-l-4 border-yellow-600 pl-4 py-1">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Contexto</p>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{p.contexto}</p>
                      </div>
                    )}

                    {p.solucionPropuesta?.trim() && (
                      <div className="border-l-4 border-blue-600 pl-4 py-1">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Solución propuesta por el usuario</p>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{p.solucionPropuesta}</p>
                      </div>
                    )}

                    {p.beneficioEsperado?.trim() && (
                      <div className="border-l-4 border-green-600 pl-4 py-1">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Beneficio esperado</p>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{p.beneficioEsperado}</p>
                      </div>
                    )}

                    {p.recursosNecesarios?.trim() && (
                      <div className="border-l-4 border-purple-600 pl-4 py-1">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Recursos necesarios</p>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{p.recursosNecesarios}</p>
                      </div>
                    )}

                    {/* Estado */}
                    <div className="border-t border-sym-bord/60 pt-5">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5" />Estado del problema
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ESTADOS_PROBLEMA.map(e => (
                          <button key={e} onClick={() => cambiarEstado(p, e)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              estado === e
                                ? `${ESTADO_PROBLEMA_COLORES[e]} border-current ring-1 ring-current font-semibold`
                                : 'bg-sym-surf/40 text-slate-500 border-sym-bord/60 hover:text-slate-300'
                            }`}>
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Respuesta del administrador */}
                    <div className="border-t border-sym-bord/60 pt-5">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5" />Respuesta del equipo
                      </p>
                      <div className="space-y-3">
                        {[
                          { campo: 'respuestaEquipo', label: 'Respuesta del equipo', placeholder: '¿Se acepta, se estudiará, se rechaza o necesita más información?' },
                          { campo: 'solucionOficial',  label: 'Solución oficial propuesta', placeholder: 'Solución aprobada o recomendada por el equipo.' },
                          { campo: 'proximosPasos',    label: 'Próximos pasos', placeholder: '¿Qué se hará a continuación?' },
                        ].map(({ campo, label, placeholder }) => (
                          <div key={campo}>
                            <label className="text-slate-500 text-xs block mb-1">{label}</label>
                            <textarea rows={3} className="input-field text-sm resize-y" placeholder={placeholder}
                              value={(respLocal as Record<string, string>)[campo] || ''}
                              onChange={e => setResp(p.id, campo, e.target.value)}
                            />
                          </div>
                        ))}
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-500 text-xs block mb-1">Responsable asignado</label>
                            <input type="text" className="input-field text-sm" placeholder="Nombre del responsable"
                              value={respLocal.responsable || ''}
                              onChange={e => setResp(p.id, 'responsable', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-slate-500 text-xs block mb-1">Fecha estimada de revisión</label>
                            <input type="date" className="input-field text-sm"
                              value={respLocal.fechaEstimada || ''}
                              onChange={e => setResp(p.id, 'fechaEstimada', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button onClick={() => guardarRespuesta(p)} disabled={guardandoResp === p.id}
                            className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
                            <Send className="w-3.5 h-3.5" />
                            {guardandoResp === p.id ? 'Guardando...' : 'Guardar respuesta'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Eliminar */}
                    <div className="border-t border-sym-bord/60 pt-5 flex justify-end">
                      <button onClick={() => setAEliminar(p)}
                        className="flex items-center gap-2 text-xs text-red-500 hover:text-red-400 hover:bg-red-900/20 border border-red-800/40 px-3 py-2 rounded-xl transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />Eliminar problema
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={paginaActual === 1}
            className="px-3 py-2 rounded-lg border border-sym-bord text-slate-400 hover:text-white disabled:opacity-30 transition-all text-sm">
            ← Anterior
          </button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPagina(n)}
              className={`w-9 h-9 rounded-lg border text-sm font-medium transition-all ${n === paginaActual ? 'bg-sym-red border-sym-red text-white' : 'border-sym-bord text-slate-400 hover:text-white'}`}>
              {n}
            </button>
          ))}
          <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas}
            className="px-3 py-2 rounded-lg border border-sym-bord text-slate-400 hover:text-white disabled:opacity-30 transition-all text-sm">
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal eliminar */}
      {aEliminar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAEliminar(null)} />
          <div className="relative bg-sym-card border border-red-800/50 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Eliminar problema</h3>
                <p className="text-slate-400 text-sm">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm bg-sym-surf/50 rounded-xl p-4 border border-sym-bord/60">
              ¿Seguro que quieres eliminar <strong className="text-white">"{aEliminar.titulo}"</strong>?
            </p>
            {eliminarError && <p className="text-red-400 text-xs bg-red-950/40 border border-red-800/40 rounded-xl px-4 py-3">{eliminarError}</p>}
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setAEliminar(null); setEliminarError(null) }}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-sym-bord rounded-xl hover:bg-white/5 transition-colors">
                Cancelar
              </button>
              <button onClick={confirmarEliminar} disabled={eliminando}
                className="px-4 py-2 text-sm bg-red-700 hover:bg-red-600 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50">
                <Trash2 className="w-3.5 h-3.5" />
                {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
