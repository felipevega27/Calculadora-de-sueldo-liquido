import { describe, expect, it } from 'vitest'
import { calcularImpuesto, calcularSueldo } from './calculo'
import { PARAMETROS as P } from './parametros'
import type { Entrada } from './tipos'

const IND = { uf: 41263.57, utm: 72440 }

const base: Entrada = {
  imponible: 0,
  noImponible: 0,
  afpId: 'capital',
  contrato: 'indefinido',
  salud: 'fonasa',
  planIsapreUF: 0,
  sueldoBase: 0,
  horasSemanales: 42,
  trasladoMinutos: 0,
  diasSemana: 5,
}

describe('impuesto único de segunda categoría', () => {
  it('coincide con el ejemplo publicado (renta 3.000.000, UTM 71.506)', () => {
    const r = calcularImpuesto(3_000_000, 71_506, P.tramosImpuesto)
    expect(r.impuesto).toBe(115_580) // 115.579,56 redondeado
    expect(r.tasaMarginal).toBe(0.08)
  })

  it('no cobra impuesto hasta 13,5 UTM', () => {
    expect(calcularImpuesto(13.5 * IND.utm, IND.utm, P.tramosImpuesto).impuesto).toBe(0)
    expect(calcularImpuesto(500_000, IND.utm, P.tramosImpuesto).impuesto).toBe(0)
  })

  it('es continuo en el borde de cada tramo (sin saltos)', () => {
    for (const t of P.tramosImpuesto) {
      if (t.hastaUTM === null) continue
      const borde = t.hastaUTM * IND.utm
      const justoAntes = calcularImpuesto(borde, IND.utm, P.tramosImpuesto).impuesto
      const justoDespues = calcularImpuesto(borde + 1, IND.utm, P.tramosImpuesto).impuesto
      expect(Math.abs(justoDespues - justoAntes)).toBeLessThanOrEqual(1)
    }
  })

  it('crece siempre con la renta', () => {
    let anterior = 0
    for (let renta = 0; renta <= 20_000_000; renta += 50_000) {
      const i = calcularImpuesto(renta, IND.utm, P.tramosImpuesto).impuesto
      expect(i).toBeGreaterThanOrEqual(anterior)
      anterior = i
    }
  })
})

describe('sueldo líquido', () => {
  it('sueldo bajo: solo cotizaciones, sin impuesto', () => {
    const r = calcularSueldo({ ...base, imponible: 1_000_000, afpId: 'modelo' }, IND, P)
    expect(r.afpCotizacion).toBe(100_000)
    expect(r.afpComision).toBe(5_800)
    expect(r.salud).toBe(70_000)
    expect(r.cesantia).toBe(6_000)
    expect(r.impuesto).toBe(0)
    expect(r.liquido).toBe(818_200)
  })

  it('coincide con el ejemplo publicado de descuentos previsionales (2.500.000, Capital)', () => {
    const r = calcularSueldo({ ...base, imponible: 2_500_000 }, IND, P)
    expect(r.afpCotizacion + r.afpComision).toBe(286_000)
    expect(r.salud).toBe(175_000)
    expect(r.cesantia).toBe(15_000)
    expect(r.impuesto).toBe(41_842)
    expect(r.liquido).toBe(1_982_158)
  })

  it('respeta el tope imponible de 90 UF', () => {
    const r = calcularSueldo({ ...base, imponible: 6_000_000 }, IND, P)
    expect(r.toparonAfp).toBe(true)
    expect(r.baseCotizacion).toBeCloseTo(90 * IND.uf, 5)
    expect(r.afpCotizacion).toBe(Math.round(90 * IND.uf * 0.1))
  })

  it('plazo fijo no paga cesantía', () => {
    const r = calcularSueldo({ ...base, imponible: 1_000_000, contrato: 'plazo-fijo' }, IND, P)
    expect(r.cesantia).toBe(0)
  })

  it('Isapre cobra el plan, pero nunca menos del 7 %, y el impuesto solo rebaja el 7 %', () => {
    const caro = calcularSueldo(
      { ...base, imponible: 3_000_000, salud: 'isapre', planIsapreUF: 6 },
      IND,
      P,
    )
    expect(caro.salud).toBe(Math.round(6 * IND.uf))
    expect(caro.saludDeducible).toBe(210_000)

    const barato = calcularSueldo(
      { ...base, imponible: 3_000_000, salud: 'isapre', planIsapreUF: 1 },
      IND,
      P,
    )
    expect(barato.salud).toBe(210_000) // piso del 7 %
  })

  it('los no imponibles suman al líquido sin pagar cotizaciones', () => {
    const a = calcularSueldo({ ...base, imponible: 1_000_000 }, IND, P)
    const b = calcularSueldo({ ...base, imponible: 1_000_000, noImponible: 100_000 }, IND, P)
    expect(b.liquido - a.liquido).toBe(100_000)
  })

  it('con cero no revienta', () => {
    const r = calcularSueldo(base, IND, P)
    expect(r.liquido).toBe(0)
    expect(r.descuentoEfectivo).toBe(0)
  })
})
