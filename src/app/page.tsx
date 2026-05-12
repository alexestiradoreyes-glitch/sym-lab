import Link from 'next/link'
import Header from '@/components/Header'
import { Lightbulb, ArrowRight, AlertTriangle } from 'lucide-react'

export default function PaginaInicio() {
  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      <Header />

      <section
        className="relative flex-1 flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(/images/portada.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Degradado: más oscuro abajo para que el texto se lea bien */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/78" />
        <div className="absolute inset-0 bg-sym-red/4" />

        <div className="relative z-10 text-center px-4 sm:px-8 max-w-4xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-sym-red/10 border border-sym-red/25 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-sym-red rounded-full animate-pulse" />
            <span className="text-sym-red-l text-sm font-medium tracking-wide">Portal de Innovación Abierto</span>
          </div>

          {/* Título principal */}
          <h1 className="font-black text-6xl sm:text-7xl md:text-8xl tracking-widest text-white mb-8 drop-shadow-2xl"
              style={{ textShadow: '0 0 40px rgba(232,48,10,0.3), 0 2px 20px rgba(0,0,0,0.8)' }}>
            SYM LAB
          </h1>

          {/* Línea roja decorativa */}
          <div className="w-16 h-0.5 bg-sym-red mx-auto mb-8 rounded-full" />

          {/* Frase principal */}
          <p className="text-xl sm:text-2xl md:text-3xl text-white font-light max-w-3xl mx-auto mb-5 leading-relaxed"
             style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}>
            "Las grandes ideas empiezan cuando alguien se atreve a compartirlas."
          </p>

          {/* Frase secundaria */}
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
             style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
            Aporta, propone y ayuda a construir nuevas formas de innovar en SYM LAB.
          </p>

          {/* Botones CTA */}
          <div className="flex flex-col items-center gap-5">
            <Link
              href="/ideas/nueva"
              className="btn-primary inline-flex items-center gap-3 text-base sm:text-lg px-8 sm:px-10 py-4 glow-red"
            >
              <Lightbulb className="w-5 h-5" />
              Enviar mi idea
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-slate-400 text-sm sm:text-base italic"
               style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
              Detectar un problema sin resolver también es el primer paso para innovar.
            </p>

            <Link
              href="/problemas/nueva"
              className="btn-primary inline-flex items-center gap-3 text-base sm:text-lg px-8 sm:px-10 py-4 glow-red"
            >
              <AlertTriangle className="w-5 h-5" />
              Problema no resuelto
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
