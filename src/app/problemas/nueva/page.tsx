import Header        from '@/components/Header'
import Footer        from '@/components/Footer'
import ProblemasTabs from '@/components/ProblemasTabs'
import { AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Problema no resuelto — SYM LAB',
  description: 'Expón un problema común o consulta el registro de problemas sin solución.',
}

export default function PaginaProblema() {
  return (
    <div className="min-h-screen flex flex-col bg-sym-dark">
      <Header minimalista />

      {/* Banda superior con imagen */}
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
        <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-6 pb-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 border border-orange-500/30 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                Problema no resuelto
              </h1>
              <p className="text-white/90 text-sm font-medium" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
                Describe un problema o consulta los que todavía están sin solución.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="card p-6 sm:p-8">
            <ProblemasTabs />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
