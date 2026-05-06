import webpush from 'web-push'
import fs from 'fs'
import path from 'path'
import type { Notificacion, TipoNotificacion } from './types'
import { v4 as uuid } from 'uuid'

const DATA_DIR   = path.join(process.cwd(), 'data')
const SUBS_FILE  = path.join(DATA_DIR, 'subscriptions.json')
const NOTIF_FILE = path.join(DATA_DIR, 'notifications.json')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function readJson<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as T
  } catch { return fallback }
}

function writeJson(file: string, data: unknown) {
  ensureDir()
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
}

// ─── Configuración VAPID ──────────────────────────────────────

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT || 'mailto:admin@symlab.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
  )
}

// ─── Suscripciones ────────────────────────────────────────────

export type PushSubscription = {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

export function guardarSuscripcion(sub: PushSubscription) {
  const all = readJson<PushSubscription[]>(SUBS_FILE, [])
  const existe = all.find(s => s.endpoint === sub.endpoint)
  if (!existe) {
    all.push(sub)
    writeJson(SUBS_FILE, all)
  }
}

export function eliminarSuscripcion(endpoint: string) {
  const all = readJson<PushSubscription[]>(SUBS_FILE, [])
  writeJson(SUBS_FILE, all.filter(s => s.endpoint !== endpoint))
}

// ─── Historial de notificaciones ─────────────────────────────

export function guardarNotificacion(n: Omit<Notificacion, 'id' | 'leida' | 'fecha'>): Notificacion {
  const all = readJson<Notificacion[]>(NOTIF_FILE, [])
  const notif: Notificacion = {
    ...n,
    id: uuid(),
    leida: false,
    fecha: new Date().toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }),
  }
  all.unshift(notif)
  // Mantener solo las 200 más recientes
  writeJson(NOTIF_FILE, all.slice(0, 200))
  return notif
}

export function leerNotificaciones(): Notificacion[] {
  return readJson<Notificacion[]>(NOTIF_FILE, [])
}

export function marcarLeidas(ids: string[]) {
  const all = readJson<Notificacion[]>(NOTIF_FILE, [])
  ids.forEach(id => {
    const n = all.find(x => x.id === id)
    if (n) n.leida = true
  })
  writeJson(NOTIF_FILE, all)
}

export function marcarTodasLeidas() {
  const all = readJson<Notificacion[]>(NOTIF_FILE, [])
  all.forEach(n => { n.leida = true })
  writeJson(NOTIF_FILE, all)
}

// ─── Envío de push ────────────────────────────────────────────

export async function enviarPush(payload: {
  tipo: TipoNotificacion
  titulo: string
  mensaje: string
  persona: string
  url: string
}) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return

  // Guardar en historial
  guardarNotificacion(payload)

  const subs = readJson<PushSubscription[]>(SUBS_FILE, [])
  if (subs.length === 0) return

  const body = JSON.stringify({
    title: payload.titulo,
    body: `${payload.persona}: ${payload.mensaje}`,
    icon: '/icons/icon-192.png',
    badge: '/icons/favicon-32.png',
    url: payload.url,
    tag: payload.tipo,
  })

  const muertasEndpoints: string[] = []

  await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(sub as webpush.PushSubscription, body).catch((err: { statusCode?: number }) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          muertasEndpoints.push(sub.endpoint)
        }
      })
    )
  )

  if (muertasEndpoints.length > 0) {
    muertasEndpoints.forEach(e => eliminarSuscripcion(e))
  }
}
