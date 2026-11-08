export const INSUFFICIENT_DATA = 'Datos insuficientes'

export const DASHBOARD_SECTIONS = {
  overview: {
    title: 'Resumen',
    description: 'Lo principal de la temporada y la categoría elegidas.',
  },
  categories: {
    title: 'Por categoría',
    description:
      'Cómo va cada categoría en la temporada. Toca una categoría para filtrar el tablero.',
  },
  load: {
    title: 'Carga semanal',
    description:
      'Carga de entrenamiento por deportista y ACWR promedio a lo largo de la temporada.',
  },
  injuryRisk: {
    title: 'Deportistas que requieren atención',
    description: 'Deportistas con alertas de riesgo de lesión medio o alto sin revisar.',
  },
  seasons: {
    title: 'Comparación entre temporadas',
    description: 'Los mismos indicadores en cada temporada registrada.',
  },
} as const

export const DATA_ORIGIN_NOTE =
  'La base de datos no distingue los datos de demostración de los reales: el tablero muestra todos los registros.'

export const ACWR_ZONE_KEYS = ['subcarga', 'optima', 'precaucion', 'sobrecarga'] as const

export const ACWR_ZONE_TEXT: Record<(typeof ACWR_ZONE_KEYS)[number], string> = {
  subcarga: 'Subcarga',
  optima: 'Zona óptima',
  precaucion: 'Precaución',
  sobrecarga: 'Sobrecarga',
}

export const HUMAN_REVIEW_NOTE =
  'Son sugerencias para que el cuerpo técnico las revise; no son decisiones automáticas.'

export type DashboardTab =
  'general' | 'entrenamiento' | 'partidos' | 'salud' | 'desarrollo' | 'modelo'
