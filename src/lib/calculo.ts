import type { Entrada, Indicadores, Parametros, Resultado } from './tipos'

const redondear = (n: number) => Math.round(n)

/** Devuelve el impuesto único de 2ª categoría y el tramo aplicado. */
export function calcularImpuesto(
  baseTributable: number,
  utm: number,
  tramos: Parametros['tramosImpuesto'],
): { impuesto: number; tramoIndice: number; tasaMarginal: number } {
  if (baseTributable <= 0 || utm <= 0) {
    return { impuesto: 0, tramoIndice: 0, tasaMarginal: 0 }
  }
  const enUTM = baseTributable / utm
  const idx = tramos.findIndex((t) => t.hastaUTM === null || enUTM <= t.hastaUTM)
  const tramo = tramos[idx]
  const impuesto = Math.max(0, redondear(baseTributable * tramo.factor - tramo.rebajaUTM * utm))
  return { impuesto, tramoIndice: idx, tasaMarginal: tramo.factor }
}

export function calcularSueldo(
  entrada: Entrada,
  ind: Pick<Indicadores, 'uf' | 'utm'>,
  p: Parametros,
): Resultado {
  const imponible = Math.max(0, redondear(entrada.imponible))
  const noImponible = Math.max(0, redondear(entrada.noImponible))
  const afp = p.afp.find((a) => a.id === entrada.afpId) ?? p.afp[0]

  const topeAfp = p.topeImponibleUF * ind.uf
  const topeCes = p.topeCesantiaUF * ind.uf
  const baseCotizacion = Math.min(imponible, topeAfp)
  const baseCesantia = Math.min(imponible, topeCes)

  const afpCotizacion = redondear((baseCotizacion * p.tasaAfp) / 100)
  const afpComision = redondear((baseCotizacion * afp.comision) / 100)

  const saludLegal = redondear((baseCotizacion * p.tasaSalud) / 100)
  // En Isapre se paga el valor del plan, pero nunca menos del 7 % legal.
  const salud =
    entrada.salud === 'isapre'
      ? Math.max(saludLegal, redondear(Math.max(0, entrada.planIsapreUF) * ind.uf))
      : saludLegal

  const cesantia =
    entrada.contrato === 'indefinido'
      ? redondear((baseCesantia * p.cesantiaTrabajadorIndefinido) / 100)
      : 0

  // Renta líquida imponible: el SII solo descuenta el 7 % legal de salud.
  const baseTributable = Math.max(0, imponible - afpCotizacion - afpComision - saludLegal - cesantia)
  const { impuesto, tramoIndice, tasaMarginal } = calcularImpuesto(
    baseTributable,
    ind.utm,
    p.tramosImpuesto,
  )

  const totalHaberes = imponible + noImponible
  const totalDescuentos = afpCotizacion + afpComision + salud + cesantia + impuesto
  const liquido = totalHaberes - totalDescuentos

  return {
    imponible,
    noImponible,
    totalHaberes,
    baseCotizacion,
    baseCesantia,
    afpCotizacion,
    afpComision,
    salud,
    saludDeducible: saludLegal,
    cesantia,
    baseTributable,
    tramoIndice,
    tasaMarginal,
    impuesto,
    totalDescuentos,
    liquido,
    descuentoEfectivo: totalHaberes > 0 ? totalDescuentos / totalHaberes : 0,
    toparonAfp: imponible > topeAfp,
  }
}
