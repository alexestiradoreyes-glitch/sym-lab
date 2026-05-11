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
  | 'Nuevo proceso'
  | 'Nuevo producto'
  | 'Mejora de producto'
  | 'Mejora de proceso'
  | 'No estoy seguro'

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
  descripcion?: string
  problemaResuelve?: string
  beneficiosEsperados?: string
  nivelMadurez: NivelMadurez
  archivos?: string[]
  enlacesReferencia?: string
  consentimiento: boolean
  audioUrl?: string
  audioDuracion?: number
}

export interface Comentario {
  id: string
  ideaId: string
  nombre: string
  texto: string
  rol: RolComentario
  fechaHora: string
  audioUrl?: string
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
  'Nuevo proceso',
  'Nuevo producto',
  'Mejora de producto',
  'Mejora de proceso',
  'No estoy seguro',
]

export const NIVELES_MADUREZ: NivelMadurez[] = [
  'Idea inicial',
  'Prototipo',
  'Validada parcialmente',
  'Lista para desarrollar',
]

// Colores de badge por categoría
export const CATEGORIA_COLORES: Record<CategoriaIdea, string> = {
  'Nuevo proceso':    'bg-blue-900/50 text-blue-300 border border-blue-700/50',
  'Nuevo producto':   'bg-purple-900/50 text-purple-300 border border-purple-700/50',
  'Mejora de producto': 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50',
  'Mejora de proceso':  'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50',
  'No estoy seguro':  'bg-slate-800/50 text-slate-300 border border-slate-600/50',
}

export const MADUREZ_COLORES: Record<NivelMadurez, string> = {
  'Idea inicial':          'bg-slate-800 text-slate-400',
  'Prototipo':             'bg-yellow-900/60 text-yellow-400',
  'Validada parcialmente': 'bg-blue-900/60 text-blue-400',
  'Lista para desarrollar':'bg-green-900/60 text-green-400',
}
