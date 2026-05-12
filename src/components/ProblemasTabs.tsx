'use client'

import { useState } from 'react'
import { AlertTriangle, List } from 'lucide-react'
import ProblemaForm    from './ProblemaForm'
import ProblemaRegistro from './ProblemaRegistro'

type Tab = 'describir' | 'registro'

export default function ProblemasTabs() {
  const [tab, setTab] = useState<Tab>('describir')

  return (
    <div className="space-y-0">

      {/* Selector de pestañas */}
      <div className="flex border-b border-sym-bord mb-0">
        {([
          { key: 'describir', label: 'Describir problema no resuelto', Icon: AlertTriangle },
          { key: 'registro',  label: 'Registro de problemas no resueltos', Icon: List },
        ] as const).map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap ${
              tab === key
                ? 'text-white border-orange-500'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{key === 'describir' ? 'Enviar' : 'Registro'}</span>
          </button>
        ))}
      </div>

      {/* Pestaña 1: formulario */}
      {tab === 'describir' && (
        <div className="pt-6">
          <div className="bg-orange-950/30 border border-orange-800/40 rounded-xl p-4 mb-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              En este apartado puedes describir un{' '}
              <strong className="text-white">problema común, repetido o importante</strong>{' '}
              que todavía no tenga una solución definida. El objetivo es recoger problemas reales
              para analizarlos, compartirlos con el equipo y buscar posibles soluciones.
            </p>
            <p className="text-slate-500 text-sm mt-2">
              No es necesario que conozcas la solución. Si identificas el problema, ya estás aportando valor.
            </p>
          </div>
          <ProblemaForm onSuccess={() => setTab('registro')} />
        </div>
      )}

      {/* Pestaña 2: registro */}
      {tab === 'registro' && (
        <div className="pt-6">
          <div className="bg-slate-900/60 border border-sym-bord/60 rounded-xl p-4 mb-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              Aquí puedes ver todos los problemas que todavía no tienen solución.
              Puedes{' '}
              <strong className="text-white">proponer una solución</strong>{' '}
              para cualquier problema o marcar uno como{' '}
              <strong className="text-green-400">Resuelto</strong>{' '}
              cuando haya sido solucionado.
            </p>
          </div>
          <ProblemaRegistro />
        </div>
      )}
    </div>
  )
}
