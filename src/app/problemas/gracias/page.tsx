import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Problema registrado — SYM LAB',
}

interface Props {
  searchParams: { id?: string }
}

export default function PaginaGraciasProblema({ searchParams }: Props) {
  const id = searchParams.id

  return (
    <div className="min-h-screen flex flex-col bg-sym-dark">
      <Header minimalista />

      <div className="fixed inset-0 -z-10" style={{ backgroundImage: 'url(/images/logo_41.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="fixed inset-0 -z-10 bg-black/72" />

      <main className="flex-1 flex items-center justify-center px-4 pt-16 pb-10">
        <div className="max-w-lg w-full text-center">

          <div className="relative inline-flex mb-8">
            <div className="w-24 h-24 bg-orange-500/10 border-2 border-orange-500/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-orange-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-sym-red rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">
            ¡Problema registrado!
          </h1>
          <p className="text-slate-300 text-base mb-6 leading-relaxed">
            Tu problema ha sido enviado correctamente. El equipo lo analizará y buscará
            posibles soluciones. Gracias por contribuir a mejorar.
          </p>

          {id && (
            <div className="card p-4 mb-8 text-left bg-sym-card/90 backdrop-blur-sm">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Identificador del registro</p>
              <code className="text-orange-400 text-sm font-mono break-all">{id}</code>
              <p className="text-slate-600 text-xs mt-2">Guarda este código por si necesitas hacer referencia a tu problema.</p>
            </div>
          )}

          <div className="card p-6 mb-8 text-left space-y-4 bg-sym-card/90 backdrop-blur-sm">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">¿Qué ocurre ahora?</h2>
            {[
              { n: '1', texto: 'El equipo responsable revisará el problema enviado.' },
              { n: '2', texto: 'Se analizará su frecuencia, impacto y área afectada.' },
              { n: '3', texto: 'Si se encuentra una solución, se asignará un responsable y se pondrá en marcha.' },
            ].map(({ n, texto }) => (
              <div key={n} className="flex items-start gap-3">
                <span className="w-5 h-5 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{n}</span>
                <p className="text-slate-400 text-sm">{texto}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/problemas/nueva" className="btn-primary flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Registrar otro problema
            </Link>
            <Link href="/" className="btn-secondary flex items-center justify-center gap-2">
              Volver al inicio
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
