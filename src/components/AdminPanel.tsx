'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { supabasePublic } from '@/lib/supabase-public'
import Image from 'next/image'
import {
  Download, Search, ChevronDown, ChevronUp,
  Mail, Building, Phone, Calendar,
  Tag, TrendingUp, FileText, X,
  MessageSquare, Send, Link2, RefreshCw, Trash2,
} from 'lucide-react'
import { Idea, CATEGORIAS, NIVELES_MADUREZ, CATEGORIA_COLORES, MADUREZ_COLORES, ROLES_COMENTARIO, ESTADOS_IDEA, ESTADO_COLORES } from '@/lib/types'
import type { Comentario, RolComentario, EstadoIdea } from '@/lib/types'

const ROL_COLORES: Record<RolComentario, string> = {
  'Autor':          'bg-sym-red/20 text-red-300 border-red-800/40',
  'Revisor':        'bg-blue-900/30 text-blue-300 border-blue-800/40',
  'Administrador':  'bg-purple-900/30 text-purple-300 border-purple-800/40',
  'Colaborador':    'bg-slate-800 text-slate-300 border-slate-700/40',
}

interface Props {
  ideas: Idea[]
}

/* ─── Sub-componente de comentarios por idea ─── */
function SeccionComentarios({ ideaId }: { ideaId: string }) {
  const [comentarios, setComentarios]   = useState<Comentario[]>([])
  const [cargando, setCargando]         = useState(true)
  const [nombre, setNombre]             = useState('')
  const [texto, setTexto]               = useState('')
  const [rol, setRol]                   = useState<RolComentario>('Colaborador')
  const [enviando, setEnviando]         = useState(false)
  const [error, setError]               = useState<string | null>(null)

  const cargarComentarios = useCallback(async () => {
    setCargando(true)
    try {
      const res = await fetch(`/api/comentarios?ideaId=${ideaId}`)
      if (res.ok) setComentarios(await res.json())
    } finally {
      setCargando(false)
    }
  }, [ideaId])

  useEffect(() => { cargarComentarios() }, [cargarComentarios])

  const handleEnviar = async () => {
    if (!nombre.trim() || !texto.trim()) {
      setError('El nombre y el comentario son obligatorios.')
      return
    }
    setError(null)
    setEnviando(true)
    try {
      const res = await fetch('/api/comentarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId, nombre, texto, rol }),
      })
      if (res.ok) {
        const nuevo = await res.json()
        setComentarios(prev => [...prev, nuevo])
        setNombre('')
        setTexto('')
        setRol('Colaborador')
      } else {
        setError('Error al guardar el comentario.')
      }
    } catch {
      setError('Error de conexión.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="border-t border-sym-bord/60 mt-5 pt-5">
      {/* Cabecera comentarios */}
      <p className="text-slate-500 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
        <MessageSquare className="w-3.5 h-3.5" />
        Comentarios ({comentarios.length})
      </p>

      {/* Lista de comentarios */}
      {cargando ? (
        <p className="text-slate-600 text-sm">Cargando comentarios...</p>
      ) : comentarios.length === 0 ? (
        <p className="text-slate-600 text-sm italic">Sin comentarios todavía. Sé el primero en aportar.</p>
      ) : (
        <div className="space-y-3 mb-5">
          {comentarios.map(c => (
            <div
              key={c.id}
              className={`rounded-xl border p-4 ${
                c.rol === 'Autor'
                  ? 'bg-sym-red/5 border-red-800/30'
                  : 'bg-sym-surf/60 border-sym-bord/60'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-white text-sm font-semibold">{c.nombre}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${ROL_COLORES[c.rol]}`}>
                  {c.rol}
                </span>
                <span className="text-slate-600 text-xs ml-auto">{c.fechaHora}</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{c.texto}</p>
            </div>
          ))}
        </div>
      )}

      {/* Formulario nuevo comentario */}
      <div className="bg-sym-surf/40 border border-sym-bord/60 rounded-xl p-4 space-y-3">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Añadir comentario</p>

        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Tu nombre"
            className="input-field text-sm py-2"
          />
          <select
            value={rol}
            onChange={e => setRol(e.target.value as RolComentario)}
            className="input-field text-sm py-2"
          >
            {ROLES_COMENTARIO.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          placeholder="Escribe tu comentario, pregunta o aportación..."
          rows={3}
          className="input-field text-sm resize-y"
        />

        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}

        <button
          onClick={handleEnviar}
          disabled={enviando}
          className="btn-primary flex items-center gap-2 text-sm py-2 px-4 ml-auto"
        >
          <Send className="w-3.5 h-3.5" />
          {enviando ? 'Guardando...' : 'Añadir comentario'}
        </button>
      </div>
    </div>
  )
}

/* ─── Panel principal ─── */
export default function AdminPanel({ ideas }: Props) {
  const [busqueda,   setBusqueda]   = useState('')
  const [catFiltro,  setCatFiltro]  = useState('todas')
  const [madFiltro,  setMadFiltro]  = useState('todos')
  const [expandido,  setExpandido]  = useState<string | null>(null)
  const [exportando, setExportando] = useState(false)
  const [estados,        setEstados]        = useState<Record<string, EstadoIdea>>({})
  const [ideasVivas,     setIdeasVivas]     = useState<Idea[]>(ideas)
  const [ideaAEliminar,  setIdeaAEliminar]  = useState<Idea | null>(null)
  const [eliminando,     setEliminando]     = useState(false)

  useEffect(() => { setIdeasVivas(ideas) }, [ideas])

  // Realtime: escucha INSERT y DELETE en la tabla ideas
  const channelRef = useRef<ReturnType<typeof supabasePublic.channel> | null>(null)
  useEffect(() => {
    const channel = supabasePublic
      .channel('ideas-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ideas' },
        (payload) => {
          const r = payload.new as Record<string, unknown>
          const nueva: Idea = {
            id: r.id as string,
            fechaEnvio: r.fecha_envio as string,
            nombre: r.nombre as string,
            empresa: (r.empresa as string) || undefined,
            email: r.email as string,
            telefono: (r.telefono as string) || undefined,
            titulo: r.titulo as string,
            categoria: r.categoria as Idea['categoria'],
            descripcion: r.descripcion as string,
            problemaResuelve: r.problema_resuelve as string,
            beneficiosEsperados: r.beneficios_esperados as string,
            nivelMadurez: r.nivel_madurez as Idea['nivelMadurez'],
            archivos: (r.archivos as string[]) || undefined,
            enlacesReferencia: (r.enlaces_referencia as string) || undefined,
            consentimiento: r.consentimiento as boolean,
          }
          setIdeasVivas(prev =>
            prev.find(i => i.id === nueva.id) ? prev : [nueva, ...prev]
          )
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'ideas' },
        (payload) => {
          const id = (payload.old as Record<string, unknown>).id as string
          setIdeasVivas(prev => prev.filter(i => i.id !== id))
        }
      )
      .subscribe()

    channelRef.current = channel
    return () => { supabasePublic.removeChannel(channel) }
  }, [])

  useEffect(() => {
    fetch('/api/ideas/estado').then(r => r.ok ? r.json() : {}).then(setEstados).catch(() => {})
  }, [])

  const cambiarEstado = async (idea: Idea, nuevoEstado: EstadoIdea) => {
    if (nuevoEstado === 'Descartada') {
      if (!confirm(`¿Eliminar la idea "${idea.titulo}"? Esta acción no se puede deshacer.`)) return
    }
    setEstados(prev => ({ ...prev, [idea.id]: nuevoEstado }))
    const res = await fetch('/api/ideas/estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideaId: idea.id, tituloIdea: idea.titulo, estado: nuevoEstado, persona: 'Administración' }),
    })
    const data = await res.json()
    if (data.eliminada) {
      setIdeasVivas(prev => prev.filter(i => i.id !== idea.id))
      setExpandido(null)
    }
  }

  const stats = useMemo(() => {
    const porMadurez: Record<string, number> = {}
    ideasVivas.forEach(i => {
      porMadurez[i.nivelMadurez] = (porMadurez[i.nivelMadurez] || 0) + 1
    })
    return { total: ideasVivas.length, porMadurez }
  }, [ideasVivas])

  const ideasFiltradas = useMemo(() => {
    return ideasVivas.filter(i => {
      if (catFiltro !== 'todas' && i.categoria    !== catFiltro) return false
      if (madFiltro !== 'todos' && i.nivelMadurez !== madFiltro) return false
      if (busqueda) {
        const q = busqueda.toLowerCase()
        return (
          i.nombre.toLowerCase().includes(q)      ||
          i.titulo.toLowerCase().includes(q)      ||
          i.email.toLowerCase().includes(q)       ||
          i.descripcion.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [ideasVivas, catFiltro, madFiltro, busqueda])

  const confirmarEliminar = async () => {
    if (!ideaAEliminar) return
    setEliminando(true)
    try {
      await fetch(`/api/ideas?id=${ideaAEliminar.id}`, { method: 'DELETE' })
      setIdeasVivas(prev => prev.filter(i => i.id !== ideaAEliminar.id))
      setExpandido(null)
    } finally {
      setEliminando(false)
      setIdeaAEliminar(null)
    }
  }

  const handleExportar = async () => {
    setExportando(true)
    window.location.href = '/api/export'
    setTimeout(() => setExportando(false), 2000)
  }

  return (
    <div className="min-h-screen bg-sym-dark flex flex-col">

      {/* ── Barra superior con imagen corporativa ── */}
      <header className="border-b border-sym-bord sticky top-0 z-40 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/images/img_28.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
          }}
        />
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-symlab.png"
              alt="SYM LAB"
              width={80}
              height={80}
              className="h-10 w-auto rounded-lg"
            />
            <p className="text-slate-400 text-xs">Panel de administración</p>
          </div>
          <button
            onClick={handleExportar}
            disabled={exportando || ideas.length === 0}
            className="btn-primary flex items-center gap-2 text-sm py-2 px-3 sm:px-4"
            title="Exportar Excel"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{exportando ? 'Descargando...' : 'Exportar Excel'}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total ideas',            valor: stats.total,                                   icon: FileText,  color: 'text-white' },
            { label: 'Idea inicial',            valor: stats.porMadurez['Idea inicial']        ?? 0, icon: TrendingUp, color: 'text-slate-400' },
            { label: 'Lista para desarrollar', valor: stats.porMadurez['Lista para desarrollar'] ?? 0, icon: TrendingUp, color: 'text-green-400' },
            { label: 'Esta semana',            valor: ideas.filter(i => {
                const [dia, mes, resto = ''] = i.fechaEnvio.split('/')
                const anio = resto.split(' ')[0]
                const fecha = new Date(+anio, +mes - 1, +dia)
                const hace7 = new Date(); hace7.setDate(hace7.getDate() - 7)
                return fecha > hace7
              }).length, icon: Calendar, color: 'text-blue-400' },
          ].map(({ label, valor, icon: Icon, color }) => (
            <div key={label} className="card p-5">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className="text-3xl font-black text-white">{valor}</p>
              <p className="text-slate-500 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Filtros ── */}
        <div className="card p-5">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, título, email..."
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
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={madFiltro}
              onChange={e => setMadFiltro(e.target.value)}
              className="input-field flex-shrink-0 w-auto"
            >
              <option value="todos">Todos los niveles</option>
              {NIVELES_MADUREZ.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <p className="text-slate-600 text-xs mt-3">
            Mostrando <strong className="text-slate-400">{ideasFiltradas.length}</strong> de {stats.total} ideas
          </p>
        </div>

        {/* ── Lista de ideas ── */}
        {ideasFiltradas.length === 0 ? (
          <div className="card p-16 text-center">
            <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">No hay ideas con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ideasFiltradas.map(idea => (
              <div key={idea.id} className="card overflow-hidden">

                {/* Fila principal */}
                <button
                  className="w-full text-left p-5 flex items-start gap-4 hover:bg-sym-surf/50 transition-colors"
                  onClick={() => setExpandido(expandido === idea.id ? null : idea.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${CATEGORIA_COLORES[idea.categoria]}`}>
                        {idea.categoria}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full ${MADUREZ_COLORES[idea.nivelMadurez]}`}>
                        {idea.nivelMadurez}
                      </span>
                      {estados[idea.id] && (
                        <span className={`text-xs px-2.5 py-0.5 rounded-full ${ESTADO_COLORES[estados[idea.id]]}`}>
                          {estados[idea.id]}
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-semibold text-base leading-snug mb-1 truncate">
                      {idea.titulo}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="font-medium text-slate-400">{idea.nombre}</span>
                      {idea.empresa && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" />{idea.empresa}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{idea.fechaEnvio}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-slate-600">
                    {expandido === idea.id
                      ? <ChevronUp className="w-5 h-5" />
                      : <ChevronDown className="w-5 h-5" />
                    }
                  </div>
                </button>

                {/* Detalle expandido */}
                {expandido === idea.id && (
                  <div className="border-t border-sym-bord p-6 bg-sym-surf/30 space-y-5">

                    {/* Contacto */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Contacto</p>
                        <div className="space-y-1.5">
                          <p className="flex items-center gap-2 text-sm text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <a href={`mailto:${idea.email}`} className="hover:text-sym-red transition-colors">{idea.email}</a>
                          </p>
                          {idea.telefono && (
                            <p className="flex items-center gap-2 text-sm text-slate-300">
                              <Phone className="w-3.5 h-3.5 text-slate-500" />{idea.telefono}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Identificador</p>
                        <code className="text-xs text-slate-400 font-mono break-all">{idea.id}</code>
                      </div>
                    </div>

                    {/* Textos principales */}
                    {[
                      { label: 'Descripción completa',  valor: idea.descripcion,         color: 'border-sym-red' },
                      { label: 'Problema que resuelve', valor: idea.problemaResuelve,     color: 'border-blue-600' },
                      { label: 'Beneficios esperados',  valor: idea.beneficiosEsperados,  color: 'border-green-600' },
                    ].map(({ label, valor, color }) => (
                      <div key={label} className={`border-l-4 ${color} pl-4 py-1`}>
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{label}</p>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{valor}</p>
                      </div>
                    ))}

                    {/* Enlaces de referencia */}
                    {idea.enlacesReferencia && (
                      <div className="border-l-4 border-yellow-600 pl-4 py-1">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Link2 className="w-3 h-3" />
                          Enlaces de referencia
                        </p>
                        <div className="space-y-1">
                          {idea.enlacesReferencia.split('\n').filter(Boolean).map((url, i) => (
                            <a
                              key={i}
                              href={url.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-blue-400 hover:text-blue-300 underline break-all"
                            >
                              {url.trim()}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Archivos */}
                    {idea.archivos && idea.archivos.length > 0 && (
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Tag className="w-3 h-3" />
                          Archivos adjuntos ({idea.archivos.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {idea.archivos.map(f => (
                            <span key={f} className="text-xs bg-sym-card border border-sym-bord rounded-lg px-3 py-1.5 text-slate-400">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Botón eliminar */}
                    <div className="border-t border-sym-bord/60 pt-5 flex justify-end">
                      <button
                        onClick={() => setIdeaAEliminar(idea)}
                        className="flex items-center gap-2 text-xs text-red-500 hover:text-red-400 hover:bg-red-900/20 border border-red-800/40 px-3 py-2 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar idea
                      </button>
                    </div>

                    {/* Estado de la idea */}
                    <div className="border-t border-sym-bord/60 pt-5">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Estado de la idea
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ESTADOS_IDEA.map(e => (
                          <button
                            key={e}
                            onClick={() => cambiarEstado(idea, e)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              (estados[idea.id] ?? 'Pendiente') === e
                                ? `${ESTADO_COLORES[e]} border-current ring-1 ring-current font-semibold`
                                : 'bg-sym-surf/40 text-slate-500 border-sym-bord/60 hover:text-slate-300'
                            }`}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comentarios */}
                    <SeccionComentarios ideaId={idea.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de confirmación de eliminación */}
      {ideaAEliminar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIdeaAEliminar(null)} />
          <div className="relative bg-sym-card border border-red-800/50 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Eliminar idea</h3>
                <p className="text-slate-400 text-sm">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm bg-sym-surf/50 rounded-xl p-4 border border-sym-bord/60">
              ¿Seguro que quieres eliminar <strong className="text-white">"{ideaAEliminar.titulo}"</strong>? Se borrarán también todos sus comentarios.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIdeaAEliminar(null)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-sym-bord rounded-xl hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                disabled={eliminando}
                className="px-4 py-2 text-sm bg-red-700 hover:bg-red-600 text-white rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
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
