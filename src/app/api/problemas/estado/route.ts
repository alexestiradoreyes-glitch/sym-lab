import { NextRequest, NextResponse } from 'next/server'
import { supabase }                  from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET() {
  const { data, error } = await supabase
    .from('problemas')
    .select('id, estado, respuesta_equipo, solucion_oficial, proximos_pasos, responsable, fecha_estimada')

  if (error) return NextResponse.json({}, { status: 200 })

  const map: Record<string, {
    estado: string
    respuestaEquipo?: string
    solucionOficial?: string
    proximosPasos?: string
    responsable?: string
    fechaEstimada?: string
  }> = {}

  for (const row of data || []) {
    map[row.id] = {
      estado:          row.estado,
      respuestaEquipo: row.respuesta_equipo || undefined,
      solucionOficial: row.solucion_oficial || undefined,
      proximosPasos:   row.proximos_pasos   || undefined,
      responsable:     row.responsable      || undefined,
      fechaEstimada:   row.fecha_estimada   || undefined,
    }
  }
  return NextResponse.json(map)
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { problemaId, estado, respuestaEquipo, solucionOficial, proximosPasos, responsable, fechaEstimada } = body

  if (!problemaId) return NextResponse.json({ error: 'problemaId requerido' }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (estado          !== undefined) updates.estado            = estado
  if (respuestaEquipo !== undefined) updates.respuesta_equipo  = respuestaEquipo || null
  if (solucionOficial !== undefined) updates.solucion_oficial  = solucionOficial || null
  if (proximosPasos   !== undefined) updates.proximos_pasos    = proximosPasos   || null
  if (responsable     !== undefined) updates.responsable       = responsable     || null
  if (fechaEstimada   !== undefined) updates.fecha_estimada    = fechaEstimada   || null

  const { error } = await supabase.from('problemas').update(updates).eq('id', problemaId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
