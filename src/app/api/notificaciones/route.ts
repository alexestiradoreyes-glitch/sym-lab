import { NextRequest, NextResponse } from 'next/server'
import { leerNotificaciones, marcarLeidas, marcarTodasLeidas } from '@/lib/push'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json(await leerNotificaciones())
}

export async function PATCH(req: NextRequest) {
  try {
    const { ids, todas } = await req.json()
    if (todas) {
      await marcarTodasLeidas()
    } else if (Array.isArray(ids)) {
      await marcarLeidas(ids)
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error actualizando notificaciones' }, { status: 500 })
  }
}
