import { PARAMETROS as P } from '../lib/parametros'

/**
 * Preguntas frecuentes. Se muestran al final de la página y también se publican
 * como datos estructurados (FAQPage) en el HTML durante el build (ver vite.config.ts),
 * así que el texto debe ser plano, sin HTML.
 */

const num = (n: number, decimales = 2) =>
  new Intl.NumberFormat('es-CL', { maximumFractionDigits: decimales }).format(n)

const factorHoraExtra = (28 / (30 * 4 * P.jornadaSemanalHoras)) * (1 + P.recargoHoraExtra / 100)

export interface Pregunta {
  pregunta: string
  respuesta: string
}

export const PREGUNTAS: Pregunta[] = [
  {
    pregunta: '¿Cómo se calcula el sueldo líquido?',
    respuesta:
      `Al sueldo imponible (sueldo base, gratificación y bonos imponibles) se le restan: ` +
      `${num(P.tasaAfp)}% de cotización obligatoria de AFP más la comisión de tu AFP; ` +
      `${num(P.tasaSalud)}% de salud, o el valor de tu plan de Isapre si es mayor; ` +
      `${num(P.cesantiaTrabajadorIndefinido)}% de seguro de cesantía si tu contrato es indefinido; ` +
      `y el impuesto único de segunda categoría. Al resultado se le suman los haberes no imponibles, ` +
      `como colación y movilización, que no pagan cotizaciones ni impuesto.`,
  },
  {
    pregunta: '¿Qué es el tope imponible?',
    respuesta:
      `Es el sueldo máximo sobre el que se calculan las cotizaciones. Hoy es de ` +
      `${num(P.topeImponibleUF)} UF para AFP y salud, y de ${num(P.topeCesantiaUF)} UF para el ` +
      `seguro de cesantía. Si ganas más, la parte que supera el tope no paga cotizaciones, pero sí ` +
      `paga impuesto. La Superintendencia de Pensiones reajusta los topes cada año.`,
  },
  {
    pregunta: '¿Cómo se calcula la hora extra?',
    respuesta:
      `Con la fórmula de la Dirección del Trabajo para sueldos mensuales: sueldo base ÷ 30 × 28 ÷ ` +
      `(4 × horas semanales) da el valor de la hora ordinaria, y la hora extra se paga con un ` +
      `recargo de ${num(P.recargoHoraExtra)}%. Con la jornada de ${P.jornadaSemanalHoras} horas, ` +
      `la hora extra vale el sueldo base × ${num(factorHoraExtra, 7)}. Se calcula sobre el sueldo ` +
      `base, sin gratificación ni bonos variables.`,
  },
  {
    pregunta: '¿Cuándo se paga el impuesto único de segunda categoría?',
    respuesta:
      `Solo si tu sueldo, después de descontar las cotizaciones, supera ` +
      `${num(P.tramosImpuesto[0].hastaUTM ?? 0)} UTM al mes. Funciona por tramos, con tasas que ` +
      `van del ${num(P.tramosImpuesto[1].factor * 100)}% al ` +
      `${num(P.tramosImpuesto[P.tramosImpuesto.length - 1].factor * 100)}%. Como los tramos están ` +
      `en UTM, se ajustan solos cada mes.`,
  },
  {
    pregunta: '¿Qué cambia si estoy en Isapre?',
    respuesta:
      `Pagas el valor de tu plan, que se pacta en UF, pero nunca menos del ${num(P.tasaSalud)}% ` +
      `legal. Para el impuesto solo se descuenta ese ${num(P.tasaSalud)}%: lo que pagas por ` +
      `sobre él no rebaja la base del impuesto.`,
  },
  {
    pregunta: '¿Qué es el valor hora real?',
    respuesta:
      `Es lo que ganas en la práctica por cada hora que le dedicas al trabajo: tu sueldo líquido ` +
      `dividido por las horas trabajadas más las horas de traslado. Si demoras una hora entre ida ` +
      `y vuelta, cinco días a la semana, son unas 22 horas al mes que no te paga nadie.`,
  },
  {
    pregunta: '¿Cada cuánto se actualizan los valores?',
    respuesta:
      `La UF y la UTM se consultan automáticamente cada vez que abres la página. Las comisiones ` +
      `de AFP, los topes y los tramos del impuesto se revisan cuando cambian; la fecha de la última ` +
      `revisión aparece al pie de la página.`,
  },
]
