'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { supabasePublic } from '@/lib/supabase-public'
import Image from 'next/image'
import AudioPlayer from './AudioPlayer'
import AudioRecorder from './AudioRecorder'
import {
  Download, ChevronDown, ChevronUp,
  Mail, Building, Phone, Calendar,
  Tag, TrendingUp, FileText,
  MessageSquare, Send, Link2, RefreshCw, Trash2, ArrowLeft, AlertTriangle, Lightbulb,
  Paperclip, ImageIcon, Mic, X,
} from 'lucide-react'
import { Idea, CATEGORIA_COLORES, MADUREZ_COLORES, ROLES_COMENTARIO, ESTADOS_IDEA, ESTADO_COLORES } from '@/lib/types'
import type { Comentario, RolComentario, EstadoIdea, Problema } from '@/lib/types'
import ProblemasAdminSection from './ProblemasAdminSection'

const ROL_COLORES: Record<RolComentario, string> = {
  'Autor':          'bg-sym-red/20 text-red-300 border-red-800/40',
  'Revisor':        'bg-blue-900/30 text-blue-300 border-blue-800/40',
  'Administrador':  'bg-purple-900/30 text-purple-300 border-purple-800/40',
  'Colaborador':    'bg-slate-800 text-slate-300 border-slate-700/40',
}

interface Props {
  ideas: Idea[]
  problemas?: Problema[]
}

/* ─── Sub-componente de comentarios por idea ─── */
function SeccionComentarios({ ideaId }: { ideaId: string }) {
  const [comentarios,           setComentarios]           = useState<Comentario[]>([])
  const [cargando,              setCargando]              = useState(true)
  const [nombre,                setNombre]                = useState('')
  const [texto,                 setTexto]                 = useState('')
  const [rol,                   setRol]                   = useState<RolComentario>('Colaborador')
  const [enviando,              setEnviando]              = useState(false)
  const [error,                 setError]                 = useState<string | null>(null)
  const [audioDuracion,         setAudioDuracion]         = useState(0)
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([])
  const [recorderKey,           setRecorderKey]           = useState(0)
  const audioBlobRef = useRef<Blob | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

  const onAudioChange = (blob: Blob | null, dur: number) => {
    audioBlobRef.current = blob
    setAudioDuracion(dur)
  }

  const handleEnviar = async () => {
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    const tieneContenido = texto.trim() || audioBlobRef.current || archivosSeleccionados.length > 0
    if (!tieneContenido) { setError('Escribe un comentario, graba un audio o adjunta un archivo.'); return }
    setError(null)
    setEnviando(true)

    try {
      const fd = new FormData()
      fd.append('ideaId', ideaId)
      fd.append('nombre', nombre.trim())
      fd.append('texto', texto.trim())
      fd.append('rol', rol)
      if (audioBlobRef.current) {
        fd.append('audio', audioBlobRef.current, 'nota.webm')
        fd.append('audioDuracion', String(audioDuracion))
      }
      for (const archivo of archivosSeleccionados) {
        fd.append('archivos', archivo)
      }

      const res = await fetch('/api/comentarios', { method: 'POST', body: fd })
      if (res.ok) {
        const nuevo = await res.json()
        setComentarios(prev => [...prev, nuevo])
        setNombre('')
        setTexto('')
        setRol('Colaborador')
        audioBlobRef.current = null
        setAudioDuracion(0)
        setArchivosSeleccionados([])
        setRecorderKey(k => k + 1)
        if (fileInputRef.current) fileInputRef.current.value = ''
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Error al guardar el comentario.')
      }
    } catch {
      setError('Error de conexión.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="border-t border-sym-bord/60 mt-5 pt-5">
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
                c.rol === 'Autor' ? 'bg-sym-red/5 border-red-800/30' : 'bg-sym-surf/60 border-sym-bord/60'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-white text-sm font-semibold">{c.nombre}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${ROL_COLORES[c.rol]}`}>{c.rol}</span>
                <span className="text-slate-600 text-xs ml-auto">{c.fechaHora}</span>
              </div>
              {c.texto && (
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap mb-2">{c.texto}</p>
              )}
              {c.audioUrl && (
                <div className="mt-2">
                  <AudioPlayer url={c.audioUrl} duracion={c.audioDuracion} />
                </div>
              )}
              {c.archivos && c.archivos.length > 0 && (
                <div className="mt-2 space-y-1">
                  {c.archivos.map(url => {
                    const nombreCompleto = url.split('/').pop() ?? 'archivo'
                    const nombre = nombreCompleto.replace(/^\d+_/, '')
                    const ext = nombre.split('.').pop()?.toLowerCase() ?? ''
                    const esImagen = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)
                    const esPDF = ext === 'pdf'
                    return (
                      <div key={url} className="rounded-lg border border-sym-bord overflow-hidden bg-sym-card">
                        {esImagen && (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                            <img src={url} alt={nombre} className="w-full max-h-40 object-cover hover:opacity-90 transition-opacity" />
                          </a>
                        )}
                        <a href={url} target="_blank" rel="noopener noreferrer" download={nombre}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-sym-surf/60 transition-colors group">
                          {esImagen
                            ? <ImageIcon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                            : esPDF
                              ? <FileText className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                              : <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
                          <span className="text-xs text-slate-300 flex-1 truncate group-hover:text-white">{nombre}</span>
                          <Download className="w-3 h-3 text-slate-500 group-hover:text-sym-red flex-shrink-0" />
                        </a>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formulario nuevo comentario */}
      <div className="bg-sym-surf/40 border border-sym-bord/60 rounded-xl p-4 space-y-3">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Añadir comentario</p>

        <div className="grid sm:grid-cols-2 gap-3">
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
            placeholder="Tu nombre" className="input-field text-sm py-2" />
          <select value={rol} onChange={e => setRol(e.target.value as RolComentario)} className="input-field text-sm py-2">
            {ROLES_COMENTARIO.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <textarea value={texto} onChange={e => setTexto(e.target.value.slice(0, 1000))}
          placeholder="Escribe tu comentario... (opcional si adjuntas audio o archivo)"
          rows={3} className="input-field text-sm resize-y" />
        <p className={`text-xs text-right ${texto.length >= 1000 ? 'text-red-400' : 'text-slate-600'}`}>
          {texto.length} / 1000
        </p>

        {/* Nota de voz */}
        <div>
          <p className="text-slate-500 text-xs mb-2 flex items-center gap-1.5">
            <Mic className="w-3 h-3" />
            Nota de voz <span className="text-slate-600 font-normal">(opcional)</span>
          </p>
          <AudioRecorder key={recorderKey} onAudioChange={onAudioChange} disabled={enviando} maxSegundos={180} />
        </div>

        {/* Archivos adjuntos */}
        <div>
          <input ref={fileInputRef} type="file" multiple className="hidden"
            onChange={e => {
              setArchivosSeleccionados(prev => [...prev, ...Array.from(e.target.files || [])])
              if (fileInputRef.current) fileInputRef.current.value = ''
            }} />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={enviando}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white border border-sym-bord px-3 py-1.5 rounded-lg hover:border-slate-500 transition-colors disabled:opacity-40">
            <Paperclip className="w-3.5 h-3.5" />
            Adjuntar archivos
          </button>
          {archivosSeleccionados.length > 0 && (
            <div className="mt-2 space-y-1">
              {archivosSeleccionados.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-400 bg-sym-surf/60 rounded-lg px-3 py-2">
                  <Paperclip className="w-3 h-3 flex-shrink-0 text-slate-500" />
                  <span className="flex-1 truncate">{f.name}</span>
                  <button type="button"
                    onClick={() => setArchivosSeleccionados(prev => prev.filter((_, j) => j !== i))}
                    className="text-slate-600 hover:text-red-400 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button onClick={handleEnviar} disabled={enviando}
          className="btn-primary flex items-center gap-2 text-sm py-2 px-4 ml-auto">
          <Send className="w-3.5 h-3.5" />
          {enviando ? 'Publicando...' : 'Publicar comentario'}
        </button>
      </div>
    </div>
  )
}

const IDEAS_POR_PAGINA = 20

/* ─── Panel principal ─── */
export default function AdminPanel({ ideas, problemas = [] }: Props) {
  const [tabActivo, setTabActivo] = useState<'ideas' | 'problemas'>('ideas')
  const [expandido,  setExpandido]  = useState<string | null>(null)
  const [exportando, setExportando] = useState(false)
  const [estados,        setEstados]        = useState<Record<string, EstadoIdea>>({})
  const [ideasVivas,     setIdeasVivas]     = useState<Idea[]>(ideas)
  const [ideaAEliminar,  setIdeaAEliminar]  = useState<Idea | null>(null)
  const [eliminando,     setEliminando]     = useState(false)
  const [eliminarError,  setEliminarError]  = useState<string | null>(null)
  const [cargandoIdeas,  setCargandoIdeas]  = useState(ideas.length === 0)
  const [refreshing,     setRefreshing]     = useState(false)
  const [pagina,         setPagina]         = useState(1)

  // Central refetch — usado por todos los mecanismos de actualización
  const refetchIdeas = useCallback(() => {
    fetch('/api/ideas')
      .then(r => r.ok ? r.json() : null)
      .then((data: Idea[] | null) => { if (data) setIdeasVivas(data) })
      .catch(() => {})
  }, [])

  // Carga inicial (siempre fresca desde Supabase)
  useEffect(() => {
    fetch('/api/ideas')
      .then(r => r.ok ? r.json() : null)
      .then((data: Idea[] | null) => { if (data !== null) setIdeasVivas(data) })
      .catch(() => {})
      .finally(() => setCargandoIdeas(false))
  }, [])

  // Realtime Supabase — funciona si está habilitado en el dashboard
  useEffect(() => {
    let channel: ReturnType<typeof supabasePublic.channel> | null = null
    try {
      channel = supabasePublic
        .channel('ideas-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ideas' }, () => {
          refetchIdeas()
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'ideas' }, (payload) => {
          const id = (payload.old as Record<string, unknown>).id as string
          setIdeasVivas(prev => prev.filter(i => i.id !== id))
        })
        .subscribe()
    } catch { /* WebSocket no disponible en este entorno */ }
    return () => { if (channel) { try { supabasePublic.removeChannel(channel) } catch { /* ignore */ } } }
  }, [refetchIdeas])

  // BroadcastChannel — sincronización instantánea en el mismo navegador
  useEffect(() => {
    let bc: BroadcastChannel | null = null
    try {
      bc = new BroadcastChannel('sym-lab-ideas')
      bc.onmessage = () => refetchIdeas()
    } catch { /* navegador sin soporte */ }
    return () => bc?.close()
  }, [refetchIdeas])

  // Refresco cuando la pestaña vuelve a estar activa (usuario vuelve de otra pestaña)
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') refetchIdeas() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refetchIdeas])

  // Refresco automático cada 15 s cuando la pestaña está visible
  useEffect(() => {
    const tick = setInterval(() => {
      if (document.visibilityState === 'visible') refetchIdeas()
    }, 15000)
    return () => clearInterval(tick)
  }, [refetchIdeas])

  const handleRefrescar = async () => {
    setRefreshing(true)
    await fetch('/api/ideas')
      .then(r => r.ok ? r.json() : null)
      .then((data: Idea[] | null) => { if (data) setIdeasVivas(data) })
      .catch(() => {})
    setRefreshing(false)
  }

  useEffect(() => {
    fetch('/api/ideas/estado').then(r => r.ok ? r.json() : {}).then(setEstados).catch(() => {})
  }, [])

  const cambiarEstado = async (idea: Idea, nuevoEstado: EstadoIdea) => {
    if (nuevoEstado === 'Descartada') {
      let confirmado = true
      try { confirmado = window.confirm(`¿Eliminar la idea "${idea.titulo}"? Esta acción no se puede deshacer.`) } catch { /* PWA/iOS sin confirm */ }
      if (!confirmado) return
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

  const ideasFiltradas = ideasVivas

  const totalPaginas  = Math.max(1, Math.ceil(ideasFiltradas.length / IDEAS_POR_PAGINA))
  const paginaActual  = Math.min(pagina, totalPaginas)
  const ideasPagina   = ideasFiltradas.slice((paginaActual - 1) * IDEAS_POR_PAGINA, paginaActual * IDEAS_POR_PAGINA)

  const confirmarEliminar = async () => {
    if (!ideaAEliminar) return
    setEliminando(true)
    setEliminarError(null)
    try {
      const res = await fetch(`/api/ideas?id=${ideaAEliminar.id}`, { method: 'DELETE' })
      if (res.ok) {
        // Solo eliminamos del estado local si la API confirmó el borrado
        setIdeasVivas(prev => prev.filter(i => i.id !== ideaAEliminar.id))
        setExpandido(null)
        setIdeaAEliminar(null)
      } else {
        const json = await res.json().catch(() => ({}))
        setEliminarError(json.error || 'No se pudo eliminar. Inténtalo de nuevo.')
      }
    } catch {
      setEliminarError('Error de conexión. Comprueba tu internet e inténtalo de nuevo.')
    } finally {
      setEliminando(false)
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
            <a
              href="/"
              className="flex items-center gap-1 text-slate-400 hover:text-white border border-sym-bord hover:border-slate-500 bg-black/30 hover:bg-white/10 py-2 px-3 rounded-xl transition-all text-sm"
              title="Volver al inicio"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Inicio</span>
            </a>
            <Image
              src="/images/logo-symlab.png"
              alt="SYM LAB"
              width={80}
              height={80}
              className="h-10 w-auto rounded-lg"
            />
            <p className="text-slate-400 text-xs">Panel de administración</p>
          </div>
          <div className="flex items-center gap-2">
          <button
            onClick={handleRefrescar}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-sym-bord hover:border-slate-500 bg-black/30 hover:bg-white/10 py-2 px-3 rounded-xl transition-all disabled:opacity-40"
            title="Actualizar ideas"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{refreshing ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
          <button
            onClick={handleExportar}
            disabled={exportando || ideasVivas.length === 0}
            className="btn-primary flex items-center gap-2 text-sm py-2 px-3 sm:px-4"
            title="Exportar Excel"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{exportando ? 'Descargando...' : 'Exportar Excel'}</span>
          </button>
          </div>
        </div>
      </header>

      {/* ── Selector de pestañas ── */}
      <div className="border-b border-sym-bord bg-sym-dark/60 sticky top-[65px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 pt-2">
          {([
            { key: 'ideas',     label: 'Ideas',                Icon: Lightbulb },
            { key: 'problemas', label: 'Problemas no resueltos', Icon: AlertTriangle },
          ] as const).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTabActivo(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all ${
                tabActivo === key
                  ? 'text-white border-sym-red'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">

      {tabActivo === 'problemas' && (
        <ProblemasAdminSection problemas={problemas} />
      )}

      {tabActivo === 'ideas' && (<>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total ideas',            valor: stats.total,                                   icon: FileText,  color: 'text-white' },
            { label: 'Idea inicial',            valor: stats.porMadurez['Idea inicial']        ?? 0, icon: TrendingUp, color: 'text-slate-400' },
            { label: 'Lista para desarrollar', valor: stats.porMadurez['Lista para desarrollar'] ?? 0, icon: TrendingUp, color: 'text-green-400' },
            { label: 'Esta semana',            valor: ideasVivas.filter(i => {
                try {
                  const [dia, mes, resto = ''] = (i.fechaEnvio ?? '').split('/')
                  const anio = resto.split(' ')[0]
                  const fecha = new Date(+anio, +mes - 1, +dia)
                  const hace7 = new Date(); hace7.setDate(hace7.getDate() - 7)
                  return fecha > hace7
                } catch { return false }
              }).length, icon: Calendar, color: 'text-blue-400' },
          ].map(({ label, valor, icon: Icon, color }) => (
            <div key={label} className="card p-5">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className="text-3xl font-black text-white">{valor}</p>
              <p className="text-slate-500 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Lista de ideas ── */}
        {cargandoIdeas ? (
          <div className="card p-16 text-center">
            <RefreshCw className="w-8 h-8 text-slate-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-500">Cargando ideas...</p>
          </div>
        ) : ideasFiltradas.length === 0 ? (
          <div className="card p-16 text-center">
            <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">No hay ideas con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ideasPagina.map(idea => (
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

                    {/* Descripción */}
                    {idea.descripcion?.trim() && (
                      <div className="border-l-4 border-sym-red pl-4 py-1">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Descripción completa</p>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{idea.descripcion}</p>
                      </div>
                    )}

                    {/* Audio */}
                    {idea.audioUrl && (
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Mic className="w-3.5 h-3.5" />
                          Nota de voz
                        </p>
                        <AudioPlayer url={idea.audioUrl} duracion={idea.audioDuracion} />
                      </div>
                    )}

                    {idea.problemaResuelve?.trim() && (
                      <div className="border-l-4 border-blue-600 pl-4 py-1">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Problema que resuelve</p>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{idea.problemaResuelve}</p>
                      </div>
                    )}

                    {idea.beneficiosEsperados?.trim() && (
                      <div className="border-l-4 border-green-600 pl-4 py-1">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Beneficios esperados</p>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{idea.beneficiosEsperados}</p>
                      </div>
                    )}

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

                    {/* Archivos adjuntos */}
                    {idea.archivos && idea.archivos.length > 0 && (
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5" />
                          Archivos adjuntos ({idea.archivos.length})
                        </p>
                        <div className="space-y-2">
                          {idea.archivos.map(url => {
                            const nombreCompleto = url.split('/').pop() ?? 'archivo'
                            const nombre = nombreCompleto.replace(/^\d+_/, '')
                            const ext = nombre.split('.').pop()?.toLowerCase() ?? ''
                            const esImagen = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)
                            const esPDF = ext === 'pdf'
                            return (
                              <div key={url} className="rounded-xl border border-sym-bord overflow-hidden bg-sym-card">
                                {esImagen && (
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                                    <img src={url} alt={nombre} className="w-full max-h-52 object-cover hover:opacity-90 transition-opacity" />
                                  </a>
                                )}
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={nombre}
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-sym-surf/60 transition-colors group"
                                >
                                  {esImagen
                                    ? <ImageIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    : esPDF
                                      ? <FileText className="w-4 h-4 text-red-400 flex-shrink-0" />
                                      : <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                  }
                                  <span className="text-sm text-slate-300 flex-1 truncate group-hover:text-white transition-colors">{nombre}</span>
                                  <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-sym-red flex-shrink-0 transition-colors" />
                                </a>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Registro de consentimiento */}
                    <div className="border-t border-sym-bord/60 pt-5">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">
                        Registro de consentimiento
                      </p>
                      <div className="bg-sym-surf/40 border border-sym-bord/60 rounded-xl p-4 space-y-2">
                        {[
                          { label: 'Confidencialidad',      value: idea.consentimientoConfidencialidad },
                          { label: 'Uso empresarial',        value: idea.consentimientoUsoEmpresarial },
                          { label: 'Propiedad de la empresa', value: idea.consentimientoPropiedad },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">{label}</span>
                            {value
                              ? <span className="text-xs font-semibold text-green-400 bg-green-900/30 border border-green-700/40 px-2.5 py-0.5 rounded-full">Aceptado</span>
                              : <span className="text-xs font-semibold text-red-400 bg-red-900/30 border border-red-700/40 px-2.5 py-0.5 rounded-full">No registrado</span>
                            }
                          </div>
                        ))}
                        {idea.consentimientoTimestamp && (
                          <div className="pt-2 border-t border-sym-bord/40 space-y-1 text-xs text-slate-500">
                            <p>Fecha de aceptación: <span className="text-slate-400">{new Date(idea.consentimientoTimestamp).toLocaleString('es-ES')}</span></p>
                            {idea.consentimientoVersion && (
                              <p>Versión del texto legal: <span className="text-slate-400">{idea.consentimientoVersion}</span></p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botón eliminar */}
                    <div className="border-t border-sym-bord/60 pt-5 flex justify-end">
                      <button
                        onClick={() => setIdeaAEliminar(idea)}
                        className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 hover:bg-red-900/20 border border-red-800/40 px-4 py-2.5 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
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
                            className={`text-sm px-4 py-2.5 rounded-full border transition-all ${
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

        {/* ── Paginación ── */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
              className="px-3 py-2 rounded-lg border border-sym-bord text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
            >
              ← Anterior
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPagina(n)}
                className={`w-9 h-9 rounded-lg border text-sm font-medium transition-all ${
                  n === paginaActual
                    ? 'bg-sym-red border-sym-red text-white'
                    : 'border-sym-bord text-slate-400 hover:text-white hover:border-slate-500'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
              className="px-3 py-2 rounded-lg border border-sym-bord text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
            >
              Siguiente →
            </button>
          </div>
        )}
      </>)}
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
            {eliminarError && (
              <p className="text-red-400 text-xs bg-red-950/40 border border-red-800/40 rounded-xl px-4 py-3">
                {eliminarError}
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setIdeaAEliminar(null); setEliminarError(null) }}
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
