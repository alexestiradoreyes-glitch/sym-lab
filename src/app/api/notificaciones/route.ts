import { NextRequest, NextResponse } from 'next/server'
import { leerNotificaciones, marcarLeidas, marcarTodasLeidas } from '@/lib/push'

export const runtime = 'nodejs'

export function GET() {
  return NextResponse.json(leerNotificaciones())
}

export async function PATCH(req: NextRequest) {
  try {
    const { ids, todas } = await req.json()
    if (todas) {
      marcarTodasLeidas()
    } else if (Array.isArray(ids)) {
      marcarLeidas(ids)
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error actualizando notificaciones' }, { status: 500 })
  }
}
