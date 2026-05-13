import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { leerComentarios, guardarComentario } from '@/lib/storage'
import { enviarPush } from '@/lib/push'
import type { RolComentario } from '@/lib/types'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const ideaId = request.nextUrl.searchParams.get('ideaId')
  if (!ideaId) {
    return NextResponse.json({ error: 'ideaId requerido' }, { status: 400 })
  }
  const comentarios = await leerComentarios(ideaId)
  return NextResponse.json(comentarios)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ideaId, nombre, texto, rol, audioUrl, audioDuracion, archivos } = body

    if (!ideaId || !nombre?.trim()) {
      return NextResponse.json({ error: 'ideaId y nombre son obligatorios' }, { status: 400 })
    }

    const tieneContenido = texto?.trim() || audioUrl || (archivos?.length > 0)
    if (!tieneContenido) {
      return NextResponse.json({ error: 'Escribe un comentario, graba un audio o adjunta un archivo.' }, { status: 400 })
    }
    if (texto && texto.trim().length > 1000) {
      return NextResponse.json({ error: 'El comentario no puede superar los 1000 caracteres' }, { status: 400 })
    }

    const rolesValidos: RolComentario[] = ['Autor', 'Revisor', 'Administrador', 'Colaborador']
    const rolFinal: RolComentario = rolesValidos.includes(rol) ? rol : 'Colaborador'

    const now = new Date()
    const fechaHora = now.toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

    const comentario = {
      id:            uuidv4(),
      ideaId,
      nombre:        nombre.trim(),
      texto:         texto?.trim() ?? '',
      rol:           rolFinal,
      fechaHora,
      audioUrl:      audioUrl || undefined,
      audioDuracion: audioUrl ? (audioDuracion || undefined) : undefined,
      archivos:      archivos?.length > 0 ? archivos : undefined,
    }

    await guardarComentario(comentario)

    enviarPush({
      tipo:    'comentario',
      titulo:  '💬 Nuevo comentario',
      mensaje: (texto?.trim() || 'Audio / archivo adjunto').slice(0, 80),
      persona: nombre.trim(),
      url:     '/admin',
    }).catch(() => {})

    return NextResponse.json(comentario, { status: 201 })
  } catch (error) {
    console.error('[SYM LAB] Error guardando comentario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
