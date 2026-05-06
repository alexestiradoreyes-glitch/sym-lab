// Ruta API: GET /api/ideas-list
// Devuelve todas las ideas en JSON para el panel de administración

import { NextRequest, NextResponse } from 'next/server'
import { cookies }                   from 'next/headers'
import { leerIdeas }                 from '@/lib/excel'

export const runtime = 'nodejs'

export async function GET(_request: NextRequest) {
  // Verificar token de sesión
  const cookieStore = cookies()
  const token       = cookieStore.get('sym-admin-token')

  if (!process.env.ADMIN_SECRET_TOKEN || token?.value !== process.env.ADMIN_SECRET_TOKEN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const ideas = await leerIdeas()
    return NextResponse.json({ ideas, total: ideas.length })
  } catch (error) {
    console.error('[SYM LAB] Error leyendo ideas:', error)
    return NextResponse.json(
      { error: 'Error leyendo los datos. Comprueba que el archivo Excel existe.' },
      { status: 500 }
    )
  }
}
