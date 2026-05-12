import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProblemaForm from '@/components/ProblemaForm'
import { AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Problema no resuelto — SYM LAB',
  description: 'Expón un problema común que todavía no tenga solución definida.',
}

export default function PaginaProblema() {
  return (
    <div className="min-h-screen flex flex-col bg-sym-dark">
      <Header minimalista />

      {/* Banda superior */}
      <div
        className="relative pt-16 overflow-hidden"
        style={{
          backgroundImage: 'url(/images/img_34.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          height: '200px',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/40" />
        <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-6 pb-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 border border-orange-500/30 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                Problema no resuelto
              </h1>
              <p className="text-white/90 text-sm font-medium" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
                Identifica un problema real para que el equipo pueda analizarlo y encontrar una solución.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Texto introductorio */}
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 pt-8">
        <div className="bg-orange-950/30 border border-orange-800/40 rounded-xl p-5">
          <p className="text-slate-300 text-sm leading-relaxed">
            En este apartado puedes describir un <strong className="text-white">problema común, repetido o importante</strong> que
            todavía no tenga una solución definida. El objetivo es recoger problemas reales para analizarlos,
            compartirlos con el equipo responsable y buscar posibles respuestas o soluciones.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed mt-3">
            No es necesario que conozcas la solución. Si identificas el problema, ya estás aportando valor.
          </p>
        </div>
      </div>

      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="card p-6 sm:p-10">
            <Suspense fallback={<div className="text-slate-400 text-sm">Cargando formulario...</div>}>
              <ProblemaForm />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
