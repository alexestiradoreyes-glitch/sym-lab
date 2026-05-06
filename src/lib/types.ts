// Tipos principales de SYM LAB

export type TipoNotificacion = 'idea' | 'comentario' | 'enlace' | 'estado'

export type EstadoIdea =
  | 'Pendiente'
  | 'En revisión'
  | 'Aprobada'
  | 'En desarrollo'
  | 'Completada'
  | 'Descartada'

export const ESTADOS_IDEA: EstadoIdea[] = [
  'Pendiente', 'En revisión', 'Aprobada', 'En desarrollo', 'Completada', 'Descartada',
]

export const ESTADO_COLORES: Record<EstadoIdea, string> = {
  'Pendiente':      'bg-slate-800 text-slate-300',
  'En revisión':    'bg-yellow-900/50 text-yellow-300',
  'Aprobada':       'bg-green-900/50 text-green-300',
  'En desarrollo':  'bg-blue-900/50 text-blue-300',
  'Completada':     'bg-purple-900/50 text-purple-300',
  'Descartada':     'bg-red-900/40 text-red-400',
}

export interface Notificacion {
  id: string
  tipo: TipoNotificacion
  titulo: string
  mensaje: string
  persona: string
  url: string
  leida: boolean
  fecha: string
}

export type CategoriaIdea =
  | 'Innovación'
  | 'Investigación'
  | 'Desarrollo'
  | 'Mejora de proceso'
  | 'Sostenibilidad'
  | 'Inteligencia artificial'
  | 'Otro'

export type NivelMadurez =
  | 'Idea inicial'
  | 'Prototipo'
  | 'Validada parcialmente'
  | 'Lista para desarrollar'

export type RolComentario = 'Autor' | 'Revisor' | 'Administrador' | 'Colaborador'

export type CategoriaEnlace =
  | 'Proyecto'
  | 'Tecnología'
  | 'Investigación'
  | 'Convocatoria'
  | 'Empresa'
  | 'Artículo'
  | 'Otro'

export interface Idea {
  id: string
  fechaEnvio: string
  nombre: string
  empresa?: string
  email: string
  telefono?: string
  titulo: string
  categoria: CategoriaIdea
  descripcion: string
  problemaResuelve: string
  beneficiosEsperados: string
  nivelMadurez: NivelMadurez
  archivos?: string[]
  enlacesReferencia?: string
  consentimiento: boolean
}

export interface Comentario {
  id: string
  ideaId: string
  nombre: string
  texto: string
  rol: RolComentario
  fechaHora: string
}

export interface Enlace {
  id: string
  titulo: string
  url: string
  descripcion: string
  categoria: CategoriaEnlace
  persona: string
  fecha: string
}

export const CATEGORIAS_ENLACE: CategoriaEnlace[] = [
  'Proyecto',
  'Tecnología',
  'Investigación',
  'Convocatoria',
  'Empresa',
  'Artículo',
  'Otro',
]

export const ROLES_COMENTARIO: RolComentario[] = [
  'Autor',
  'Revisor',
  'Administrador',
  'Colaborador',
]

export const CATEGORIAS: CategoriaIdea[] = [
  'Innovación',
  'Investigación',
  'Desarrollo',
  'Mejora de proceso',
  'Sostenibilidad',
  'Inteligencia artificial',
  'Otro',
]

export const NIVELES_MADUREZ: NivelMadurez[] = [
  'Idea inicial',
  'Prototipo',
  'Validada parcialmente',
  'Lista para desarrollar',
]

// Colores de badge por categoría
export const CATEGORIA_COLORES: Record<CategoriaIdea, string> = {
  'Innovación':              'bg-purple-900/50 text-purple-300 border border-purple-700/50',
  'Investigación':           'bg-blue-900/50 text-blue-300 border border-blue-700/50',
  'Desarrollo':              'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50',
  'Mejora de proceso':       'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50',
  'Sostenibilidad':          'bg-green-900/50 text-green-300 border border-green-700/50',
  'Inteligencia artificial': 'bg-red-900/50 text-red-300 border border-red-700/50',
  'Otro':                    'bg-slate-800/50 text-slate-300 border border-slate-600/50',
}

export const MADUREZ_COLORES: Record<NivelMadurez, string> = {
  'Idea inicial':          'bg-slate-800 text-slate-400',
  'Prototipo':             'bg-yellow-900/60 text-yellow-400',
  'Validada parcialmente': 'bg-blue-900/60 text-blue-400',
  'Lista para desarrollar':'bg-green-900/60 text-green-400',
}
