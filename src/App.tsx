import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import BotonCompartir from './components/BotonCompartir'
import BotonTema from './components/BotonTema'
import Formulario from './components/Formulario'
import PieIndicadores, { type EstadoCarga } from './components/PieIndicadores'
import PreguntasFrecuentes from './components/PreguntasFrecuentes'
import Resultado from './components/Resultado'
import ValorHora from './components/ValorHora'
import { calcularSueldo } from './lib/calculo'
import { crearEnlace, leerEnlace } from './lib/enlace'
import { cargarIndicadores, indicadoresIniciales } from './lib/indicadores'
import { PARAMETROS } from './lib/parametros'
import type { Entrada, Indicadores, Vista } from './lib/tipos'

const CLAVE_FORM = 'formulario-v1'

const ENTRADA_INICIAL: Entrada = {
  imponible: 0,
  noImponible: 0,
  afpId: PARAMETROS.afp[0].id,
  contrato: 'indefinido',
  salud: 'fonasa',
  planIsapreUF: 0,
  sueldoBase: 0,
  horasSemanales: PARAMETROS.jornadaSemanalHoras,
  trasladoMinutos: 0,
  diasSemana: 5,
}

const PESTANAS: { id: Vista; texto: string }[] = [
  { id: 'sueldo', texto: 'Sueldo líquido' },
  { id: 'hora', texto: 'Valor hora' },
]

/** Estado inicial: un link compartido manda; si no, lo guardado en el navegador. */
function estadoInicial(): { entrada: Entrada; vista: Vista } {
  const enlace = leerEnlace(location.search, PARAMETROS.afp.map((a) => a.id))
  if (enlace) {
    return { entrada: { ...ENTRADA_INICIAL, ...enlace.entrada }, vista: enlace.vista ?? 'sueldo' }
  }
  try {
    const crudo = localStorage.getItem(CLAVE_FORM)
    if (!crudo) return { entrada: ENTRADA_INICIAL, vista: 'sueldo' }
    const e = { ...ENTRADA_INICIAL, ...(JSON.parse(crudo) as Partial<Entrada>) }
    // Si una AFP guardada ya no existe, vuelve a la primera.
    if (!PARAMETROS.afp.some((a) => a.id === e.afpId)) e.afpId = ENTRADA_INICIAL.afpId
    return { entrada: e, vista: 'sueldo' }
  } catch {
    return { entrada: ENTRADA_INICIAL, vista: 'sueldo' }
  }
}

export default function App() {
  const [inicial] = useState(estadoInicial)
  const [entrada, setEntrada] = useState<Entrada>(inicial.entrada)
  const [vista, setVista] = useState<Vista>(inicial.vista)
  const [indicadores, setIndicadores] = useState<Indicadores>(indicadoresIniciales)
  const [estado, setEstado] = useState<EstadoCarga>('cargando')
  const [intento, setIntento] = useState(0)
  const refsPestanas = useRef<(HTMLButtonElement | null)[]>([])

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

  // La URL siempre refleja el cálculo, así el link se puede compartir tal cual.
  useEffect(() => {
    const query = crearEnlace(entrada, vista, ENTRADA_INICIAL)
    if (query !== location.search) {
      history.replaceState(null, '', `${location.pathname}${query}${location.hash}`)
    }
  }, [entrada, vista])

  const cambiar = useCallback((cambios: Partial<Entrada>) => setEntrada((e) => ({ ...e, ...cambios })), [])
  const reintentar = useCallback(() => setIntento((n) => n + 1), [])

  const resultado = useMemo(() => calcularSueldo(entrada, indicadores, PARAMETROS), [entrada, indicadores])
  const afp = PARAMETROS.afp.find((a) => a.id === entrada.afpId) ?? PARAMETROS.afp[0]

  function irA(v: Vista) {
    setVista(v)
    refsPestanas.current[PESTANAS.findIndex((p) => p.id === v)]?.focus()
  }

  function teclaPestana(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const n = PESTANAS.length
    const destino =
      e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
    if (destino < 0) return
    e.preventDefault()
    irA(PESTANAS[destino].id)
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Calculadora de sueldo líquido</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Chile · AFP, salud, cesantía, impuesto único y valor de la hora extra.
          </p>
        </div>
        <BotonTema />
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Calculadoras" className="inline-flex gap-1 rounded-full bg-slate-200/70 p-1 dark:bg-slate-800">
          {PESTANAS.map((p, i) => {
            const activa = p.id === vista
            return (
              <button
                key={p.id}
                ref={(el) => {
                  refsPestanas.current[i] = el
                }}
                id={`pestana-${p.id}`}
                type="button"
                role="tab"
                aria-selected={activa}
                aria-controls={`panel-${p.id}`}
                tabIndex={activa ? 0 : -1}
                onClick={() => setVista(p.id)}
                onKeyDown={(e) => teclaPestana(e, i)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-teal-600 ${
                  activa
                    ? 'bg-white text-teal-800 shadow-sm dark:bg-slate-950 dark:text-teal-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {p.texto}
              </button>
            )
          })}
        </div>
        <BotonCompartir habilitado={entrada.imponible > 0 || entrada.sueldoBase > 0} />
      </div>

      <main>
        <div id="panel-sueldo" role="tabpanel" aria-labelledby="pestana-sueldo" hidden={vista !== 'sueldo'}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
            <Formulario entrada={entrada} onChange={cambiar} parametros={PARAMETROS} indicadores={indicadores} />
            <div className="lg:sticky lg:top-6">
              <Resultado r={resultado} afp={afp} parametros={PARAMETROS} indicadores={indicadores} />
            </div>
          </div>
        </div>

        <div id="panel-hora" role="tabpanel" aria-labelledby="pestana-hora" hidden={vista !== 'hora'}>
          <ValorHora
            entrada={entrada}
            onChange={cambiar}
            liquido={resultado.liquido}
            parametros={PARAMETROS}
            onIrASueldo={() => irA('sueldo')}
          />
        </div>

        <PreguntasFrecuentes />
      </main>

      <PieIndicadores indicadores={indicadores} estado={estado} parametros={PARAMETROS} onReintentar={reintentar} />
    </div>
  )
}
