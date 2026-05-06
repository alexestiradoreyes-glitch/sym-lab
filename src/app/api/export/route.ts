// Ruta API: GET /api/export
// Descarga el archivo Excel con todas las ideas

import { NextRequest, NextResponse } from 'next/server'
import { cookies }                   from 'next/headers'
import { obtenerBufferExcel }        from '@/lib/excel'
import { format }                    from 'date-fns'
import { es }                        from 'date-fns/locale'

export const runtime = 'nodejs'

export async function GET(_request: NextRequest) {
  // Verificar autenticación
  const cookieStore = cookies()
  const token       = cookieStore.get('sym-admin-token')

  if (!process.env.ADMIN_SECRET_TOKEN || token?.value !== process.env.ADMIN_SECRET_TOKEN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const buffer   = await obtenerBufferExcel()
    const fecha    = format(new Date(), 'yyyy-MM-dd', { locale: es })
    const filename = `SYM-LAB-Ideas-${fecha}.xlsx`

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control':       'no-store',
      },
    })
  } catch (error) {
    console.error('[SYM LAB] Error exportando:', error)
    return NextResponse.json(
      { error: 'Error generando el archivo Excel. Puede que aún no haya ideas registradas.' },
      { status: 500 }
    )
  }
}
