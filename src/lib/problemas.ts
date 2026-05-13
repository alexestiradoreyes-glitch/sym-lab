import { supabase } from './supabase'
import type { Problema, EstadoProblema, ProblemasSolucion } from './types'

const BUCKET = 'adjuntos'

export async function guardarProblema(p: Problema): Promise<void> {
  const { error } = await supabase.from('problemas').insert({
    id:                  p.id,
    fecha_envio:         p.fechaEnvio,
    nombre:              p.nombre,
    email:               p.email,
    empresa:             p.empresa || null,
    titulo:              p.titulo,
    descripcion:         p.descripcion,
    contexto:            p.contexto || null,
    frecuencia:          p.frecuencia,
    impacto:             p.impacto,
    area:                p.area,
    archivos:            p.archivos || null,
    enlaces_referencia:  p.enlacesReferencia || null,
    solucion_propuesta:  p.solucionPropuesta || null,
    beneficio_esperado:  p.beneficioEsperado || null,
    recursos_necesarios: p.recursosNecesarios || null,
    estado:              p.estado || 'Nuevo',
    audio_url:           p.audioUrl || null,
    audio_duracion:      p.audioDuracion || null,
  })
  if (error) throw new Error(error.message)
}

export async function leerProblemas(): Promise<Problema[]> {
  const { data, error } = await supabase
    .from('problemas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[SYM LAB] leerProblemas error:', error.message)
    return []
  }

  return (data || []).map(row => ({
    id:                  row.id,
    fechaEnvio:          row.fecha_envio,
    nombre:              row.nombre,
    email:               row.email,
    empresa:             row.empresa || undefined,
    titulo:              row.titulo,
    descripcion:         row.descripcion,
    contexto:            row.contexto || undefined,
    frecuencia:          row.frecuencia as Problema['frecuencia'],
    impacto:             row.impacto as Problema['impacto'],
    area:                row.area as Problema['area'],
    archivos:            row.archivos || undefined,
    enlacesReferencia:   row.enlaces_referencia || undefined,
    solucionPropuesta:   row.solucion_propuesta || undefined,
    beneficioEsperado:   row.beneficio_esperado || undefined,
    recursosNecesarios:  row.recursos_necesarios || undefined,
    estado:              (row.estado as EstadoProblema) || 'Nuevo',
    respuestaEquipo:     row.respuesta_equipo || undefined,
    solucionOficial:     row.solucion_oficial || undefined,
    proximosPasos:       row.proximos_pasos || undefined,
    responsable:         row.responsable || undefined,
    fechaEstimada:       row.fecha_estimada || undefined,
    audioUrl:            row.audio_url || undefined,
    audioDuracion:       row.audio_duracion || undefined,
  }))
}

export async function guardarSolucion(s: ProblemasSolucion): Promise<void> {
  const { error } = await supabase.from('problema_soluciones').insert({
    id:             s.id,
    problema_id:    s.problemaId,
    nombre:         s.nombre,
    solucion:       s.solucion,
    fecha_hora:     s.fechaHora,
    audio_url:      s.audioUrl || null,
    audio_duracion: s.audioDuracion || null,
    archivos:       s.archivos?.length ? s.archivos : null,
  })
  if (error) throw new Error(error.message)
}

export async function leerSoluciones(problemaId: string): Promise<ProblemasSolucion[]> {
  const { data, error } = await supabase
    .from('problema_soluciones')
    .select('*')
    .eq('problema_id', problemaId)
    .order('created_at', { ascending: true })

  if (error) return []

  return (data || []).map(row => ({
    id:            row.id,
    problemaId:    row.problema_id,
    nombre:        row.nombre,
    solucion:      row.solucion,
    fechaHora:     row.fecha_hora,
    audioUrl:      row.audio_url || undefined,
    audioDuracion: row.audio_duracion || undefined,
    archivos:      row.archivos || undefined,
  }))
}

export async function subirArchivosProblema(id: string, archivos: File[]): Promise<string[]> {
  const urls: string[] = []
  for (const archivo of archivos) {
    if (!(archivo instanceof File) || archivo.size === 0) continue
    const nombreSeguro = `problemas/${id}/${Date.now()}_${archivo.name.replace(/[^a-zA-Z0-9._\-]/g, '_')}`
    const bytes = await archivo.arrayBuffer()
    const { error } = await supabase.storage.from(BUCKET).upload(nombreSeguro, Buffer.from(bytes), {
      contentType: archivo.type,
      upsert: false,
    })
    if (error) {
      console.error('[SYM LAB] Error subiendo archivo de problema:', error.message, { bucket: BUCKET, ruta: nombreSeguro })
    } else {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(nombreSeguro)
      urls.push(data.publicUrl)
    }
  }
  return urls
}
