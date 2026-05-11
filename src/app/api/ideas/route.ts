// Ruta API: POST /api/ideas
// Recibe el formulario, guarda en Excel y envía el email

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 }             from 'uuid'
import { format }                    from 'date-fns'
import { es }                        from 'date-fns/locale'
import { guardarIdea }               from '@/lib/excel'
import { enviarEmailIdea }           from '@/lib/email'
import { enviarPush }                from '@/lib/push'
import { supabase }                  from '@/lib/supabase'
import type { Idea }                 from '@/lib/types'

export const runtime = 'nodejs'

const BUCKET = 'adjuntos'

export async function GET() {
  try {
    const { leerIdeas } = await import('@/lib/excel')
    const ideas = await leerIdeas()
    return NextResponse.json(ideas)
  } catch (err) {
    console.error('[SYM LAB] GET /api/ideas error:', err)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const fd = await request.formData()

    // ── Campos de texto ──
    const nombre              = (fd.get('nombre')              as string)?.trim()
    const empresa             = (fd.get('empresa')             as string)?.trim()
    const email               = (fd.get('email')               as string)?.trim()
    const telefono            = (fd.get('telefono')            as string)?.trim()
    const titulo              = (fd.get('titulo')              as string)?.trim()
    const categoria           = (fd.get('categoria')           as string)?.trim()
    const descripcion         = (fd.get('descripcion')         as string)?.trim()
    const problemaResuelve    = (fd.get('problemaResuelve')    as string)?.trim()
    const beneficiosEsperados = (fd.get('beneficiosEsperados') as string)?.trim()
    const nivelMadurez         = (fd.get('nivelMadurez')         as string)?.trim()
    const enlacesReferencia    = (fd.get('enlacesReferencia')    as string)?.trim()
    const consentimiento       = fd.get('consentimiento') === 'true'
    const audioUrl             = (fd.get('audioUrl')             as string)?.trim() || undefined
    const audioDuracionStr     = fd.get('audioDuracion') as string | null
    const audioDuracion        = audioDuracionStr ? parseInt(audioDuracionStr, 10) : undefined

    // ── Validación básica de campos obligatorios ──
    const errores: string[] = []
    if (!nombre)                       errores.push('nombre')
    if (!email)                        errores.push('email')
    if (!titulo)                       errores.push('titulo')
    if (!categoria)                    errores.push('categoria')
    if (!nivelMadurez)                 errores.push('nivelMadurez')
    if (!consentimiento)               errores.push('consentimiento')
    if (!descripcion)                   errores.push('descripción')

    if (errores.length > 0) {
      return NextResponse.json(
        { error: `Faltan campos obligatorios: ${errores.join(', ')}` },
        { status: 400 }
      )
    }

    // ── Metadatos ──
    const id         = uuidv4()
    const fechaEnvio = format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: es })

    // ── Archivos adjuntos → Supabase Storage ──
    const archivosGuardados: string[] = []
    const archivosRecibidos = fd.getAll('archivos') as File[]

    if (archivosRecibidos.length > 0 && archivosRecibidos[0].size > 0) {
      for (const archivo of archivosRecibidos) {
        if (!(archivo instanceof File) || archivo.size === 0) continue

        const nombreSeguro = `${id}/${Date.now()}_${archivo.name.replace(/[^a-zA-Z0-9._\-]/g, '_')}`
        const bytes = await archivo.arrayBuffer()

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(nombreSeguro, Buffer.from(bytes), {
            contentType: archivo.type,
            upsert: false,
          })

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(nombreSeguro)
          archivosGuardados.push(urlData.publicUrl)
        }
      }
    }

    // ── Construir objeto idea ──
    const idea: Idea = {
      id,
      fechaEnvio,
      nombre,
      empresa:             empresa     || undefined,
      email,
      telefono:            telefono    || undefined,
      titulo,
      categoria:           categoria   as Idea['categoria'],
      descripcion:         descripcion         || undefined,
      problemaResuelve:    problemaResuelve    || undefined,
      beneficiosEsperados: beneficiosEsperados || undefined,
      nivelMadurez:        nivelMadurez as Idea['nivelMadurez'],
      archivos:            archivosGuardados.length > 0 ? archivosGuardados : undefined,
      enlacesReferencia:   enlacesReferencia || undefined,
      consentimiento,
      audioUrl,
      audioDuracion,
    }

    // ── Guardar en base de datos (OBLIGATORIO — si falla, devuelve error) ──
    try {
      await guardarIdea(idea)
    } catch (err) {
      const msg = (err as Error).message
      console.error('[SYM LAB] Error guardando idea en Supabase:', msg)
      return NextResponse.json(
        { error: `No se pudo guardar la idea en la base de datos: ${msg}` },
        { status: 500 }
      )
    }

    // ── Notificación push (no bloquea) ──
    enviarPush({
      tipo: 'idea',
      titulo: '💡 Nueva idea enviada',
      mensaje: `"${idea.titulo}"`,
      persona: idea.nombre,
      url: '/admin',
    }).catch(() => {})

    // ── Enviar email (no bloquea) ──
    enviarEmailIdea(idea).catch(err =>
      console.error('[SYM LAB] Error enviando email:', err)
    )

    return NextResponse.json({
      success: true,
      id,
      fechaEnvio,
      message: '¡Idea registrada correctamente!',
    })

  } catch (error) {
    console.error('[SYM LAB] Error general:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor. Inténtalo de nuevo.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  // Borrar archivos adjuntos de Supabase Storage
  const { data: archivos } = await supabase.storage.from(BUCKET).list(id)
  if (archivos && archivos.length > 0) {
    const rutas = archivos.map(f => `${id}/${f.name}`)
    await supabase.storage.from(BUCKET).remove(rutas)
  }

  const { error } = await supabase.from('ideas').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('idea_states').delete().eq('idea_id', id)

  await enviarPush({
    tipo: 'estado',
    titulo: '🗑️ Idea eliminada',
    mensaje: 'Una idea ha sido eliminada desde Administración',
    persona: 'Administración',
    url: '/admin',
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
