import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 }             from 'uuid'
import { format }                    from 'date-fns'
import { es }                        from 'date-fns/locale'
import { guardarProblema, leerProblemas, subirArchivosProblema } from '@/lib/problemas'
import { supabase }                  from '@/lib/supabase'
import type { Problema }             from '@/lib/types'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const problemas = await leerProblemas()
    return NextResponse.json(problemas)
  } catch (err) {
    console.error('[SYM LAB] GET /api/problemas error:', err)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const fd = await request.formData()

    const nombre             = (fd.get('nombre')             as string)?.trim()
    const email              = (fd.get('email')              as string)?.trim()
    const empresa            = (fd.get('empresa')            as string)?.trim()
    const titulo             = (fd.get('titulo')             as string)?.trim()
    const descripcion        = (fd.get('descripcion')        as string)?.trim()
    const contexto           = (fd.get('contexto')           as string)?.trim()
    const frecuencia         = (fd.get('frecuencia')         as string)?.trim()
    const impacto            = (fd.get('impacto')            as string)?.trim()
    const area               = (fd.get('area')               as string)?.trim()
    const enlacesReferencia  = (fd.get('enlacesReferencia')  as string)?.trim()
    const solucionPropuesta  = (fd.get('solucionPropuesta')  as string)?.trim()
    const beneficioEsperado  = (fd.get('beneficioEsperado')  as string)?.trim()
    const recursosNecesarios = (fd.get('recursosNecesarios') as string)?.trim()
    const audioUrl           = (fd.get('audioUrl')           as string)?.trim() || undefined
    const audioDuracionStr   = fd.get('audioDuracion') as string | null
    const audioDuracion      = audioDuracionStr ? parseInt(audioDuracionStr, 10) : undefined

    const errores: string[] = []
    if (!nombre)      errores.push('nombre')
    if (!email)       errores.push('email')
    if (!titulo)      errores.push('titulo')
    if (!descripcion) errores.push('descripcion')
    if (!frecuencia)  errores.push('frecuencia')
    if (!impacto)     errores.push('impacto')
    if (!area)        errores.push('area')

    if (errores.length > 0) {
      return NextResponse.json(
        { error: `Faltan campos obligatorios: ${errores.join(', ')}` },
        { status: 400 }
      )
    }

    const id         = uuidv4()
    const fechaEnvio = format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: es })

    const archivosRecibidos = fd.getAll('archivos') as File[]
    const archivosGuardados = archivosRecibidos.length > 0 && archivosRecibidos[0].size > 0
      ? await subirArchivosProblema(id, archivosRecibidos)
      : []

    const problema: Problema = {
      id,
      fechaEnvio,
      nombre,
      email,
      empresa:             empresa            || undefined,
      titulo,
      descripcion,
      contexto:            contexto           || undefined,
      frecuencia:          frecuencia         as Problema['frecuencia'],
      impacto:             impacto            as Problema['impacto'],
      area:                area               as Problema['area'],
      archivos:            archivosGuardados.length > 0 ? archivosGuardados : undefined,
      enlacesReferencia:   enlacesReferencia  || undefined,
      solucionPropuesta:   solucionPropuesta  || undefined,
      beneficioEsperado:   beneficioEsperado  || undefined,
      recursosNecesarios:  recursosNecesarios || undefined,
      estado:              'Nuevo',
      audioUrl,
      audioDuracion,
    }

    await guardarProblema(problema)

    return NextResponse.json({ success: true, id, fechaEnvio, message: '¡Problema registrado correctamente!' })

  } catch (error) {
    console.error('[SYM LAB] POST /api/problemas error:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const { data: archivos } = await supabase.storage.from('adjuntos').list(`problemas/${id}`)
  if (archivos && archivos.length > 0) {
    await supabase.storage.from('adjuntos').remove(archivos.map(f => `problemas/${id}/${f.name}`))
  }

  const { error } = await supabase.from('problemas').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
