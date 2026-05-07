import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { enviarPush } from '@/lib/push'
import type { EstadoIdea } from '@/lib/types'

export const runtime = 'nodejs'

export async function GET() {
  const { data } = await supabase.from('idea_states').select('*')
  const result: Record<string, EstadoIdea> = {}
  for (const row of data || []) {
    result[row.idea_id] = row.estado as EstadoIdea
  }
  return NextResponse.json(result)
}

export async function PATCH(req: NextRequest) {
  try {
    const { ideaId, tituloIdea, estado, persona } = await req.json()
    if (!ideaId || !estado) {
      return NextResponse.json({ error: 'ideaId y estado son obligatorios' }, { status: 400 })
    }

    await supabase.from('idea_states').upsert(
      { idea_id: ideaId, estado },
      { onConflict: 'idea_id' }
    )

    await enviarPush({
      tipo: 'estado',
      titulo: 'Estado de idea actualizado',
      mensaje: `"${tituloIdea}" → ${estado}`,
      persona: persona || 'Administración',
      url: '/admin',
    })

    return NextResponse.json({ ok: true, estado })
  } catch (err) {
    console.error('[SYM LAB] Error cambiando estado:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
