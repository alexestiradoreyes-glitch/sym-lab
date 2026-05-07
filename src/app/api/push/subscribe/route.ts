import { NextRequest, NextResponse } from 'next/server'
import { guardarSuscripcion, eliminarSuscripcion } from '@/lib/push'

export const runtime = 'nodejs'

export function GET() {
  return NextResponse.json({
    publicKey: process.env.VAPID_PUBLIC_KEY ?? '',
  })
}

export async function POST(req: NextRequest) {
  try {
    const sub = await req.json()
    if (!sub?.endpoint || !sub?.keys) {
      return NextResponse.json({ error: 'Suscripción inválida' }, { status: 400 })
    }
    await guardarSuscripcion(sub)
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error guardando suscripción' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json()
    if (!endpoint) return NextResponse.json({ error: 'endpoint requerido' }, { status: 400 })
    await eliminarSuscripcion(endpoint)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error eliminando suscripción' }, { status: 500 })
  }
}
