import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { leerEnlaces, guardarEnlace, eliminarEnlace } from '@/lib/storage'
import { enviarPush } from '@/lib/push'
import type { CategoriaEnlace } from '@/lib/types'

export const runtime = 'nodejs'

export async function GET() {
  const enlaces = await leerEnlaces()
  return NextResponse.json(enlaces)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { titulo, url, descripcion, categoria, persona } = body

    if (!titulo?.trim() || !url?.trim() || !persona?.trim()) {
      return NextResponse.json({ error: 'titulo, url y persona son obligatorios' }, { status: 400 })
    }
    if (titulo.trim().length > 150) {
      return NextResponse.json({ error: 'El título no puede superar los 150 caracteres' }, { status: 400 })
    }
    if (url.trim().length > 500) {
      return NextResponse.json({ error: 'La URL no puede superar los 500 caracteres' }, { status: 400 })
    }
    if ((descripcion ?? '').length > 300) {
      return NextResponse.json({ error: 'La descripción no puede superar los 300 caracteres' }, { status: 400 })
    }

    const categoriasValidas: CategoriaEnlace[] = [
      'Proyecto', 'Tecnología', 'Investigación', 'Convocatoria', 'Empresa', 'Artículo', 'Otro',
    ]
    const categoriaFinal: CategoriaEnlace = categoriasValidas.includes(categoria) ? categoria : 'Otro'

    const now = new Date()
    const fecha = now.toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

    const enlace = {
      id: uuidv4(),
      titulo: titulo.trim(),
      url: url.trim(),
      descripcion: (descripcion ?? '').trim(),
      categoria: categoriaFinal,
      persona: persona.trim(),
      fecha,
    }

    await guardarEnlace(enlace)

    enviarPush({
      tipo: 'enlace',
      titulo: '🔗 Nuevo enlace añadido',
      mensaje: titulo.trim(),
      persona: persona.trim(),
      url: '/enlaces',
    }).catch(() => {})

    return NextResponse.json(enlace, { status: 201 })
  } catch (error) {
    console.error('[SYM LAB] Error guardando enlace:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id requerido' }, { status: 400 })
  }
  const ok = await eliminarEnlace(id)
  return ok
    ? NextResponse.json({ success: true })
    : NextResponse.json({ error: 'Enlace no encontrado' }, { status: 404 })
}
