'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Lightbulb, Link2, Settings } from 'lucide-react'

const NAV = [
  { href: '/',           label: 'Inicio',    Icon: Home },
  { href: '/ideas/nueva',label: 'Nueva idea', Icon: Lightbulb },
  { href: '/enlaces',    label: 'Enlaces',   Icon: Link2 },
  { href: '/admin',      label: 'Admin',     Icon: Settings },
]

export default function BottomNav() {
  const ruta = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-sym-bord bg-sym-dark/95 backdrop-blur-md safe-bottom">
      <div className="flex items-stretch">
        {NAV.map(({ href, label, Icon }) => {
          const activo = ruta === href || (href !== '/' && ruta.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
                activo
                  ? 'text-sym-red'
                  : 'text-slate-500 hover:text-slate-300 active:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${activo ? 'text-sym-red' : ''}`} />
              <span className={`text-[10px] font-medium leading-none ${activo ? 'text-sym-red' : ''}`}>
                {label}
              </span>
              {activo && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-sym-red rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
