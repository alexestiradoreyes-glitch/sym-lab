import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  FlaskConical, Lightbulb, ArrowRight, CheckCircle2,
  Cpu, Leaf, Microscope, Wrench, Send, BarChart3,
} from 'lucide-react'

export default function PaginaInicio() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* ── HERO — portada corporativa ────────────────────── */}
      <section
        className="relative flex-1 flex items-center justify-center overflow-hidden pt-16"
        style={{
          backgroundImage: 'url(/images/portada.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/62" />
        <div className="absolute inset-0 bg-sym-red/5" />

        <div className="relative z-10 text-center px-4 sm:px-6 py-24 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-sym-red/10 border border-sym-red/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-sym-red rounded-full animate-pulse" />
            <span className="text-sym-red-l text-sm font-medium">Portal de Innovación Abierto</span>
          </div>

          <h1 className="font-black text-6xl sm:text-7xl md:text-8xl tracking-widest text-white text-glow mb-6">
            SYM LAB
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 font-light max-w-3xl mx-auto mb-4">
            Impulsa la <span className="text-white font-semibold">innovación</span>. Comparte tu idea.
          </p>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-12">
            Tienes una propuesta de investigación, desarrollo o mejora tecnológica?
            SYM LAB recopila las mejores ideas para convertirlas en realidad.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/ideas/nueva" className="btn-primary flex items-center gap-2 text-base px-8 py-4 glow-red">
              <Lightbulb className="w-5 h-5" />
              Enviar mi idea
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#como-funciona" className="btn-secondary flex items-center gap-2 text-base px-8 py-4">
              ¿Cómo funciona?
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {[
              { valor: '100%', texto: 'Confidencial' },
              { valor: '7',    texto: 'Categorías' },
              { valor: '∞',    texto: 'Posibilidades' },
            ].map(({ valor, texto }) => (
              <div key={texto} className="text-center">
                <p className="text-3xl font-black text-sym-red-l">{valor}</p>
                <p className="text-slate-500 text-sm mt-1">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORÍAS — gemelo digital / ingeniería naval ── */}
      <section
        className="relative py-20 px-4 sm:px-6 overflow-hidden"
        style={{
          backgroundImage: 'url(/images/img_62.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/72" />
        <div className="absolute inset-0 bg-sym-dark/40" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">Áreas de innovación</h2>
            <p className="section-subtitle">Buscamos ideas en todas las disciplinas tecnológicas</p>
            <div className="red-line w-20 mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {[
              { icon: Lightbulb,    label: 'Innovación',              color: 'text-purple-400' },
              { icon: Microscope,   label: 'Investigación',           color: 'text-blue-400' },
              { icon: Cpu,          label: 'Desarrollo',              color: 'text-cyan-400' },
              { icon: Wrench,       label: 'Mejora de proceso',       color: 'text-yellow-400' },
              { icon: Leaf,         label: 'Sostenibilidad',          color: 'text-green-400' },
              { icon: BarChart3,    label: 'Inteligencia artificial', color: 'text-red-400' },
              { icon: FlaskConical, label: 'Otro',                    color: 'text-slate-400' },
            ].map(({ icon: Icon, label, color }) => (
              <Link
                href="/ideas/nueva"
                key={label}
                className="card p-5 flex flex-col items-center gap-3 text-center card-hover hover:border-sym-red/40 group bg-sym-card/80 backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-sym-surf/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <span className="text-slate-300 text-sm font-medium leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA — barco rojo 3D render ────────── */}
      <section
        id="como-funciona"
        className="relative py-20 px-4 sm:px-6 overflow-hidden"
        style={{
          backgroundImage: 'url(/images/img_35.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-sym-dark/50" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">¿Cómo funciona?</h2>
            <p className="section-subtitle">Tres pasos para que tu idea llegue a quien puede hacerla realidad</p>
            <div className="red-line w-20 mx-auto mt-4" />
          </div>

          <div className="space-y-6">
            {[
              {
                paso: '01',
                titulo: 'Rellena el formulario',
                desc: 'Describe tu idea con el mayor detalle posible: qué problema resuelve, qué beneficios aporta y en qué estado de desarrollo se encuentra.',
              },
              {
                paso: '02',
                titulo: 'Tu idea se registra automáticamente',
                desc: 'Al enviar, tu propuesta queda guardada de forma segura, se genera un identificador único y el equipo de SYM LAB recibe una notificación inmediata.',
              },
              {
                paso: '03',
                titulo: 'El equipo la evalúa',
                desc: 'Las ideas se revisan, clasifican y evalúan. Las más prometedoras pasan a la siguiente fase de validación y desarrollo.',
              },
            ].map(({ paso, titulo, desc }) => (
              <div key={paso} className="card p-6 flex gap-6 items-start card-hover bg-sym-card/85 backdrop-blur-sm">
                <div className="text-5xl font-black text-sym-red/30 leading-none flex-shrink-0 w-16 text-right">
                  {paso}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">{titulo}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GARANTÍAS — catamarán aéreo ──────────────────── */}
      <section
        className="relative py-20 px-4 sm:px-6 overflow-hidden"
        style={{
          backgroundImage: 'url(/images/logo_33.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/68" />
        <div className="absolute inset-0 bg-sym-dark/30" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">Tus datos, protegidos</h2>
            <p className="section-subtitle">Cumplimos con el RGPD y tratamos tu información con total confidencialidad</p>
            <div className="red-line w-20 mx-auto mt-4" />
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { titulo: 'Confidencialidad total',  desc: 'Tus ideas no se comparten con terceros ni se publican sin tu consentimiento.' },
              { titulo: 'Conformidad RGPD',        desc: 'Tratamos tus datos conforme al Reglamento (UE) 2016/679 de protección de datos.' },
              { titulo: 'Almacenamiento seguro',   desc: 'Los datos se guardan en sistemas propios y no en servicios de terceros externos.' },
            ].map(({ titulo, desc }) => (
              <div key={titulo} className="card p-6 bg-sym-card/85 backdrop-blur-sm">
                <CheckCircle2 className="w-8 h-8 text-sym-red mb-4" />
                <h3 className="text-white font-semibold mb-2">{titulo}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL — barco turquesa con cielo ─────────── */}
      <section
        className="relative py-24 px-4 sm:px-6 overflow-hidden"
        style={{
          backgroundImage: 'url(/images/img_34.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-sym-red/8" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <Send className="w-12 h-12 text-sym-red mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            ¿Tienes una idea brillante?
          </h2>
          <p className="text-slate-300 mb-10 text-lg">
            No la guardes solo para ti. Compártela con SYM LAB y ayúdanos a construir el futuro de la innovación.
          </p>
          <Link href="/ideas/nueva" className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-4 glow-red">
            <Lightbulb className="w-5 h-5" />
            Enviar mi idea ahora
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
