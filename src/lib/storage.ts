import { supabase } from './supabase'
import type { Comentario, Enlace } from './types'

// ─── Comentarios ──────────────────────────────────────────────

export async function leerComentarios(ideaId: string): Promise<Comentario[]> {
  const { data, error } = await supabase
    .from('comentarios')
    .select('*')
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: true })

  if (error) return []

  return (data || []).map(row => ({
    id: row.id,
    ideaId: row.idea_id,
    nombre: row.nombre,
    texto: row.texto ?? '',
    rol: row.rol,
    fechaHora: row.fecha_hora,
    audioUrl: row.audio_url || undefined,
    audioDuracion: row.audio_duracion || undefined,
    archivos: row.archivos || undefined,
  }))
}

export async function guardarComentario(comentario: Comentario): Promise<void> {
  const { error } = await supabase.from('comentarios').insert({
    id: comentario.id,
    idea_id: comentario.ideaId,
    nombre: comentario.nombre,
    texto: comentario.texto ?? '',
    rol: comentario.rol,
    fecha_hora: comentario.fechaHora,
    audio_url: comentario.audioUrl || null,
    audio_duracion: comentario.audioDuracion || null,
    archivos: comentario.archivos?.length ? comentario.archivos : null,
  })
  if (error) throw new Error(error.message)
}

// ─── Enlaces ──────────────────────────────────────────────────

export async function leerEnlaces(): Promise<Enlace[]> {
  const { data, error } = await supabase
    .from('enlaces')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []

  return (data || []).map(row => ({
    id: row.id,
    titulo: row.titulo,
    url: row.url,
    descripcion: row.descripcion || '',
    categoria: row.categoria,
    persona: row.persona,
    fecha: row.fecha,
  }))
}

export async function guardarEnlace(enlace: Enlace): Promise<void> {
  const { error } = await supabase.from('enlaces').insert({
    id: enlace.id,
    titulo: enlace.titulo,
    url: enlace.url,
    descripcion: enlace.descripcion || null,
    categoria: enlace.categoria,
    persona: enlace.persona,
    fecha: enlace.fecha,
  })
  if (error) throw new Error(error.message)
}

export async function eliminarEnlace(id: string): Promise<boolean> {
  const { error } = await supabase.from('enlaces').delete().eq('id', id)
  return !error
}

export async function eliminarComentario(id: string): Promise<void> {
  const { error } = await supabase.from('comentarios').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
