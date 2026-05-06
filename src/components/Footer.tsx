import Image from 'next/image'

export default function Footer() {
  const anio = new Date().getFullYear()

  return (
    <footer className="border-t border-sym-bord mt-auto overflow-hidden relative">
      {/* Imagen de fondo muy sutil */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/images/img_61.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 60%',
        }}
      />
      <div className="absolute inset-0 bg-black/88" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-symlab.png"
              alt="SYM LAB"
              width={80}
              height={80}
              className="h-10 w-auto rounded-lg"
            />
            <p className="text-slate-500 text-xs">Portal de Ideas I+D+i</p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-slate-500 text-xs">
              © {anio} SYM LAB. Todos los derechos reservados.
            </p>
            <p className="text-slate-600 text-xs mt-1">
              Los datos facilitados son tratados conforme al RGPD (UE) 2016/679.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
