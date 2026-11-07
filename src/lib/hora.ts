/** Semanas promedio de un mes (52 semanas / 12 meses), para pasar horas semanales a mensuales. */
export const SEMANAS_POR_MES = 52 / 12

export interface DatosHora {
  /** Sueldo base mensual sobre el que se calcula la hora extra. */
  sueldoBase: number
  horasSemanales: number
  /** Sueldo líquido mensual (viene del cálculo principal). */
  liquido: number
  /** Minutos de traslado al día, ida y vuelta. */
  trasladoMinutos: number
  diasSemana: number
  /** Recargo de la hora extra, en % (50 por ley). */
  recargo: number
}

export interface ResultadoHora {
  /** Factor que multiplicado por el sueldo base da el valor de la hora extra. */
  factorHoraExtra: number
  valorHoraOrdinaria: number
  valorHoraExtra: number
  horasTrabajoMes: number
  horasTrasladoMes: number
  /** Líquido dividido por las horas de trabajo. */
  liquidoPorHora: number
  /** Líquido dividido por las horas de trabajo más las de traslado. */
  valorHoraReal: number
}

const positivo = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0)

/**
 * Valor hora según la fórmula de la Dirección del Trabajo para sueldo mensual:
 * sueldo / 30 días × 28 días / (4 semanas × horas semanales).
 */
export function calcularValorHora(d: DatosHora): ResultadoHora {
  const base = positivo(d.sueldoBase)
  const horas = positivo(d.horasSemanales)
  const liquido = positivo(d.liquido)
  const dias = Math.min(7, positivo(d.diasSemana))

  const factorOrdinaria = horas > 0 ? 28 / (30 * 4 * horas) : 0
  const factorHoraExtra = factorOrdinaria * (1 + positivo(d.recargo) / 100)

  const horasTrabajoMes = horas * SEMANAS_POR_MES
  const horasTrasladoMes = (positivo(d.trasladoMinutos) / 60) * dias * SEMANAS_POR_MES

  return {
    factorHoraExtra,
    valorHoraOrdinaria: Math.round(base * factorOrdinaria),
    valorHoraExtra: Math.round(base * factorHoraExtra),
    horasTrabajoMes,
    horasTrasladoMes,
    liquidoPorHora: horasTrabajoMes > 0 ? Math.round(liquido / horasTrabajoMes) : 0,
    valorHoraReal:
      horasTrabajoMes > 0 ? Math.round(liquido / (horasTrabajoMes + horasTrasladoMes)) : 0,
  }
}
