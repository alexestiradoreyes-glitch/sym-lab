// Gestión del archivo Excel (.xlsx) con ExcelJS
// El archivo se guarda en: data/ideas.xlsx (configurable con EXCEL_PATH)

import ExcelJS from 'exceljs'
import path from 'path'
import fs from 'fs'
import { Idea } from './types'

// Ruta del Excel — se puede cambiar con la variable de entorno EXCEL_PATH
export const EXCEL_PATH =
  process.env.EXCEL_PATH || path.join(process.cwd(), 'data', 'ideas.xlsx')

const CABECERAS: Partial<ExcelJS.Column>[] = [
  { header: 'ID',                   key: 'id',                   width: 38 },
  { header: 'Fecha y hora',         key: 'fechaEnvio',           width: 22 },
  { header: 'Nombre y apellidos',   key: 'nombre',               width: 30 },
  { header: 'Empresa',              key: 'empresa',              width: 25 },
  { header: 'Email',                key: 'email',                width: 32 },
  { header: 'Teléfono',             key: 'telefono',             width: 16 },
  { header: 'Título de la idea',    key: 'titulo',               width: 42 },
  { header: 'Categoría',            key: 'categoria',            width: 28 },
  { header: 'Descripción',          key: 'descripcion',          width: 55 },
  { header: 'Problema que resuelve',key: 'problemaResuelve',     width: 55 },
  { header: 'Beneficios esperados', key: 'beneficiosEsperados',  width: 55 },
  { header: 'Nivel de madurez',     key: 'nivelMadurez',         width: 28 },
  { header: 'Archivos adjuntos',    key: 'archivos',             width: 50 },
  { header: 'Enlaces de referencia',key: 'enlacesReferencia',   width: 55 },
  { header: 'Consentimiento RGPD',  key: 'consentimiento',       width: 22 },
]

async function obtenerLibroYHoja(): Promise<{
  workbook: ExcelJS.Workbook
  worksheet: ExcelJS.Worksheet
}> {
  // Crea la carpeta si no existe
  const dir = path.dirname(EXCEL_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'SYM LAB'
  workbook.lastModifiedBy = 'SYM LAB'
  workbook.created = new Date()
  workbook.modified = new Date()

  if (fs.existsSync(EXCEL_PATH)) {
    await workbook.xlsx.readFile(EXCEL_PATH)
  }

  let worksheet = workbook.getWorksheet('Ideas')

  if (!worksheet) {
    worksheet = workbook.addWorksheet('Ideas', {
      properties: { tabColor: { argb: 'FFDC2626' } },
    })

    worksheet.columns = CABECERAS

    // Estilo de la fila de cabecera
    const filaHeader = worksheet.getRow(1)
    filaHeader.height = 28
    filaHeader.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
      cell.border = {
        bottom: { style: 'medium', color: { argb: 'FF991B1B' } },
      }
    })
    filaHeader.commit()
  }

  return { workbook, worksheet }
}

export async function guardarIdea(idea: Idea): Promise<void> {
  const { workbook, worksheet } = await obtenerLibroYHoja()

  const fila = worksheet.addRow({
    id:                  idea.id,
    fechaEnvio:          idea.fechaEnvio,
    nombre:              idea.nombre,
    empresa:             idea.empresa || '',
    email:               idea.email,
    telefono:            idea.telefono || '',
    titulo:              idea.titulo,
    categoria:           idea.categoria,
    descripcion:         idea.descripcion,
    problemaResuelve:    idea.problemaResuelve,
    beneficiosEsperados: idea.beneficiosEsperados,
    nivelMadurez:        idea.nivelMadurez,
    archivos:            idea.archivos?.join(', ') || '',
    enlacesReferencia:   idea.enlacesReferencia || '',
    consentimiento:      idea.consentimiento ? 'Sí' : 'No',
  })

  // Estilo alternado de filas
  const esPar = worksheet.rowCount % 2 === 0
  fila.eachCell(cell => {
    cell.alignment = { vertical: 'top', wrapText: true }
    if (esPar) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F9F9' } }
    }
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    }
  })
  fila.height = 20
  fila.commit()

  await workbook.xlsx.writeFile(EXCEL_PATH)
}

export async function leerIdeas(): Promise<Idea[]> {
  if (!fs.existsSync(EXCEL_PATH)) return []

  const { worksheet } = await obtenerLibroYHoja()
  const ideas: Idea[] = []

  worksheet.eachRow((fila, numeroFila) => {
    if (numeroFila === 1) return // Saltar cabecera

    const v = fila.values as ExcelJS.CellValue[]
    // ExcelJS usa índices base-1, el primer elemento es undefined
    if (!v[1]) return

    ideas.push({
      id:                  String(v[1] ?? ''),
      fechaEnvio:          String(v[2] ?? ''),
      nombre:              String(v[3] ?? ''),
      empresa:             String(v[4] ?? '') || undefined,
      email:               String(v[5] ?? ''),
      telefono:            String(v[6] ?? '') || undefined,
      titulo:              String(v[7] ?? ''),
      categoria:           String(v[8] ?? '') as Idea['categoria'],
      descripcion:         String(v[9] ?? ''),
      problemaResuelve:    String(v[10] ?? ''),
      beneficiosEsperados: String(v[11] ?? ''),
      nivelMadurez:        String(v[12] ?? '') as Idea['nivelMadurez'],
      archivos:            String(v[13] ?? '').split(', ').filter(Boolean),
      enlacesReferencia:   String(v[14] ?? '') || undefined,
      consentimiento:      String(v[15] ?? '') === 'Sí',
    })
  })

  return ideas.reverse() // Más reciente primero
}

export async function obtenerBufferExcel(): Promise<Buffer> {
  const { workbook } = await obtenerLibroYHoja()
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
