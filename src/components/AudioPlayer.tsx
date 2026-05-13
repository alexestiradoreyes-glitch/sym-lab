'use client'

import { useState, useRef } from 'react'
import { Play, Pause, AlertCircle } from 'lucide-react'

interface Props {
  url: string
  duracion?: number
}

function fmt(s: number) {
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

export default function AudioPlayer({ url, duracion }: Props) {
  const [reproduciendo, setReproduciendo] = useState(false)
  const [progreso,      setProgreso]      = useState(0)
  const [durReal,       setDurReal]       = useState(duracion ?? 0)
  const [error,         setError]         = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const toggle = () => {
    if (!audioRef.current || error) return
    if (reproduciendo) { audioRef.current.pause(); setReproduciendo(false) }
    else               { audioRef.current.play().catch(() => setError(true)); setReproduciendo(true) }
  }

  const onTimeUpdate = () => {
    const a = audioRef.current
    if (!a?.duration) return
    setProgreso((a.currentTime / a.duration) * 100)
  }

  const onLoadedMetadata = () => {
    if (audioRef.current?.duration) setDurReal(Math.round(audioRef.current.duration))
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current
    if (!a?.duration || error) return
    const rect = e.currentTarget.getBoundingClientRect()
    a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 bg-sym-surf/50 border border-sym-bord/60 rounded-xl px-4 py-3 text-slate-500 text-sm">
        <AlertCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
        <span>No se pudo cargar el audio</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 bg-sym-surf/50 border border-sym-bord/60 rounded-xl px-4 py-3">
      <button
        onClick={toggle}
        className="w-8 h-8 rounded-full bg-sym-red/20 hover:bg-sym-red/30 border border-sym-red/50 flex items-center justify-center transition-colors flex-shrink-0"
        aria-label={reproduciendo ? 'Pausar' : 'Reproducir'}
      >
        {reproduciendo
          ? <Pause className="w-3.5 h-3.5 text-sym-red" />
          : <Play  className="w-3.5 h-3.5 text-sym-red ml-0.5" />
        }
      </button>

      <div className="flex-1 space-y-1.5">
        <div
          className="h-1.5 bg-sym-bord rounded-full overflow-hidden cursor-pointer"
          onClick={seek}
          title="Haz clic para saltar"
        >
          <div
            className="h-full bg-sym-red transition-all duration-100"
            style={{ width: `${progreso}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 tabular-nums">{durReal ? fmt(durReal) : '—'}</p>
      </div>

      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => { setReproduciendo(false); setProgreso(0) }}
        onError={() => { setError(true); setReproduciendo(false) }}
        hidden
      />
    </div>
  )
}
