import { describe, expect, it } from 'vitest'
import { calcularValorHora, SEMANAS_POR_MES } from './hora'

const base = { sueldoBase: 0, horasSemanales: 42, liquido: 0, trasladoMinutos: 0, diasSemana: 5, recargo: 50 }

describe('valor hora', () => {
  it('usa los factores de hora extra de la Dirección del Trabajo', () => {
    // Factores publicados: 45 h → 0,0077777; 44 h → 0,0079545; 42 h → 0,0083333; 40 h → 0,00875
    expect(calcularValorHora({ ...base, horasSemanales: 45 }).factorHoraExtra).toBeCloseTo(0.0077777, 6)
    expect(calcularValorHora({ ...base, horasSemanales: 44 }).factorHoraExtra).toBeCloseTo(0.0079545, 6)
    expect(calcularValorHora({ ...base, horasSemanales: 42 }).factorHoraExtra).toBeCloseTo(0.0083333, 6)
    expect(calcularValorHora({ ...base, horasSemanales: 40 }).factorHoraExtra).toBeCloseTo(0.00875, 6)
  })

  it('calcula la hora ordinaria y la extra sobre el sueldo base', () => {
    const r = calcularValorHora({ ...base, sueldoBase: 1_000_000 })
    expect(r.valorHoraOrdinaria).toBe(5_556) // 1.000.000 × 28 / 5.040
    expect(r.valorHoraExtra).toBe(8_333)
  })

  it('divide el líquido por las horas trabajadas y, con traslado, también por las de viaje', () => {
    const sin = calcularValorHora({ ...base, liquido: 1_000_000 })
    expect(sin.horasTrabajoMes).toBeCloseTo(42 * SEMANAS_POR_MES, 6)
    expect(sin.liquidoPorHora).toBe(Math.round(1_000_000 / (42 * SEMANAS_POR_MES)))
    expect(sin.valorHoraReal).toBe(sin.liquidoPorHora)

    const con = calcularValorHora({ ...base, liquido: 1_000_000, trasladoMinutos: 60 })
    expect(con.horasTrasladoMes).toBeCloseTo(5 * SEMANAS_POR_MES, 6)
    expect(con.valorHoraReal).toBe(Math.round(1_000_000 / (47 * SEMANAS_POR_MES)))
    expect(con.valorHoraReal).toBeLessThan(con.liquidoPorHora)
  })

  it('con cero horas no divide por cero', () => {
    const r = calcularValorHora({ ...base, sueldoBase: 1_000_000, liquido: 800_000, horasSemanales: 0 })
    expect(r.valorHoraExtra).toBe(0)
    expect(r.liquidoPorHora).toBe(0)
    expect(r.valorHoraReal).toBe(0)
  })
})
