import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'
import { leerComentarios, guardarComentario } from '@/lib/storage'
import { enviarPush } from '@/lib/push'
import type { RolComentario } from '@/lib/types'

export const runtime = 'nodejs'

const BUCKET_AUDIOS   = 'audios'
const BUCKET_ADJUNTOS = 'adjuntos'

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
    const fd = await request.formData()

    const ideaId        = (fd.get('ideaId')        as string | null)?.trim()
    const nombre        = (fd.get('nombre')        as string | null)?.trim()
    const texto         = (fd.get('texto')         as string | null)?.trim() ?? ''
    const rol           = (fd.get('rol')           as string | null) ?? 'Colaborador'
    const audioDuracion = parseInt((fd.get('audioDuracion') as string | null) ?? '0', 10)
    const audioFile     = fd.get('audio') as File | null
    const archivosRaw   = fd.getAll('archivos') as File[]

    if (!ideaId) return NextResponse.json({ error: 'ideaId es obligatorio' }, { status: 400 })
    if (!nombre) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })

    const tieneContenido = texto || (audioFile && audioFile.size > 0) || archivosRaw.some(f => f instanceof File && f.size > 0)
    if (!tieneContenido) {
      return NextResponse.json({ error: 'Escribe un comentario, graba un audio o adjunta un archivo.' }, { status: 400 })
    }
    if (texto.length > 1000) {
      return NextResponse.json({ error: 'El comentario no puede superar los 1000 caracteres' }, { status: 400 })
    }

    const rolesValidos: RolComentario[] = ['Autor', 'Revisor', 'Administrador', 'Colaborador']
    const rolFinal: RolComentario = rolesValidos.includes(rol as RolComentario) ? (rol as RolComentario) : 'Colaborador'

    const now = new Date()
    const fechaHora = now.toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

    // ── Subir audio ──────────────────────────────────────────────
    let audioUrl: string | undefined
    if (audioFile && audioFile.size > 0) {
      const ext  = audioFile.type.includes('mp4') ? 'm4a'
                 : audioFile.type.includes('ogg') ? 'ogg'
                 : 'webm'
      const ruta = `comentarios/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from(BUCKET_AUDIOS)
        .upload(ruta, Buffer.from(await audioFile.arrayBuffer()), { contentType: audioFile.type })
      if (!error) {
        const { data } = supabase.storage.from(BUCKET_AUDIOS).getPublicUrl(ruta)
        audioUrl = data.publicUrl
      } else {
        console.error('[SYM LAB] Error subiendo audio de comentario:', error.message)
      }
    }

    // ── Subir archivos adjuntos ───────────────────────────────────
    const archivosGuardados: string[] = []
    for (const archivo of archivosRaw) {
      if (!(archivo instanceof File) || archivo.size === 0) continue
      const nombreSeguro = `comentarios/${ideaId}/${Date.now()}_${archivo.name.replace(/[^a-zA-Z0-9._\-]/g, '_')}`
      const { error } = await supabase.storage
        .from(BUCKET_ADJUNTOS)
        .upload(nombreSeguro, Buffer.from(await archivo.arrayBuffer()), { contentType: archivo.type })
      if (error) {
        console.error('[SYM LAB] Error subiendo archivo de comentario:', error.message)
      } else {
        const { data } = supabase.storage.from(BUCKET_ADJUNTOS).getPublicUrl(nombreSeguro)
        archivosGuardados.push(data.publicUrl)
      }
    }

    const comentario = {
      id:            uuidv4(),
      ideaId,
      nombre,
      texto,
      rol:           rolFinal,
      fechaHora,
      audioUrl,
      audioDuracion: audioUrl ? (audioDuracion || undefined) : undefined,
      archivos:      archivosGuardados.length > 0 ? archivosGuardados : undefined,
    }

    await guardarComentario(comentario)

    enviarPush({
      tipo:    'comentario',
      titulo:  '💬 Nuevo comentario',
      mensaje: (texto || 'Audio / archivo adjunto').slice(0, 80),
      persona: nombre,
      url:     '/admin',
    }).catch(() => {})

    return NextResponse.json(comentario, { status: 201 })
  } catch (error) {
    console.error('[SYM LAB] Error guardando comentario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
