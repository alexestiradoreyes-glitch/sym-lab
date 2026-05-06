'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, X, CheckCheck, Lightbulb, MessageSquare, Link2, RefreshCw } from 'lucide-react'
import type { Notificacion, TipoNotificacion } from '@/lib/types'

const TIPO_ICON: Record<TipoNotificacion, React.ReactNode> = {
  idea:       <Lightbulb    className="w-4 h-4 text-yellow-400 flex-shrink-0" />,
  comentario: <MessageSquare className="w-4 h-4 text-blue-400  flex-shrink-0" />,
  enlace:     <Link2         className="w-4 h-4 text-cyan-400  flex-shrink-0" />,
  estado:     <RefreshCw     className="w-4 h-4 text-purple-400 flex-shrink-0" />,
}

// ─── Botón para activar/desactivar push ──────────────────────

function BotonPush() {
  const [estado, setEstado] = useState<'idle' | 'activo' | 'bloqueado' | 'cargando'>('idle')

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setEstado('bloqueado')
      return
    }
    if (Notification.permission === 'granted') setEstado('activo')
    else if (Notification.permission === 'denied') setEstado('bloqueado')
  }, [])

  const activar = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Tu navegador no soporta notificaciones push.')
      return
    }
    setEstado('cargando')
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setEstado('bloqueado'); return }

      const reg = await navigator.serviceWorker.ready
      const vapidRes = await fetch('/api/push/subscribe')
      const { publicKey } = await vapidRes.json()

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as ArrayBuffer,
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })
      setEstado('activo')
    } catch (e) {
      console.error('[Push]', e)
      setEstado('idle')
    }
  }

  if (estado === 'activo') {
    return (
      <p className="text-xs text-green-400 flex items-center gap-1 px-3 py-2">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
        Notificaciones activas
      </p>
    )
  }
  if (estado === 'bloqueado') {
    return (
      <p className="text-xs text-slate-500 px-3 py-2">Notificaciones bloqueadas en el navegador</p>
    )
  }
  return (
    <button
      onClick={activar}
      disabled={estado === 'cargando'}
      className="w-full text-left px-3 py-2 text-xs text-sym-red hover:text-red-400 flex items-center gap-2 transition-colors"
    >
      <Bell className="w-3.5 h-3.5" />
      {estado === 'cargando' ? 'Activando...' : 'Activar notificaciones'}
    </button>
  )
}

// ─── Panel de notificaciones ─────────────────────────────────

export default function NotificacionesBell() {
  const [abierto,        setAbierto]        = useState(false)
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const panelRef = useRef<HTMLDivElement>(null)

  const noLeidas = notificaciones.filter(n => !n.leida).length

  const cargar = useCallback(async () => {
    try {
      const res = await fetch('/api/notificaciones')
      if (res.ok) setNotificaciones(await res.json())
    } catch {}
  }, [])

  // Carga inicial y polling cada 30 s
  useEffect(() => {
    cargar()
    const id = setInterval(cargar, 30_000)
    return () => clearInterval(id)
  }, [cargar])

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const marcarTodas = async () => {
    await fetch('/api/notificaciones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todas: true }),
    })
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
  }

  const marcarUna = async (id: string) => {
    await fetch('/api/notificaciones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    })
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
  }

  return (
    <div ref={panelRef} className="relative">
      {/* Campana */}
      <button
        onClick={() => { setAbierto(v => !v); if (!abierto) cargar() }}
        className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-sym-red rounded-full text-[10px] text-white font-bold flex items-center justify-center leading-none">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {/* Panel desplegable */}
      {abierto && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-sym-card border border-sym-bord rounded-2xl shadow-2xl z-[60] overflow-hidden">

          {/* Cabecera del panel */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-sym-bord">
            <h3 className="text-white font-semibold text-sm">
              Notificaciones
              {noLeidas > 0 && (
                <span className="ml-2 text-xs bg-sym-red/20 text-sym-red px-1.5 py-0.5 rounded-full">
                  {noLeidas} nueva{noLeidas !== 1 ? 's' : ''}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1">
              {noLeidas > 0 && (
                <button
                  onClick={marcarTodas}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Todas leídas</span>
                </button>
              )}
              <button onClick={() => setAbierto(false)} className="text-slate-500 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Botón activar push */}
          <div className="border-b border-sym-bord/60">
            <BotonPush />
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-80 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Sin notificaciones todavía
              </div>
            ) : (
              notificaciones.map(n => (
                <button
                  key={n.id}
                  onClick={() => { marcarUna(n.id); window.location.href = n.url }}
                  className={`w-full text-left px-4 py-3 flex gap-3 items-start border-b border-sym-bord/40 last:border-0 transition-colors hover:bg-sym-surf/60 ${
                    !n.leida ? 'bg-sym-red/5' : ''
                  }`}
                >
                  <div className="mt-0.5">{TIPO_ICON[n.tipo]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium truncate ${n.leida ? 'text-slate-400' : 'text-white'}`}>
                        {n.titulo}
                      </p>
                      {!n.leida && (
                        <span className="w-1.5 h-1.5 bg-sym-red rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      <span className="text-slate-400">{n.persona}</span>: {n.mensaje}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">{n.fecha}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Helper: convierte VAPID public key a Uint8Array ─────────
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from(Array.from(raw).map(c => c.charCodeAt(0)))
}
