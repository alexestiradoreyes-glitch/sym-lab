import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

const BUCKET = 'adjuntos'
const MAX_MB  = 20

export async function POST(request: NextRequest) {
  try {
    const fd      = await request.formData()
    const archivo = fd.get('archivo') as File | null
    const ctx     = (fd.get('contexto') as string | null) ?? 'otros'

    if (!archivo || archivo.size === 0) {
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
    }
    if (archivo.size > MAX_MB * 1024 * 1024) {
      return NextResponse.json({ error: `El archivo supera el límite de ${MAX_MB} MB` }, { status: 400 })
    }

    const nombreSeguro = `${ctx}/${Date.now()}_${archivo.name.replace(/[^a-zA-Z0-9._\-]/g, '_')}`
    const buffer = Buffer.from(await archivo.arrayBuffer())

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(nombreSeguro, buffer, { contentType: archivo.type, upsert: false })

    if (error) {
      console.error('[SYM LAB] Error subiendo adjunto:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(nombreSeguro)
    return NextResponse.json({ url: data.publicUrl })
  } catch (err) {
    console.error('[SYM LAB] Error en upload de adjunto:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
