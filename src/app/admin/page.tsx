import { leerIdeas }     from '@/lib/excel'
import { leerProblemas } from '@/lib/problemas'
import AdminPanel        from '@/components/AdminPanel'
import type { Idea }     from '@/lib/types'
import type { Problema } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Administración — SYM LAB',
}

export default async function PaginaAdmin() {
  let ideas:     Idea[]     = []
  let problemas: Problema[] = []

  try { ideas     = await leerIdeas()     } catch (e) { console.error('Error leyendo ideas:', e) }
  try { problemas = await leerProblemas() } catch (e) { console.error('Error leyendo problemas:', e) }

  return <AdminPanel ideas={ideas} problemas={problemas} />
}
