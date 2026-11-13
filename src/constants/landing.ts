import {
  Activity,
  BadgeDollarSign,
  BrainCircuit,
  CalendarRange,
  ChartLine,
  ChartNoAxesCombined,
  ClipboardList,
  Cpu,
  EyeOff,
  FileCheck,
  FolderX,
  HeartPulse,
  LayoutDashboard,
  Lock,
  Shield,
  TrendingUp,
  Unlink,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface LandingNavLink {
  id: string
  label: string
}

export const LANDING_SECTION_IDS = {
  hero: 'inicio',
  problem: 'problema',
  foundation: 'fundamento',
  howItWorks: 'como-funciona',
  modules: 'modulos',
  intelligence: 'inteligencia',
  roles: 'roles',
  privacy: 'privacidad',
  partner: 'socio',
  sources: 'fuentes',
  team: 'equipo',
} as const

export const LANDING_NAV_LINKS: LandingNavLink[] = [
  { id: LANDING_SECTION_IDS.foundation, label: 'Fundamento' },
  { id: LANDING_SECTION_IDS.howItWorks, label: 'Cómo funciona' },
  { id: LANDING_SECTION_IDS.modules, label: 'Módulos' },
  { id: LANDING_SECTION_IDS.intelligence, label: 'Inteligencia' },
  { id: LANDING_SECTION_IDS.privacy, label: 'Privacidad' },
  { id: LANDING_SECTION_IDS.sources, label: 'Fuentes' },
  { id: LANDING_SECTION_IDS.team, label: 'Equipo' },
]

export const AUTH_ACTION_LABELS = {
  login: 'Iniciar sesión',
  register: 'Crear cuenta',
  dashboard: 'Ir a mi panel',
  howItWorks: 'Ver cómo funciona',
} as const

export const HERO_CONTENT = {
  eyebrow: 'Fútbol y fútbol sala',
  title: 'El historial completo de cada deportista, de la escuela al primer equipo',
  subtitle:
    'Lancelot reúne evaluaciones, carga de entrenamiento, salud y progreso en un solo lugar, para escuelas de formación y clubes profesionales-amateur de fútbol y fútbol sala. Su base es la investigación de Eduard Giovanni Morales Vera sobre la selección de talentos en el fútbol infantil.',
  illustrativeLabel: 'Ilustrativo',
}

export interface ProblemCard {
  icon: LucideIcon
  title: string
  description: string
  source?: string
}

export const PROBLEM_CARDS: ProblemCard[] = [
  {
    icon: FolderX,
    title: 'Registros dispersos',
    description:
      'Los datos físicos, técnicos, tácticos y médicos viven en papel o en plantillas sueltas, sin trazabilidad entre categorías ni temporadas.',
  },
  {
    icon: Unlink,
    title: 'El historial se pierde al ascender',
    description:
      'Cuando un jugador cambia de categoría su historia no lo acompaña, y las convocatorias y los ascensos se deciden de forma subjetiva, cuando la evidencia pide pasar del criterio del entrenador a modelos apoyados en datos.',
    source: 'Fuente: Morales Vera (2026).',
  },
  {
    icon: BadgeDollarSign,
    title: 'Plataformas fuera de alcance',
    description:
      'Wyscout cuesta entre 250 y 400 USD al año por usuario y Catapult One entre 180 y 215 USD al año por atleta: demasiado para este segmento.',
    source: 'Fuentes: Wyscout (2026); Catapult Sports (2026).',
  },
]

export interface JourneyStep {
  icon: LucideIcon
  stage: string
  title: string
  description: string
  source: string
}

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    icon: ClipboardList,
    stage: 'Paso 1',
    title: 'Pre-temporada',
    description:
      'Evaluación física (talla, peso, VO₂ máx. y velocidad en 20 m), evaluación técnica y táctica, historial médico y objetivos de desarrollo.',
    source: 'Fuente: Erazo et al. (2022).',
  },
  {
    icon: CalendarRange,
    stage: 'Paso 2',
    title: 'Durante la temporada',
    description:
      'Estadísticas por partido, carga de entrenamiento con RPE reportado desde el celular, lesiones con su mecanismo y alertas de fatiga diferenciadas por categoría.',
    source: 'Fuentes: Foster et al. (2001); Gabbett (2016).',
  },
  {
    icon: ChartLine,
    stage: 'Paso 3',
    title: 'Post-temporada',
    description:
      'Comparativa entre temporadas, informes de evolución adaptados a la edad, detección de potencial de ascenso y planificación del siguiente ciclo.',
    source: 'Fuentes: Morales Vera (2026); Johnston et al. (2018).',
  },
  {
    icon: Cpu,
    stage: 'Paso 4',
    title: 'Motor de análisis',
    description:
      'Tableros longitudinales, índice de progreso ponderado por posición y categoría, y apoyo a la decisión sobre riesgo y talento.',
    source: 'Fuentes: Vaeyens et al. (2008); Yáñez-Sepúlveda et al. (2024).',
  },
]

export interface LandingModule {
  icon: LucideIcon
  title: string
  description: string
}

export const LANDING_MODULES: LandingModule[] = [
  {
    icon: LayoutDashboard,
    title: 'Inicio por rol',
    description: 'Cada persona ve primero lo que necesita hacer hoy, sin menús de más.',
  },
  {
    icon: Shield,
    title: 'Club',
    description:
      'Temporadas, categorías, competencias, partidos y plantilla, con cambios de categoría que conservan el historial.',
  },
  {
    icon: Users,
    title: 'Deportistas',
    description:
      'Ficha 360° con evaluaciones físicas, técnicas y tácticas, carga, salud, objetivos y evolución entre temporadas.',
  },
  {
    icon: Activity,
    title: 'Entrenamiento',
    description:
      'Registro rápido de RPE desde el celular, estadísticas de partido y carga del equipo en un vistazo.',
  },
  {
    icon: HeartPulse,
    title: 'Salud',
    description:
      'Bandeja de alertas para revisar, lesiones con su mecanismo, registros de salud y consentimientos de acudientes.',
  },
  {
    icon: TrendingUp,
    title: 'Talento y progreso',
    description:
      'Índice de progreso por categoría y señalizaciones de talento con sus criterios y advertencias.',
  },
  {
    icon: BrainCircuit,
    title: 'Análisis IA',
    description:
      'Estado del motor, preparación de los datos, calidad de los registros y métricas de validación del sistema.',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Tablero',
    description:
      'Indicadores de todo lo que registra el club, por temporada y categoría, con gráficas interactivas y vista de tabla.',
  },
]

export const INTELLIGENCE_CONTENT = {
  eyebrow: 'Inteligencia que apoya, no reemplaza',
  title: 'Datos para decidir mejor, con una persona siempre al mando',
  principle: 'El sistema sugiere, el cuerpo técnico decide.',
  principleDetail:
    'Cada alerta, evaluación de riesgo o señalización de talento llega como pendiente. Una persona la revisa y la marca como revisada o descartada. Ningún proceso asciende jugadores ni cambia el estado de una lesión por su cuenta.',
}

export interface IntelligencePillar {
  title: string
  phases: { label: string; description: string; source: string }[]
}

export const INTELLIGENCE_PILLARS: IntelligencePillar[] = [
  {
    title: 'Riesgo de lesión en dos fases',
    phases: [
      {
        label: 'Fase 1 · Reglas sobre la carga',
        description:
          'Carga de sesión (RPE × minutos) y relación aguda:crónica (ACWR), con umbrales configurables por categoría etaria y tres reglas: ACWR alto sostenido, RPE alto repetido y recaída.',
        source: 'Fuentes: Foster et al. (2001); Gabbett (2016); Bourdon et al. (2017).',
      },
      {
        label: 'Fase 2 · Aprendizaje automático',
        description:
          'Estima la probabilidad de una lesión sin contacto en los 7 días siguientes y explica cada predicción con sus tres factores más influyentes. Se recomienda activarlo con 270 días etiquetados, 20 lesiones sin contacto y 15 deportistas, después de probarlo en modo sombra frente a las reglas.',
        source: 'Fuentes: Rossi et al. (2018); Van Eetvelde et al. (2021); Lundberg y Lee (2017).',
      },
    ],
  },
  {
    title: 'Detección de talento multidimensional',
    phases: [
      {
        label: 'Fase 1 · Reglas multidimensionales',
        description:
          'Exige un percentil alto en su categoría y que ninguna dimensión (física, técnica, táctica o de participación) quede por debajo del mínimo, compara temporadas y avisa de la edad relativa y de la cercanía a la edad máxima.',
        source: 'Fuentes: Morales Vera (2026); Vaeyens et al. (2008); Musch y Grondin (2001).',
      },
      {
        label: 'Fase 2 · Aprendizaje automático',
        description:
          'Aprende de los ascensos reales del club. Se recomienda activarlo con 2 temporadas, 10 ascensos y 15 deportistas, después de probarlo en modo sombra frente a las reglas.',
        source: 'Fuentes: Morales Vera (2026); Johnston et al. (2018).',
      },
    ],
  },
]

export const FOUNDATION_CONTENT = {
  eyebrow: 'Fundamento del proyecto',
  title: 'La base de Lancelot: la investigación de Eduard Giovanni Morales Vera',
  description:
    'La fuente principal del proyecto es su revisión sistemática sobre cómo se seleccionan los talentos en el fútbol infantil. De ella salen los criterios con los que Lancelot evalúa el progreso y el talento.',
  author: 'Eduard Giovanni Morales Vera',
  authorDetail:
    'Magíster en Ciencias del Deporte y la Actividad Física (Universidad Pedagógica Nacional) y presidente de VERA FC.',
  badge: 'Fuente principal',
  citation:
    'Morales Vera, E. G. (2026). Análisis de tendencias, tecnologías e instrumentos en los procesos de selección de talentos en fútbol infantil, una revisión sistemática [Tesis de maestría, Universidad Pedagógica Nacional].',
  url: 'http://hdl.handle.net/20.500.12209/22875',
  urlLabel: 'Ver en el Repositorio Institucional UPN',
  summary:
    'Aplicó las guías PRISMA y PRISMA-S con búsquedas en Scopus, Web of Science y PubMed. Encontró un paso del criterio del entrenador a modelos apoyados en evidencia, la suma de variables fisiológicas, técnico-tácticas, psicológicas y sociológicas a las físicas, y un papel creciente del GPS, los sensores inerciales, el videoanálisis automatizado y la inteligencia artificial.',
  decisionsTitle: 'Cuatro decisiones de diseño que salen de su trabajo',
  futureWork:
    'El agrupamiento por maduración biológica (bio-banding) y la edad de desarrollo estimada, que también propone, quedan como trabajo futuro.',
}

export const FOUNDATION_DECISIONS: string[] = [
  'El índice de progreso combina las dimensiones física, técnica, táctica y de participación, en lugar de quedarse en las medidas físicas.',
  'El talento se evalúa comparando temporadas, no con una sola medición.',
  'El sistema advierte sobre el efecto de la edad relativa y la cercanía a la edad máxima de la categoría.',
  'La decisión final la toma el cuerpo técnico, con la evidencia a la vista.',
]

export interface SourceItem {
  citation: string
  contribution: string
  principal?: boolean
}

export interface SourceGroup {
  title: string
  items: SourceItem[]
}

export const SOURCES_CONTENT = {
  eyebrow: 'Fuentes',
  title: 'En qué se apoya cada decisión de Lancelot',
  description:
    'Estas son las fuentes principales del trabajo de grado. Cada sección de esta página indica cuáles respaldan lo que describe.',
}

export const SOURCE_GROUPS: SourceGroup[] = [
  {
    title: 'Base del proyecto y detección de talento',
    items: [
      {
        citation: 'Morales Vera (2026)',
        contribution:
          'Revisión sistemática sobre la selección de talentos en el fútbol infantil: índice multidimensional, comparación entre temporadas, edad relativa y decisión del cuerpo técnico.',
        principal: true,
      },
      {
        citation: 'Vaeyens et al. (2008)',
        contribution:
          'El talento se identifica mirando a la vez varias dimensiones del deportista.',
      },
      {
        citation: 'Johnston et al. (2018)',
        contribution:
          'Los modelos de talento deben ser multidimensionales y seguir al deportista en el tiempo.',
      },
      {
        citation: 'Musch y Grondin (2001); Leonardi et al. (2022)',
        contribution: 'Efecto de la edad relativa, también en el fútbol sala formativo.',
      },
    ],
  },
  {
    title: 'Carga de entrenamiento',
    items: [
      {
        citation: 'Foster et al. (2001)',
        contribution:
          'Método session-RPE: el esfuerzo percibido por los minutos da la carga interna.',
      },
      {
        citation: 'Foster (1998)',
        contribution: 'Monotonía y tensión de la carga semanal.',
      },
      {
        citation: 'Gabbett (2016)',
        contribution: 'Relación carga aguda:crónica (ACWR) y riesgo de lesión.',
      },
      {
        citation: 'Bourdon et al. (2017); Impellizzeri et al. (2019)',
        contribution: 'Monitoreo sistemático de la carga y valor de la carga interna.',
      },
    ],
  },
  {
    title: 'Lesiones y aprendizaje automático',
    items: [
      {
        citation: 'Rossi et al. (2018)',
        contribution: 'Hace falta al menos una temporada de registros para predecir lesiones.',
      },
      {
        citation: 'Van Eetvelde et al. (2021)',
        contribution:
          'El rendimiento de los modelos depende de la cantidad y la calidad de los datos.',
      },
      {
        citation: 'Lundberg y Lee (2017)',
        contribution: 'Valores SHAP para explicar cada predicción.',
      },
    ],
  },
  {
    title: 'Antecedentes de la región',
    items: [
      {
        citation: 'Montealegre-Mesa et al. (2023)',
        contribution: 'Registro remoto de la carga con autorreporte en futbolistas colombianos.',
      },
      {
        citation: 'Erazo et al. (2022)',
        contribution: 'Perfil físico y VO₂ máx. de futbolistas sub-20 de Bogotá.',
      },
      {
        citation: 'Yáñez-Sepúlveda et al. (2024); Morera-Barrantes et al. (2021)',
        contribution: 'La exigencia física cambia según la posición y el nivel competitivo.',
      },
      {
        citation: 'Vasquez-Bonilla et al. (2023)',
        contribution: 'Las medidas subjetivas como el RPE conservan su valor junto al GPS.',
      },
    ],
  },
  {
    title: 'Datos y normativa',
    items: [
      {
        citation: 'Ley Estatutaria 1581 de 2012 y Decreto 1377 de 2013',
        contribution: 'Protección de datos personales, datos sensibles y datos de menores.',
      },
      {
        citation: 'DAMA International (2017)',
        contribution:
          'Gobierno y calidad de los datos: exactitud, completitud, consistencia y oportunidad.',
      },
      {
        citation: 'ISO/IEC 25010:2023',
        contribution:
          'Modelo de calidad del producto con el que se definieron los requerimientos no funcionales.',
      },
    ],
  },
]

export const ROLES_CONTENT = {
  eyebrow: 'Roles',
  title: 'Cada persona del club, con lo que necesita',
  description: 'La interfaz muestra solo los módulos y las acciones que corresponden a cada rol.',
}

export interface PrivacyPrinciple {
  icon: LucideIcon
  title: string
  description: string
  source: string
}

export const PRIVACY_CONTENT = {
  eyebrow: 'Privacidad y datos de menores',
  title: 'Tratamiento conforme a la Ley 1581 de 2012',
  description:
    'Gran parte de los deportistas son menores de edad. Por eso la protección de sus datos está en el diseño, no al final.',
}

export const PRIVACY_PRINCIPLES: PrivacyPrinciple[] = [
  {
    icon: FileCheck,
    title: 'Consentimiento de los acudientes',
    description:
      'El club registra el consentimiento de los acudientes de cada menor, no se guardan datos de salud de un menor sin él y la plataforma destaca a quienes aún no lo tienen.',
    source: 'Fuentes: Ley 1581 de 2012; Decreto 1377 de 2013; Ley 1098 de 2006.',
  },
  {
    icon: Lock,
    title: 'Acceso a la salud restringido por rol',
    description:
      'Solo el administrador y el encargado de salud ven los registros de salud, y cada acceso queda auditado con fecha, hora y usuario.',
    source: 'Fuentes: Ley 1581 de 2012; Ley 1273 de 2009; Ley 527 de 1999.',
  },
  {
    icon: EyeOff,
    title: 'Datos seudonimizados para el análisis',
    description:
      'El motor de análisis trabaja con variables sin nombres, correos ni diagnósticos, y las exportaciones reemplazan la identidad por un código.',
    source: 'Fuentes: Ley 1581 de 2012; DAMA International (2017).',
  },
]

export const PARTNER_CONTENT = {
  eyebrow: 'Socio estratégico',
  name: 'VERA FC',
  description:
    'VERA FC es el club socio que validó Lancelot en condiciones operativas reales en sus categorías SUB-18, SUB-20, Mayores y Marcas, y aportó el dominio verafutbolclub.com.',
  source:
    'Su presidente, Eduard Giovanni Morales Vera, es además la fuente principal del proyecto: su investigación sobre la selección de talentos en el fútbol infantil es la base de Lancelot.',
}

export interface TeamMember {
  name: string
  role: string
  initials: string
  photoFile: string
}

export const TEAM_CONTENT = {
  eyebrow: 'Equipo',
  title: 'Quienes desarrollan Lancelot',
  description: 'Trabajo de grado de Ingeniería de Software de la Universidad de Cundinamarca.',
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Daniel Jose Morales Teatino',
    role: 'Dev Backend - AI ML',
    initials: 'DM',
    photoFile: 'daniel.jpg',
  },
  {
    name: 'Lukas David Davila Alzate',
    role: 'Dev Frontend',
    initials: 'LD',
    photoFile: 'lukas.jpg',
  },
]

export const FOOTER_CONTENT = {
  university: 'Universidad de Cundinamarca',
  faculty: 'Facultad de Ingeniería',
  program: 'Programa de Ingeniería de Software',
  advisor: 'Docente asesora: Angélica Gaitán Núñez',
  year: 2026,
}
