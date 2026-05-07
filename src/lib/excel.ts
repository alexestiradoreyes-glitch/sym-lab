import { supabase } from './supabase'
import ExcelJS from 'exceljs'
import type { Idea } from './types'

export async function guardarIdea(idea: Idea): Promise<void> {
  const { error } = await supabase.from('ideas').insert({
    id: idea.id,
    fecha_envio: idea.fechaEnvio,
    nombre: idea.nombre,
    empresa: idea.empresa || null,
    email: idea.email,
    telefono: idea.telefono || null,
    titulo: idea.titulo,
    categoria: idea.categoria,
    descripcion: idea.descripcion,
    problema_resuelve: idea.problemaResuelve,
    beneficios_esperados: idea.beneficiosEsperados,
    nivel_madurez: idea.nivelMadurez,
    archivos: idea.archivos || null,
    enlaces_referencia: idea.enlacesReferencia || null,
    consentimiento: idea.consentimiento,
  })
  if (error) throw new Error(error.message)
}

export async function leerIdeas(): Promise<Idea[]> {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[SYM LAB] leerIdeas error:', error.message)
    return []
  }

  return (data || []).map(row => ({
    id: row.id,
    fechaEnvio: row.fecha_envio,
    nombre: row.nombre,
    empresa: row.empresa || undefined,
    email: row.email,
    telefono: row.telefono || undefined,
    titulo: row.titulo,
    categoria: row.categoria as Idea['categoria'],
    descripcion: row.descripcion,
    problemaResuelve: row.problema_resuelve,
    beneficiosEsperados: row.beneficios_esperados,
    nivelMadurez: row.nivel_madurez as Idea['nivelMadurez'],
    archivos: row.archivos || undefined,
    enlacesReferencia: row.enlaces_referencia || undefined,
    consentimiento: row.consentimiento,
  }))
}

export async function obtenerBufferExcel(): Promise<Buffer> {
  const ideas = await leerIdeas()
  const workbook = new ExcelJS.Workbook()
  const ws = workbook.addWorksheet('Ideas')

  ws.columns = [
    { header: 'ID',                    key: 'id',                   width: 38 },
    { header: 'Fecha y hora',          key: 'fechaEnvio',           width: 22 },
    { header: 'Nombre',                key: 'nombre',               width: 30 },
    { header: 'Empresa',               key: 'empresa',              width: 25 },
    { header: 'Email',                 key: 'email',                width: 32 },
    { header: 'Teléfono',              key: 'telefono',             width: 16 },
    { header: 'Título',                key: 'titulo',               width: 42 },
    { header: 'Categoría',             key: 'categoria',            width: 28 },
    { header: 'Descripción',           key: 'descripcion',          width: 55 },
    { header: 'Problema que resuelve', key: 'problemaResuelve',     width: 55 },
    { header: 'Beneficios esperados',  key: 'beneficiosEsperados',  width: 55 },
    { header: 'Nivel de madurez',      key: 'nivelMadurez',         width: 28 },
    { header: 'Archivos adjuntos',     key: 'archivos',             width: 50 },
    { header: 'Enlaces de referencia', key: 'enlacesReferencia',    width: 55 },
    { header: 'Consentimiento RGPD',   key: 'consentimiento',       width: 22 },
  ]

  ideas.forEach(idea => {
    ws.addRow({
      ...idea,
      archivos: idea.archivos?.join(', ') || '',
      consentimiento: idea.consentimiento ? 'Sí' : 'No',
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
