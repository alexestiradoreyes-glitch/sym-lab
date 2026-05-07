import { leerIdeas } from '@/lib/excel'
import AdminPanel from '@/components/AdminPanel'
import type { Idea } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Administración — SYM LAB',
}

export default async function PaginaAdmin() {
  let ideas: Idea[] = []
  try {
    ideas = await leerIdeas()
  } catch (error) {
    console.error('Error leyendo ideas:', error)
  }

  return <AdminPanel ideas={ideas} />
}
