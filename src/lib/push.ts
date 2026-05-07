import webpush from 'web-push'
import { supabase } from './supabase'
import type { Notificacion, TipoNotificacion } from './types'
import { v4 as uuid } from 'uuid'

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

export async function guardarSuscripcion(sub: PushSubscription) {
  await supabase.from('push_subscriptions').upsert({
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
  }, { onConflict: 'endpoint' })
}

export async function eliminarSuscripcion(endpoint: string) {
  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
}

// ─── Historial de notificaciones ─────────────────────────────

export async function guardarNotificacion(
  n: Omit<Notificacion, 'id' | 'leida' | 'fecha'>
): Promise<Notificacion> {
  const notif: Notificacion = {
    ...n,
    id: uuid(),
    leida: false,
    fecha: new Date().toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }),
  }
  await supabase.from('notificaciones').insert({
    id: notif.id,
    tipo: notif.tipo,
    titulo: notif.titulo,
    mensaje: notif.mensaje,
    persona: notif.persona,
    url: notif.url,
    leida: false,
    fecha: notif.fecha,
  })
  return notif
}

export async function leerNotificaciones(): Promise<Notificacion[]> {
  const { data } = await supabase
    .from('notificaciones')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  return (data || []).map(row => ({
    id: row.id,
    tipo: row.tipo,
    titulo: row.titulo,
    mensaje: row.mensaje,
    persona: row.persona,
    url: row.url,
    leida: row.leida,
    fecha: row.fecha,
  }))
}

export async function marcarLeidas(ids: string[]) {
  await supabase.from('notificaciones').update({ leida: true }).in('id', ids)
}

export async function marcarTodasLeidas() {
  await supabase.from('notificaciones').update({ leida: true }).eq('leida', false)
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

  await guardarNotificacion(payload)

  const { data: subs } = await supabase.from('push_subscriptions').select('*')
  if (!subs || subs.length === 0) return

  const body = JSON.stringify({
    titulo: payload.titulo,
    mensaje: payload.mensaje,
    persona: payload.persona,
    tipo: payload.tipo,
    url: payload.url,
  })

  const muertasEndpoints: string[] = []

  await Promise.allSettled(
    subs.map(row => {
      const sub = {
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth },
      }
      return webpush.sendNotification(sub as webpush.PushSubscription, body)
        .catch((err: { statusCode?: number }) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            muertasEndpoints.push(row.endpoint)
          }
        })
    })
  )

  if (muertasEndpoints.length > 0) {
    await Promise.all(muertasEndpoints.map(e => eliminarSuscripcion(e)))
  }
}
