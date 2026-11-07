import { PARAMETROS } from './parametros'
import type { Indicadores } from './tipos'

/**
 * UF y UTM se consultan en vivo a mindicador.cl (API pública y gratuita,
 * con CORS habilitado, así que funciona directo desde el navegador y
 * no necesita servidor). Si falla, se usa el último valor guardado en el
 * navegador y, en último caso, el valor de respaldo de parametros.json.
 */
const URL_API = 'https://mindicador.cl/api'
const CLAVE_CACHE = 'indicadores-v1'
const VIGENCIA_CACHE_MS = 6 * 60 * 60 * 1000 // 6 horas

interface RespuestaApi {
  uf?: { valor?: number; fecha?: string }
  utm?: { valor?: number; fecha?: string }
}

interface Guardado extends Indicadores {
  guardadoEn: number
}

function leerCache(): Guardado | null {
  try {
    const crudo = localStorage.getItem(CLAVE_CACHE)
    if (!crudo) return null
    const g = JSON.parse(crudo) as Guardado
    return typeof g.uf === 'number' && typeof g.utm === 'number' ? g : null
  } catch {
    return null
  }
}

function guardarCache(ind: Indicadores) {
  try {
    const g: Guardado = { ...ind, guardadoEn: Date.now() }
    localStorage.setItem(CLAVE_CACHE, JSON.stringify(g))
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

export function indicadoresDeRespaldo(): Indicadores {
  const { uf, utm, fecha } = PARAMETROS.respaldo
  return { uf, utm, fecha, origen: 'respaldo' }
}

/** Lo que se puede mostrar al instante, sin esperar a la red. */
export function indicadoresIniciales(): Indicadores {
  const c = leerCache()
  return c ? { uf: c.uf, utm: c.utm, fecha: c.fecha, origen: 'guardado' } : indicadoresDeRespaldo()
}

export async function cargarIndicadores(signal?: AbortSignal): Promise<Indicadores> {
  const c = leerCache()
  if (c && Date.now() - c.guardadoEn < VIGENCIA_CACHE_MS) {
    return { uf: c.uf, utm: c.utm, fecha: c.fecha, origen: 'en-vivo' }
  }

  const resp = await fetch(URL_API, { signal })
  if (!resp.ok) throw new Error(`mindicador respondió ${resp.status}`)
  const datos = (await resp.json()) as RespuestaApi

  const uf = datos.uf?.valor
  const utm = datos.utm?.valor
  // Validación básica: descarta respuestas raras o valores absurdos.
  if (typeof uf !== 'number' || typeof utm !== 'number' || uf < 10_000 || utm < 30_000) {
    throw new Error('mindicador devolvió datos inválidos')
  }

  const ind: Indicadores = {
    uf,
    utm,
    fecha: (datos.uf?.fecha ?? new Date().toISOString()).slice(0, 10),
    origen: 'en-vivo',
  }
  guardarCache(ind)
  return ind
}
