import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 }             from 'uuid'
import { format }                    from 'date-fns'
import { es }                        from 'date-fns/locale'
import { guardarSolucion, leerSoluciones } from '@/lib/problemas'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const problemaId = request.nextUrl.searchParams.get('problemaId')
  if (!problemaId) return NextResponse.json([], { status: 200 })

  try {
    const soluciones = await leerSoluciones(problemaId)
    return NextResponse.json(soluciones)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { problemaId, nombre, solucion, audioUrl, audioDuracion, archivos } = body

    if (!problemaId) return NextResponse.json({ error: 'problemaId es obligatorio' }, { status: 400 })
    if (!nombre?.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })

    const tieneContenido = solucion?.trim() || audioUrl || (archivos?.length > 0)
    if (!tieneContenido) {
      return NextResponse.json({ error: 'Escribe un mensaje, graba un audio o adjunta un archivo.' }, { status: 400 })
    }

    const nueva = {
      id:            uuidv4(),
      problemaId,
      nombre:        nombre.trim(),
      solucion:      solucion?.trim() ?? '',
      fechaHora:     format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es }),
      audioUrl:      audioUrl || undefined,
      audioDuracion: audioUrl ? (audioDuracion || undefined) : undefined,
      archivos:      archivos?.length > 0 ? archivos : undefined,
    }

    await guardarSolucion(nueva)
    return NextResponse.json(nueva)

  } catch (error) {
    console.error('[SYM LAB] POST /api/problemas/soluciones error:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
