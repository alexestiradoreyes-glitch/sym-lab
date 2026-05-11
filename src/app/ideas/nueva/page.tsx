import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import IdeaForm from '@/components/IdeaForm'
import { FlaskConical } from 'lucide-react'

export const metadata = {
  title: 'Enviar idea — SYM LAB',
  description: 'Comparte tu propuesta de innovación con SYM LAB.',
}

export default function PaginaFormulario() {
  return (
    <div className="min-h-screen flex flex-col bg-sym-dark">
      <Header minimalista />

      {/* Banda superior con imagen corporativa */}
      <div
        className="relative pt-16 overflow-hidden"
        style={{
          backgroundImage: 'url(/images/img_27.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          height: '200px',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/40" />
        <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-6 pb-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sym-red/20 border border-sym-red/30 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-sym-red" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>Envía tu idea</h1>
              <p className="text-white/90 text-sm font-medium" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>Cuanta más información, mejor podemos evaluarla</p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="card p-6 sm:p-10">
            <Suspense fallback={<div className="text-slate-400 text-sm">Cargando formulario...</div>}>
              <IdeaForm />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
