import fs   from 'fs'
import path from 'path'
import type { Comentario, Enlace } from './types'

const DATA_DIR       = path.join(process.cwd(), 'data')
const COMMENTS_FILE  = path.join(DATA_DIR, 'comments.json')
const ENLACES_FILE   = path.join(DATA_DIR, 'enlaces.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function readJson<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback
    const raw = fs.readFileSync(file, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(file: string, data: unknown) {
  ensureDataDir()
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
}

// ─── Comentarios ────────────────────────────────────────────────

export function leerComentarios(ideaId: string): Comentario[] {
  const all = readJson<Record<string, Comentario[]>>(COMMENTS_FILE, {})
  return all[ideaId] ?? []
}

export function guardarComentario(comentario: Comentario): void {
  const all = readJson<Record<string, Comentario[]>>(COMMENTS_FILE, {})
  if (!all[comentario.ideaId]) all[comentario.ideaId] = []
  all[comentario.ideaId].push(comentario)
  writeJson(COMMENTS_FILE, all)
}

// ─── Enlaces ─────────────────────────────────────────────────────

export function leerEnlaces(): Enlace[] {
  return readJson<Enlace[]>(ENLACES_FILE, [])
}

export function guardarEnlace(enlace: Enlace): void {
  const all = readJson<Enlace[]>(ENLACES_FILE, [])
  all.unshift(enlace)
  writeJson(ENLACES_FILE, all)
}

export function eliminarEnlace(id: string): boolean {
  const all = readJson<Enlace[]>(ENLACES_FILE, [])
  const idx = all.findIndex(e => e.id === id)
  if (idx === -1) return false
  all.splice(idx, 1)
  writeJson(ENLACES_FILE, all)
  return true
}
