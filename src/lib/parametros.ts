import datos from '../config/parametros.json'
import type { Parametros } from './tipos'

/** Parámetros legales vigentes (se editan en src/config/parametros.json). */
export const PARAMETROS = datos as unknown as Parametros
