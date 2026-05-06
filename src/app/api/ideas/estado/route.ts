import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { enviarPush } from '@/lib/push'
import type { EstadoIdea } from '@/lib/types'

export const runtime = 'nodejs'

const ESTADOS_FILE = path.join(process.cwd(), 'data', 'idea-states.json')

function readEstados(): Record<string, EstadoIdea> {
  try {
    if (!fs.existsSync(ESTADOS_FILE)) return {}
    return JSON.parse(fs.readFileSync(ESTADOS_FILE, 'utf-8'))
  } catch { return {} }
}

function writeEstados(data: Record<string, EstadoIdea>) {
  const dir = path.dirname(ESTADOS_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(ESTADOS_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export function GET() {
  return NextResponse.json(readEstados())
}

export async function PATCH(req: NextRequest) {
  try {
    const { ideaId, tituloIdea, estado, persona } = await req.json()
    if (!ideaId || !estado) {
      return NextResponse.json({ error: 'ideaId y estado son obligatorios' }, { status: 400 })
    }
    const all = readEstados()
    all[ideaId] = estado as EstadoIdea
    writeEstados(all)

    await enviarPush({
      tipo: 'estado',
      titulo: 'Estado de idea actualizado',
      mensaje: `"${tituloIdea}" → ${estado}`,
      persona: persona || 'Administración',
      url: `/admin`,
    })

    return NextResponse.json({ ok: true, estado })
  } catch (err) {
    console.error('[SYM LAB] Error cambiando estado:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
