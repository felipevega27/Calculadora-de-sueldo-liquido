import type { Indicadores, Parametros } from '../lib/tipos'
import { formatoCorto, formatoFecha, formatoPesos, formatoPesosDecimales } from '../lib/formato'

export type EstadoCarga = 'cargando' | 'listo' | 'error'

interface Props {
  indicadores: Indicadores
  estado: EstadoCarga
  parametros: Parametros
  onReintentar: () => void
}

function Estado({ ind, estado }: { ind: Indicadores; estado: EstadoCarga }) {
  if (estado === 'cargando') {
    return <span className="text-slate-500 dark:text-slate-400">Actualizando UF y UTM…</span>
  }
  if (ind.origen === 'en-vivo') {
    return (
      <span className="text-teal-700 dark:text-teal-400">
        ● Actualizado automáticamente ({formatoFecha(ind.fecha)})
      </span>
    )
  }
  return (
    <span className="text-amber-700 dark:text-amber-400">
      ● Sin conexión con el servicio de indicadores: usando valores del {formatoFecha(ind.fecha)}
    </span>
  )
}

export default function PieIndicadores({ indicadores, estado, parametros, onReintentar }: Props) {
  return (
    <footer className="mt-8 space-y-4 text-sm text-slate-600 dark:text-slate-400">
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Valores usados</h2>
        <dl className="cifras mt-2 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
          <div>
            <dt className="text-xs">UF</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">{formatoPesosDecimales(indicadores.uf)}</dd>
          </div>
          <div>
            <dt className="text-xs">UTM</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">{formatoPesos(indicadores.utm)}</dd>
          </div>
          <div>
            <dt className="text-xs">Tope AFP y salud</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">
              {formatoCorto(parametros.topeImponibleUF)} UF
            </dd>
          </div>
          <div>
            <dt className="text-xs">Tope cesantía</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">
              {formatoCorto(parametros.topeCesantiaUF)} UF
            </dd>
          </div>
        </dl>
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <Estado ind={indicadores} estado={estado} />
          {estado === 'listo' && indicadores.origen !== 'en-vivo' && (
            <button
              type="button"
              onClick={onReintentar}
              className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
            >
              Reintentar
            </button>
          )}
          {estado === 'error' && (
            <button
              type="button"
              onClick={onReintentar}
              className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
            >
              Reintentar
            </button>
          )}
        </p>
        <p className="mt-2 text-xs">
          Comisiones de AFP, topes y tramos de impuesto revisados el {formatoFecha(parametros.revisadoEn)}. Fuentes:{' '}
          <a className="underline underline-offset-2" href={parametros.fuentes.topes} target="_blank" rel="noreferrer">
            Superintendencia de Pensiones
          </a>{' '}
          y{' '}
          <a className="underline underline-offset-2" href={parametros.fuentes.impuesto} target="_blank" rel="noreferrer">
            SII
          </a>
          .
        </p>
      </div>

      <p className="text-xs leading-relaxed">
        Es una estimación referencial. No incluye APV, asignación familiar, créditos por hijos, descuentos
        voluntarios ni otros conceptos de tu liquidación. Para el cálculo oficial, revisa tu liquidación o consulta a
        tu empleador.
      </p>
    </footer>
  )
}
