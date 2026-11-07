import type { Entrada, TipoContrato, TipoSalud, Vista } from './tipos'

/**
 * Guarda los datos del formulario en la URL (?sueldo=2500000&afp=uno…) para
 * poder compartir un cálculo: quien abre el link ve los mismos valores.
 * Solo se escriben los valores que difieren de los predeterminados.
 */

const entero = (v: string | null) => {
  if (v === null) return undefined
  const n = Number(v.replace(/\D/g, ''))
  return Number.isFinite(n) ? n : undefined
}

const decimal = (v: string | null) => {
  if (v === null) return undefined
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

export interface DatosEnlace {
  entrada: Partial<Entrada>
  vista?: Vista
}

/** Lee los datos de un query string. Devuelve null si no trae ninguno reconocible. */
export function leerEnlace(search: string, afpValidas: string[]): DatosEnlace | null {
  const q = new URLSearchParams(search)
  const e: Partial<Entrada> = {}

  const sueldo = entero(q.get('sueldo'))
  if (sueldo !== undefined) e.imponible = sueldo
  const noimp = entero(q.get('noimp'))
  if (noimp !== undefined) e.noImponible = noimp

  const afp = q.get('afp')
  if (afp && afpValidas.includes(afp)) e.afpId = afp

  const salud = q.get('salud')
  if (salud === 'fonasa' || salud === 'isapre') e.salud = salud as TipoSalud
  const plan = decimal(q.get('plan'))
  if (plan !== undefined) e.planIsapreUF = plan

  const contrato = q.get('contrato')
  if (contrato === 'indefinido' || contrato === 'plazo-fijo') e.contrato = contrato as TipoContrato

  const base = entero(q.get('base'))
  if (base !== undefined) e.sueldoBase = base
  const horas = entero(q.get('horas'))
  if (horas !== undefined && horas > 0 && horas <= 168) e.horasSemanales = horas
  const traslado = entero(q.get('traslado'))
  if (traslado !== undefined) e.trasladoMinutos = Math.min(traslado, 24 * 60)
  const dias = entero(q.get('dias'))
  if (dias !== undefined && dias >= 1 && dias <= 7) e.diasSemana = dias

  const v = q.get('vista')
  const vista: Vista | undefined = v === 'hora' ? 'hora' : v === 'sueldo' ? 'sueldo' : undefined

  if (Object.keys(e).length === 0 && !vista) return null
  return { entrada: e, vista }
}

/** Arma el query string (con "?" inicial, o "" si no hay nada que guardar). */
export function crearEnlace(e: Entrada, vista: Vista, predeterminada: Entrada): string {
  const q = new URLSearchParams()
  const hayDatos = e.imponible > 0 || e.sueldoBase > 0

  if (hayDatos) {
    if (e.imponible > 0) q.set('sueldo', String(e.imponible))
    if (e.noImponible > 0) q.set('noimp', String(e.noImponible))
    q.set('afp', e.afpId)
    if (e.salud !== predeterminada.salud) q.set('salud', e.salud)
    if (e.salud === 'isapre' && e.planIsapreUF > 0) q.set('plan', String(e.planIsapreUF))
    if (e.contrato !== predeterminada.contrato) q.set('contrato', e.contrato)
    if (e.sueldoBase > 0) q.set('base', String(e.sueldoBase))
    if (e.horasSemanales !== predeterminada.horasSemanales) q.set('horas', String(e.horasSemanales))
    if (e.trasladoMinutos > 0) q.set('traslado', String(e.trasladoMinutos))
    if (e.diasSemana !== predeterminada.diasSemana) q.set('dias', String(e.diasSemana))
  }
  if (vista === 'hora') q.set('vista', 'hora')

  const texto = q.toString()
  return texto ? `?${texto}` : ''
}
