import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const fd      = await request.formData()
    const archivo = fd.get('audio') as File | null
    const ctx     = (fd.get('contexto') as string | null) || 'ideas'

    if (!archivo || archivo.size === 0) {
      return NextResponse.json({ error: 'No se recibió audio' }, { status: 400 })
    }
    if (archivo.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'El audio supera el límite de 10 MB' }, { status: 400 })
    }

    const ext  = archivo.type.includes('mp4') ? 'm4a'
               : archivo.type.includes('ogg') ? 'ogg'
               : 'webm'
    const ruta = `${ctx}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const buffer = Buffer.from(await archivo.arrayBuffer())

    const { error } = await supabase.storage
      .from('audios')
      .upload(ruta, buffer, { contentType: archivo.type, upsert: false })

    if (error) {
      console.error('[SYM LAB] Error subiendo audio:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data } = supabase.storage.from('audios').getPublicUrl(ruta)
    return NextResponse.json({ url: data.publicUrl })
  } catch (err) {
    console.error('[SYM LAB] Error en upload de audio:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
