import { useCallback, useEffect, useMemo, useState } from 'react'
import BotonTema from './components/BotonTema'
import Formulario from './components/Formulario'
import PieIndicadores, { type EstadoCarga } from './components/PieIndicadores'
import Resultado from './components/Resultado'
import { calcularSueldo } from './lib/calculo'
import { cargarIndicadores, indicadoresIniciales } from './lib/indicadores'
import { PARAMETROS } from './lib/parametros'
import type { Entrada, Indicadores } from './lib/tipos'

const CLAVE_FORM = 'formulario-v1'

const ENTRADA_INICIAL: Entrada = {
  imponible: 0,
  noImponible: 0,
  afpId: PARAMETROS.afp[0].id,
  contrato: 'indefinido',
  salud: 'fonasa',
  planIsapreUF: 0,
}

function leerEntradaGuardada(): Entrada {
  try {
    const crudo = localStorage.getItem(CLAVE_FORM)
    if (!crudo) return ENTRADA_INICIAL
    const e = { ...ENTRADA_INICIAL, ...(JSON.parse(crudo) as Partial<Entrada>) }
    // Si una AFP guardada ya no existe, vuelve a la primera.
    if (!PARAMETROS.afp.some((a) => a.id === e.afpId)) e.afpId = ENTRADA_INICIAL.afpId
    return e
  } catch {
    return ENTRADA_INICIAL
  }
}

export default function App() {
  const [entrada, setEntrada] = useState<Entrada>(leerEntradaGuardada)
  const [indicadores, setIndicadores] = useState<Indicadores>(indicadoresIniciales)
  const [estado, setEstado] = useState<EstadoCarga>('cargando')
  const [intento, setIntento] = useState(0)

  // Consulta UF y UTM al abrir la página (y cuando se pulsa "Reintentar").
  useEffect(() => {
    const control = new AbortController()
    setEstado('cargando')
    cargarIndicadores(control.signal)
      .then((ind) => {
        setIndicadores(ind)
        setEstado('listo')
      })
      .catch((err: unknown) => {
        if (control.signal.aborted) return
        console.warn('No se pudieron actualizar los indicadores:', err)
        setEstado('error')
      })
    return () => control.abort()
  }, [intento])

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_FORM, JSON.stringify(entrada))
    } catch {
      /* sin almacenamiento: se omite */
    }
  }, [entrada])

  const cambiar = useCallback((cambios: Partial<Entrada>) => setEntrada((e) => ({ ...e, ...cambios })), [])
  const reintentar = useCallback(() => setIntento((n) => n + 1), [])

  const resultado = useMemo(() => calcularSueldo(entrada, indicadores, PARAMETROS), [entrada, indicadores])
  const afp = PARAMETROS.afp.find((a) => a.id === entrada.afpId) ?? PARAMETROS.afp[0]

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 flex items-start justify-between gap-4 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Calculadora de sueldo líquido</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Chile · AFP, salud, cesantía e impuesto único de segunda categoría.
          </p>
        </div>
        <BotonTema />
      </header>

      <main className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <Formulario entrada={entrada} onChange={cambiar} parametros={PARAMETROS} indicadores={indicadores} />
        <div className="lg:sticky lg:top-6">
          <Resultado r={resultado} afp={afp} parametros={PARAMETROS} indicadores={indicadores} />
        </div>
      </main>

      <PieIndicadores indicadores={indicadores} estado={estado} parametros={PARAMETROS} onReintentar={reintentar} />
    </div>
  )
}
