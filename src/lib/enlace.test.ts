import { describe, expect, it } from 'vitest'
import { crearEnlace, leerEnlace } from './enlace'
import type { Entrada } from './tipos'

const AFPS = ['uno', 'modelo', 'capital']

const pred: Entrada = {
  imponible: 0,
  noImponible: 0,
  afpId: 'uno',
  contrato: 'indefinido',
  salud: 'fonasa',
  planIsapreUF: 0,
  sueldoBase: 0,
  horasSemanales: 42,
  trasladoMinutos: 0,
  diasSemana: 5,
}

describe('enlace para compartir', () => {
  it('sin datos no ensucia la URL', () => {
    expect(crearEnlace(pred, 'sueldo', pred)).toBe('')
    expect(leerEnlace('', AFPS)).toBeNull()
  })

  it('ida y vuelta: lo que se escribe se lee igual', () => {
    const e: Entrada = {
      ...pred,
      imponible: 2_500_000,
      noImponible: 80_000,
      afpId: 'capital',
      salud: 'isapre',
      planIsapreUF: 4.5,
      contrato: 'plazo-fijo',
      sueldoBase: 2_000_000,
      horasSemanales: 40,
      trasladoMinutos: 90,
      diasSemana: 6,
    }
    const query = crearEnlace(e, 'hora', pred)
    const leido = leerEnlace(query, AFPS)
    expect(leido?.vista).toBe('hora')
    expect({ ...pred, ...leido?.entrada }).toEqual(e)
  })

  it('escribe solo lo que difiere de lo predeterminado', () => {
    expect(crearEnlace({ ...pred, imponible: 1_000_000 }, 'sueldo', pred)).toBe('?sueldo=1000000&afp=uno')
  })

  it('ignora valores inválidos', () => {
    const r = leerEnlace('?sueldo=abc&afp=inventada&salud=otra&horas=999&dias=9', AFPS)
    expect(r?.entrada.afpId).toBeUndefined()
    expect(r?.entrada.salud).toBeUndefined()
    expect(r?.entrada.horasSemanales).toBeUndefined()
    expect(r?.entrada.diasSemana).toBeUndefined()
  })
})
