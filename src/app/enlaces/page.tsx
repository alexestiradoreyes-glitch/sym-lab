import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EnlacesPanel from '@/components/EnlacesPanel'

export const metadata = {
  title: 'Enlaces — SYM LAB',
}

export default function PaginaEnlaces() {
  return (
    <div className="min-h-screen flex flex-col bg-sym-dark">
      <Header />

      {/* Banda superior con imagen corporativa */}
      <div
        className="relative pt-16 overflow-hidden"
        style={{
          backgroundImage: 'url(/images/logo_29.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          height: '220px',
        }}
      >
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-6 pb-8 max-w-7xl mx-auto">
          <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">Recursos externos</p>
          <h1 className="text-4xl font-black text-white tracking-wide">
            <span className="text-sym-red">_</span>Referencias e inspiración
          </h1>
        </div>
      </div>

      <main className="flex-1">
        <EnlacesPanel />
      </main>
      <Footer />
    </div>
  )
}
