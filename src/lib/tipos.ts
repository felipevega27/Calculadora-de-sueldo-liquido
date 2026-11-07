export interface Afp {
  id: string
  nombre: string
  /** Comisión sobre la renta imponible, en %. */
  comision: number
}

export interface TramoImpuesto {
  /** Límite superior del tramo en UTM (null = sin límite). */
  hastaUTM: number | null
  factor: number
  rebajaUTM: number
}

export interface Parametros {
  vigenteDesde: string
  revisadoEn: string
  fuentes: { topes: string; comisionesAfp: string; impuesto: string; jornada: string }
  /** Jornada ordinaria máxima legal (Ley 21.561: 42 h desde abril de 2026, 40 h desde abril de 2028). */
  jornadaSemanalHoras: number
  /** Recargo legal de la hora extra, en %. */
  recargoHoraExtra: number
  topeImponibleUF: number
  topeCesantiaUF: number
  tasaAfp: number
  tasaSalud: number
  cesantiaTrabajadorIndefinido: number
  afp: Afp[]
  tramosImpuesto: TramoImpuesto[]
  respaldo: { fecha: string; uf: number; utm: number }
}

export interface Indicadores {
  uf: number
  utm: number
  /** Fecha (YYYY-MM-DD) a la que corresponde el valor. */
  fecha: string
  /** De dónde salieron los valores. */
  origen: 'en-vivo' | 'guardado' | 'respaldo'
}

export type TipoContrato = 'indefinido' | 'plazo-fijo'
export type TipoSalud = 'fonasa' | 'isapre'

export interface Entrada {
  /** Sueldo imponible mensual (base + gratificación + bonos imponibles). */
  imponible: number
  /** Haberes no imponibles (colación, movilización, etc.). */
  noImponible: number
  afpId: string
  contrato: TipoContrato
  salud: TipoSalud
  /** Valor del plan de Isapre en UF (solo si salud = isapre). */
  planIsapreUF: number
  /** Sueldo base para la hora extra (0 = usar el imponible). */
  sueldoBase: number
  /** Horas semanales del contrato. */
  horasSemanales: number
  /** Minutos de traslado al día, ida y vuelta. */
  trasladoMinutos: number
  /** Días que se trabaja a la semana. */
  diasSemana: number
}

export type Vista = 'sueldo' | 'hora'

export interface Resultado {
  imponible: number
  noImponible: number
  totalHaberes: number
  baseCotizacion: number
  baseCesantia: number
  afpCotizacion: number
  afpComision: number
  salud: number
  /** Parte de la salud que rebaja la base del impuesto (máx. 7 %). */
  saludDeducible: number
  cesantia: number
  baseTributable: number
  tramoIndice: number
  tasaMarginal: number
  impuesto: number
  totalDescuentos: number
  liquido: number
  /** Qué porcentaje del total de haberes se va en descuentos. */
  descuentoEfectivo: number
  toparonAfp: boolean
}
