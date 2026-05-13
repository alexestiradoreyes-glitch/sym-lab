// Tipos principales de SYM LAB

export const CONSENTIMIENTO_LEGAL_VERSION = 'v1.0'

export const CONSENTIMIENTO_TEXTOS = {
  confidencialidad: 'Acepto que las ideas enviadas serán tratadas como confidenciales y no podrán ser utilizadas de forma personal o no autorizada por ninguna persona vinculada a la empresa.',
  usoEmpresarial:   'Acepto que las ideas enviadas se destinarán exclusivamente a los fines de la empresa y no podrán ser utilizadas para uso personal o particular de ninguna persona física.',
  propiedad:        'Acepto que las ideas enviadas pasarán a ser propiedad exclusiva de la empresa, cediendo todos los derechos sobre las mismas, y renuncio a reclamar titularidad, compensación económica o derechos posteriores sobre dichas ideas.',
} as const

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
  consentimientoConfidencialidad?: boolean
  consentimientoUsoEmpresarial?: boolean
  consentimientoPropiedad?: boolean
  consentimientoTimestamp?: string
  consentimientoVersion?: string
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

// ─── Tipos para Problemas no resueltos ───────────────────────────────────────

export type FrecuenciaProblema = 'Puntual' | 'Frecuente' | 'Muy frecuente' | 'Constante'
export type ImpactoProblema    = 'Bajo' | 'Medio' | 'Alto' | 'Crítico'
export type AreaProblema       = 'Operaciones' | 'Clientes' | 'Producto' | 'Equipo' | 'Administración' | 'Tecnología' | 'Otra'
export type EstadoProblema     = 'Nuevo' | 'En revisión' | 'En análisis' | 'Solución propuesta' | 'En desarrollo' | 'Resuelto' | 'Rechazado'

export interface Problema {
  id: string
  fechaEnvio: string
  nombre: string
  email: string
  empresa?: string
  titulo: string
  descripcion: string
  contexto?: string
  frecuencia: FrecuenciaProblema
  impacto: ImpactoProblema
  area: AreaProblema
  archivos?: string[]
  enlacesReferencia?: string
  solucionPropuesta?: string
  beneficioEsperado?: string
  recursosNecesarios?: string
  estado?: EstadoProblema
  respuestaEquipo?: string
  solucionOficial?: string
  proximosPasos?: string
  responsable?: string
  fechaEstimada?: string
  audioUrl?: string
  audioDuracion?: number
}

export const FRECUENCIAS_PROBLEMA: FrecuenciaProblema[] = ['Puntual', 'Frecuente', 'Muy frecuente', 'Constante']
export const IMPACTOS_PROBLEMA:    ImpactoProblema[]    = ['Bajo', 'Medio', 'Alto', 'Crítico']
export const AREAS_PROBLEMA:       AreaProblema[]       = ['Operaciones', 'Clientes', 'Producto', 'Equipo', 'Administración', 'Tecnología', 'Otra']
export const ESTADOS_PROBLEMA:     EstadoProblema[]     = ['Nuevo', 'En revisión', 'En análisis', 'Solución propuesta', 'En desarrollo', 'Resuelto', 'Rechazado']

export const IMPACTO_COLORES: Record<ImpactoProblema, string> = {
  'Bajo':     'bg-slate-800 text-slate-400',
  'Medio':    'bg-yellow-900/50 text-yellow-300',
  'Alto':     'bg-orange-900/50 text-orange-300',
  'Crítico':  'bg-red-900/50 text-red-300',
}

export const ESTADO_PROBLEMA_COLORES: Record<EstadoProblema, string> = {
  'Nuevo':               'bg-slate-800 text-slate-300',
  'En revisión':         'bg-yellow-900/50 text-yellow-300',
  'En análisis':         'bg-blue-900/50 text-blue-300',
  'Solución propuesta':  'bg-purple-900/50 text-purple-300',
  'En desarrollo':       'bg-cyan-900/50 text-cyan-300',
  'Resuelto':            'bg-green-900/50 text-green-300',
  'Rechazado':           'bg-red-900/40 text-red-400',
}

export const FRECUENCIA_COLORES: Record<FrecuenciaProblema, string> = {
  'Puntual':       'bg-slate-800 text-slate-400',
  'Frecuente':     'bg-yellow-900/50 text-yellow-300',
  'Muy frecuente': 'bg-orange-900/50 text-orange-300',
  'Constante':     'bg-red-900/50 text-red-300',
}

export interface ProblemasSolucion {
  id: string
  problemaId: string
  nombre: string
  solucion: string
  fechaHora: string
}
