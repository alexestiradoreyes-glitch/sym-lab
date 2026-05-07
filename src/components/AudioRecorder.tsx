'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, Square, Play, Pause, Trash2, AlertCircle } from 'lucide-react'

interface Props {
  onAudioChange: (blob: Blob | null, duracion: number) => void
  maxSegundos?: number
  disabled?: boolean
}

function fmt(s: number) {
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

export default function AudioRecorder({ onAudioChange, maxSegundos = 180, disabled = false }: Props) {
  const [estado,        setEstado]        = useState<'idle' | 'grabando' | 'grabado'>('idle')
  const [segundos,      setSegundos]      = useState(0)
  const [duracionFinal, setDuracionFinal] = useState(0)
  const [audioUrl,      setAudioUrl]      = useState<string | null>(null)
  const [reproduciendo, setReproduciendo] = useState(false)
  const [error,         setError]         = useState<string | null>(null)

  const mrRef      = useRef<MediaRecorder | null>(null)
  const chunksRef  = useRef<Blob[]>([])
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef  = useRef<MediaStream | null>(null)
  const audioRef   = useRef<HTMLAudioElement | null>(null)
  const segsRef    = useRef(0)

  useEffect(() => { segsRef.current = segundos }, [segundos])

  const pararTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  const detenerGrabacion = useCallback(() => {
    pararTimer()
    if (mrRef.current?.state === 'recording') mrRef.current.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  const iniciarGrabacion = async () => {
    setError(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Tu navegador no soporta grabación de audio.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const tipos = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
      const mimeType = tipos.find(t => MediaRecorder.isTypeSupported(t)) || ''

      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mrRef.current = mr
      chunksRef.current = []

      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        const url  = URL.createObjectURL(blob)
        const dur  = segsRef.current
        setAudioUrl(url)
        setDuracionFinal(dur)
        setEstado('grabado')
        onAudioChange(blob, dur)
        stream.getTracks().forEach(t => t.stop())
      }

      mr.start(100)
      setEstado('grabando')
      setSegundos(0)

      timerRef.current = setInterval(() => {
        setSegundos(prev => {
          if (prev >= maxSegundos - 1) { detenerGrabacion(); return prev }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      const e = err as Error
      setError(
        e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError'
          ? 'No se pudo acceder al micrófono. Activa los permisos para grabar audio.'
          : 'Error al acceder al micrófono. Inténtalo de nuevo.'
      )
    }
  }

  const eliminarAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setEstado('idle')
    setSegundos(0)
    setDuracionFinal(0)
    setReproduciendo(false)
    onAudioChange(null, 0)
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (reproduciendo) { audioRef.current.pause(); setReproduciendo(false) }
    else               { audioRef.current.play();  setReproduciendo(true)  }
  }

  useEffect(() => {
    return () => {
      pararTimer()
      streamRef.current?.getTracks().forEach(t => t.stop())
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="rounded-xl border border-sym-bord bg-sym-surf/40 p-4 space-y-3">

      {/* ── Idle ── */}
      {estado === 'idle' && (
        <button
          type="button"
          onClick={iniciarGrabacion}
          disabled={disabled}
          className="flex items-center gap-2.5 text-sm text-slate-300 hover:text-white border border-sym-bord hover:border-sym-red/60 bg-sym-surf hover:bg-sym-red/10 px-4 py-2.5 rounded-xl transition-all disabled:opacity-40"
        >
          <Mic className="w-4 h-4 text-sym-red" />
          Grabar audio
        </button>
      )}

      {/* ── Grabando ── */}
      {estado === 'grabando' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <span className="text-sm text-white font-medium tabular-nums">
              Grabando — {fmt(segundos)}
            </span>
            <span className="text-xs text-slate-600 ml-auto">máx. {fmt(maxSegundos)}</span>
          </div>
          <div className="h-1.5 bg-sym-bord rounded-full overflow-hidden">
            <div
              className="h-full bg-sym-red transition-all duration-1000"
              style={{ width: `${(segundos / maxSegundos) * 100}%` }}
            />
          </div>
          <button
            type="button"
            onClick={detenerGrabacion}
            className="flex items-center gap-2 text-sm text-white border border-sym-bord px-4 py-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            Detener grabación
          </button>
        </div>
      )}

      {/* ── Grabado ── */}
      {estado === 'grabado' && audioUrl && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-sym-red/20 hover:bg-sym-red/30 border border-sym-red/50 flex items-center justify-center transition-colors flex-shrink-0"
          >
            {reproduciendo
              ? <Pause className="w-3.5 h-3.5 text-sym-red" />
              : <Play  className="w-3.5 h-3.5 text-sym-red ml-0.5" />
            }
          </button>
          <div className="flex-1">
            <p className="text-sm text-slate-200 font-medium">Audio listo</p>
            <p className="text-xs text-slate-500 tabular-nums">{fmt(duracionFinal)}</p>
          </div>
          <button
            type="button"
            onClick={eliminarAudio}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar
          </button>
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setReproduciendo(false)}
            hidden
          />
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
