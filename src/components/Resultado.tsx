import type { Afp, Indicadores, Parametros, Resultado as TResultado } from '../lib/tipos'
import { formatoCorto, formatoPesos, formatoPorcentaje } from '../lib/formato'

interface Props {
  r: TResultado
  afp: Afp
  parametros: Parametros
  indicadores: Indicadores
}

function Fila({
  texto,
  detalle,
  monto,
  negativo,
  fuerte,
}: {
  texto: string
  detalle?: string
  monto: number
  negativo?: boolean
  fuerte?: boolean
}) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2 ${fuerte ? 'font-semibold' : ''}`}>
      <div className="min-w-0">
        <span>{texto}</span>
        {detalle && <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">{detalle}</span>}
      </div>
      <span className="cifras shrink-0">
        {negativo && monto > 0 ? '− ' : ''}
        {formatoPesos(monto)}
      </span>
    </div>
  )
}

export default function Resultado({ r, afp, parametros, indicadores }: Props) {
  const sinDatos = r.totalHaberes === 0
  const afpTotal = r.afpCotizacion + r.afpComision

  // Cada segmento de la barra, con su % del total de haberes.
  const segmentos = [
    { id: 'liquido', texto: 'Te queda', monto: r.liquido, color: 'bg-teal-600' },
    { id: 'afp', texto: 'AFP', monto: afpTotal, color: 'bg-sky-600' },
    { id: 'salud', texto: 'Salud', monto: r.salud, color: 'bg-violet-600' },
    { id: 'cesantia', texto: 'Cesantía', monto: r.cesantia, color: 'bg-amber-500' },
    { id: 'impuesto', texto: 'Impuesto', monto: r.impuesto, color: 'bg-rose-600' },
  ]

  const tope = parametros.topeImponibleUF * indicadores.uf
  const umbralExento = parametros.tramosImpuesto[0].hastaUTM! * indicadores.utm

  return (
    <section
      aria-live="polite"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="text-lg font-semibold">Tu sueldo líquido</h2>

      <p className="cifras mt-2 text-4xl font-bold tracking-tight text-teal-700 sm:text-5xl dark:text-teal-400">
        {sinDatos ? '$0' : formatoPesos(r.liquido)}
      </p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {sinDatos
          ? 'Ingresa tu sueldo imponible para ver el cálculo.'
          : `Se te descuenta el ${formatoPorcentaje(r.descuentoEfectivo)} de tus haberes.`}
      </p>

      {!sinDatos && (
        <>
          <div
            className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
            role="img"
            aria-label={segmentos
              .filter((s) => s.monto > 0)
              .map((s) => `${s.texto}: ${formatoPorcentaje(s.monto / r.totalHaberes)}`)
              .join(', ')}
          >
            {segmentos.map(
              (s) =>
                s.monto > 0 && (
                  <div
                    key={s.id}
                    className={s.color}
                    style={{ width: `${(s.monto / r.totalHaberes) * 100}%` }}
                  />
                ),
            )}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
            {segmentos
              .filter((s) => s.monto > 0)
              .map((s) => (
                <li key={s.id} className="flex items-center gap-1.5">
                  <span className={`inline-block h-2.5 w-2.5 rounded-sm ${s.color}`} aria-hidden="true" />
                  {s.texto} <span className="cifras">{formatoPorcentaje(s.monto / r.totalHaberes)}</span>
                </li>
              ))}
          </ul>
        </>
      )}

      <div className="mt-6 divide-y divide-slate-200 text-sm dark:divide-slate-800">
        <div>
          <Fila texto="Sueldo imponible" monto={r.imponible} />
          {r.noImponible > 0 && <Fila texto="Haberes no imponibles" monto={r.noImponible} />}
          <Fila texto="Total haberes" monto={r.totalHaberes} fuerte />
        </div>

        <div>
          <Fila
            texto="AFP"
            detalle={`${formatoCorto(parametros.tasaAfp)}% ahorro`}
            monto={r.afpCotizacion}
            negativo
          />
          <Fila
            texto="Comisión AFP"
            detalle={`${afp.nombre} · ${formatoCorto(afp.comision)}%`}
            monto={r.afpComision}
            negativo
          />
          <Fila texto="Salud" detalle={`mín. ${formatoCorto(parametros.tasaSalud)}%`} monto={r.salud} negativo />
          <Fila
            texto="Seguro de cesantía"
            detalle={`${formatoCorto(parametros.cesantiaTrabajadorIndefinido)}%`}
            monto={r.cesantia}
            negativo
          />
          <Fila
            texto="Impuesto único"
            detalle={r.impuesto > 0 ? `tramo ${formatoPorcentaje(r.tasaMarginal)}` : 'exento'}
            monto={r.impuesto}
            negativo
          />
          <Fila texto="Total descuentos" monto={r.totalDescuentos} negativo fuerte />
        </div>

        <div className="pt-1">
          <Fila texto="Sueldo líquido" monto={r.liquido} fuerte />
        </div>
      </div>

      {!sinDatos && (
        <ul className="mt-5 space-y-2 text-xs text-slate-600 dark:text-slate-400">
          {r.toparonAfp && (
            <li>
              Tu sueldo supera el tope imponible de {formatoCorto(parametros.topeImponibleUF)} UF (≈{' '}
              {formatoPesos(tope)}): AFP y salud se calculan solo hasta ese monto.
            </li>
          )}
          <li>
            Base del impuesto (sueldo imponible menos cotizaciones): {formatoPesos(r.baseTributable)}.{' '}
            {r.impuesto === 0
              ? `No pagas impuesto porque no supera ${formatoPesos(umbralExento)} (13,5 UTM).`
              : `Corresponde al tramo del ${formatoPorcentaje(r.tasaMarginal)}.`}
          </li>
        </ul>
      )}
    </section>
  )
}
