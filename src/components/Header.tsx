'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import NotificacionesBell from './NotificacionesBell'

interface HeaderProps {
  /** Oculta los enlaces de navegación principales (para formulario/admin) */
  minimalista?: boolean
}

export default function Header({ minimalista = false }: HeaderProps) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const ruta = usePathname()

  const enlaceActivo = (path: string) =>
    ruta === path ? 'text-white' : 'text-slate-400 hover:text-white'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-sym-bord/60 bg-sym-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/images/logo-symlab.png"
              alt="SYM LAB"
              width={120}
              height={120}
              className="h-10 w-auto rounded-lg transition-opacity group-hover:opacity-90"
              priority
            />
          </Link>

          {/* Navegación desktop */}
          {!minimalista && (
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className={`text-sm font-medium transition-colors ${enlaceActivo('/')}`}>
                Inicio
              </Link>
              <Link href="/ideas/nueva" className={`text-sm font-medium transition-colors ${enlaceActivo('/ideas/nueva')}`}>
                Enviar idea
              </Link>
              <Link href="/enlaces" className={`text-sm font-medium transition-colors ${enlaceActivo('/enlaces')}`}>
                Enlaces
              </Link>
              <Link href="/admin" className={`text-sm font-medium transition-colors ${enlaceActivo('/admin')}`}>
                Administración
              </Link>
            </nav>
          )}

          {/* Campana notificaciones + CTA desktop */}
          {!minimalista && (
            <div className="hidden md:flex items-center gap-3">
              <NotificacionesBell />
              <Link href="/ideas/nueva" className="btn-primary text-sm">
                Enviar una idea
              </Link>
            </div>
          )}

          {/* Campana + hamburguesa móvil */}
          {!minimalista && (
            <div className="md:hidden flex items-center gap-1">
              <NotificacionesBell />
              <button
                className="text-slate-400 hover:text-white p-2"
                onClick={() => setMenuAbierto(!menuAbierto)}
                aria-label="Menú"
              >
                {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* Volver en modo minimalista */}
          {minimalista && (
            <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
              ← Volver al inicio
            </Link>
          )}
        </div>

        {/* Menú móvil */}
        {!minimalista && menuAbierto && (
          <nav className="md:hidden border-t border-sym-bord py-4 flex flex-col gap-4">
            <Link href="/" className="text-sm font-medium text-slate-300" onClick={() => setMenuAbierto(false)}>
              Inicio
            </Link>
            <Link href="/ideas/nueva" className="text-sm font-medium text-slate-300" onClick={() => setMenuAbierto(false)}>
              Enviar idea
            </Link>
            <Link href="/enlaces" className="text-sm font-medium text-slate-300" onClick={() => setMenuAbierto(false)}>
              Enlaces
            </Link>
            <Link href="/admin" className="text-sm font-medium text-slate-300" onClick={() => setMenuAbierto(false)}>
              Administración
            </Link>
            <Link href="/ideas/nueva" className="btn-primary text-sm text-center" onClick={() => setMenuAbierto(false)}>
              Enviar una idea
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
