const clp = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})
const numero = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 })
const decimales = new Intl.NumberFormat('es-CL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatoPesos = (n: number) => clp.format(Math.round(n))
/** Pesos con centavos (para la UF). */
export const formatoPesosDecimales = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
/** Número con hasta 2 decimales, sin ceros sobrantes ("90", "135,2", "0,46"). */
export const formatoCorto = (n: number) =>
  new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(n)
export const formatoNumero = (n: number) => numero.format(Math.round(n))
export const formatoDecimal = (n: number) => decimales.format(n)

export const formatoPorcentaje = (fraccion: number, digitos = 1) =>
  new Intl.NumberFormat('es-CL', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: digitos,
  }).format(fraccion)

/** Convierte el texto de un input ("1.250.000", "$ 1250000") a número entero. */
export function leerEntero(texto: string): number {
  const digitos = texto.replace(/\D/g, '')
  return digitos ? Number(digitos) : 0
}

/** "2026-11-03" -> "3 de noviembre de 2026" */
export function formatoFecha(iso: string): string {
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number)
  if (!a || !m || !d) return iso
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(a, m - 1, d)))
}
