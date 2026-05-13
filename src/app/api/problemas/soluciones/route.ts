import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 }             from 'uuid'
import { format }                    from 'date-fns'
import { es }                        from 'date-fns/locale'
import { supabase }                  from '@/lib/supabase'
import { guardarSolucion, leerSoluciones } from '@/lib/problemas'

export const runtime = 'nodejs'

const BUCKET_AUDIOS   = 'audios'
const BUCKET_ADJUNTOS = 'adjuntos'

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
    const fd = await request.formData()

    const problemaId    = (fd.get('problemaId')    as string | null)?.trim()
    const nombre        = (fd.get('nombre')        as string | null)?.trim()
    const solucion      = (fd.get('solucion')      as string | null)?.trim() ?? ''
    const audioDuracion = parseInt((fd.get('audioDuracion') as string | null) ?? '0', 10)
    const audioFile     = fd.get('audio') as File | null
    const archivosRaw   = fd.getAll('archivos') as File[]

    if (!problemaId) return NextResponse.json({ error: 'problemaId es obligatorio' }, { status: 400 })
    if (!nombre)     return NextResponse.json({ error: 'El nombre es obligatorio' },   { status: 400 })

    const tieneContenido = solucion || (audioFile && audioFile.size > 0) || archivosRaw.some(f => f instanceof File && f.size > 0)
    if (!tieneContenido) {
      return NextResponse.json({ error: 'Escribe un comentario, graba un audio o adjunta un archivo.' }, { status: 400 })
    }

    // ── Subir audio ──────────────────────────────────────────────
    let audioUrl: string | undefined
    if (audioFile && audioFile.size > 0) {
      const ext  = audioFile.type.includes('mp4') ? 'm4a'
                 : audioFile.type.includes('ogg') ? 'ogg'
                 : 'webm'
      const ruta = `soluciones/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from(BUCKET_AUDIOS)
        .upload(ruta, Buffer.from(await audioFile.arrayBuffer()), { contentType: audioFile.type })
      if (!error) {
        const { data } = supabase.storage.from(BUCKET_AUDIOS).getPublicUrl(ruta)
        audioUrl = data.publicUrl
      } else {
        console.error('[SYM LAB] Error subiendo audio de solución:', error.message)
      }
    }

    // ── Subir archivos adjuntos ───────────────────────────────────
    const archivosGuardados: string[] = []
    for (const archivo of archivosRaw) {
      if (!(archivo instanceof File) || archivo.size === 0) continue
      const nombreSeguro = `soluciones/${problemaId}/${Date.now()}_${archivo.name.replace(/[^a-zA-Z0-9._\-]/g, '_')}`
      const { error } = await supabase.storage
        .from(BUCKET_ADJUNTOS)
        .upload(nombreSeguro, Buffer.from(await archivo.arrayBuffer()), { contentType: archivo.type })
      if (error) {
        console.error('[SYM LAB] Error subiendo archivo de solución:', error.message)
      } else {
        const { data } = supabase.storage.from(BUCKET_ADJUNTOS).getPublicUrl(nombreSeguro)
        archivosGuardados.push(data.publicUrl)
      }
    }

    const nueva = {
      id:            uuidv4(),
      problemaId,
      nombre,
      solucion,
      fechaHora:     format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es }),
      audioUrl,
      audioDuracion: audioUrl ? (audioDuracion || undefined) : undefined,
      archivos:      archivosGuardados.length > 0 ? archivosGuardados : undefined,
    }

    await guardarSolucion(nueva)
    return NextResponse.json(nueva)

  } catch (error) {
    console.error('[SYM LAB] POST /api/problemas/soluciones error:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
