import { calcularValorHora } from '../lib/hora'
import type { Entrada, Parametros } from '../lib/tipos'
import { formatoCorto, formatoNumero, formatoPesos, formatoPorcentaje } from '../lib/formato'
import CampoNumero from './CampoNumero'
import CampoPesos from './CampoPesos'

interface Props {
  entrada: Entrada
  onChange: (cambios: Partial<Entrada>) => void
  /** Sueldo líquido calculado en la pestaña principal. */
  liquido: number
  parametros: Parametros
  onIrASueldo: () => void
}

const claseTarjeta =
  'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900'

function Fila({ texto, detalle, valor, fuerte }: { texto: string; detalle?: string; valor: string; fuerte?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2 ${fuerte ? 'font-semibold' : ''}`}>
      <div className="min-w-0">
        <span>{texto}</span>
        {detalle && <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">{detalle}</span>}
      </div>
      <span className="cifras shrink-0">{valor}</span>
    </div>
  )
}

function Dato({ texto, valor, destacado }: { texto: string; valor: string; destacado?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800/70">
      <p className="text-xs text-slate-600 dark:text-slate-400">{texto}</p>
      <p
        className={`cifras mt-1 text-2xl font-bold tracking-tight ${
          destacado ? 'text-teal-700 dark:text-teal-400' : 'text-slate-900 dark:text-slate-100'
        }`}
      >
        {valor}
      </p>
    </div>
  )
}

export default function ValorHora({ entrada, onChange, liquido, parametros: P, onIrASueldo }: Props) {
  const usaImponible = entrada.sueldoBase === 0 && entrada.imponible > 0
  const base = entrada.sueldoBase > 0 ? entrada.sueldoBase : entrada.imponible

  const r = calcularValorHora({
    sueldoBase: base,
    horasSemanales: entrada.horasSemanales,
    liquido,
    trasladoMinutos: entrada.trasladoMinutos,
    diasSemana: entrada.diasSemana,
    recargo: P.recargoHoraExtra,
  })

  const sinBase = base === 0 || entrada.horasSemanales === 0
  const conTraslado = entrada.trasladoMinutos > 0 && entrada.diasSemana > 0
  const caida = r.liquidoPorHora > 0 ? 1 - r.valorHoraReal / r.liquidoPorHora : 0

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
      <form onSubmit={(e) => e.preventDefault()} className={`space-y-5 ${claseTarjeta}`}>
        <h2 className="text-lg font-semibold">Tu jornada</h2>

        <CampoPesos
          grande
          etiqueta="Sueldo base mensual"
          ayuda={
            usaImponible
              ? `Vacío: se usa tu sueldo imponible (${formatoPesos(entrada.imponible)}). Si incluye gratificación o bonos, escribe solo el sueldo base.`
              : 'Sin gratificación ni bonos: la hora extra se calcula sobre el sueldo base.'
          }
          valor={entrada.sueldoBase}
          onChange={(sueldoBase) => onChange({ sueldoBase })}
        />

        <CampoNumero
          etiqueta="Horas semanales de tu contrato"
          ayuda={`La jornada máxima legal es de ${P.jornadaSemanalHoras} horas.`}
          unidad="horas"
          max={168}
          valor={entrada.horasSemanales}
          onChange={(horasSemanales) => onChange({ horasSemanales })}
        />

        <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
          <h3 className="font-semibold">Traslado (opcional)</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Para calcular tu valor hora real, contando el tiempo que pasas yendo y volviendo del trabajo.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <CampoNumero
              etiqueta="Ida y vuelta al día"
              unidad="min"
              max={24 * 60}
              valor={entrada.trasladoMinutos}
              onChange={(trasladoMinutos) => onChange({ trasladoMinutos })}
            />
            <CampoNumero
              etiqueta="Días a la semana"
              unidad="días"
              max={7}
              valor={entrada.diasSemana}
              onChange={(diasSemana) => onChange({ diasSemana })}
            />
          </div>
        </div>
      </form>

      <section aria-live="polite" className={`lg:sticky lg:top-6 ${claseTarjeta}`}>
        <h2 className="text-lg font-semibold">Valor de tu hora extra</h2>
        <p className="cifras mt-2 text-4xl font-bold tracking-tight text-teal-700 sm:text-5xl dark:text-teal-400">
          {sinBase ? '$0' : formatoPesos(r.valorHoraExtra)}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {sinBase
            ? 'Ingresa tu sueldo base y tus horas semanales.'
            : `Hora ordinaria de ${formatoPesos(r.valorHoraOrdinaria)} más ${formatoCorto(P.recargoHoraExtra)}% de recargo.`}
        </p>

        <div className="mt-5 divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <Fila texto="Sueldo base" detalle={usaImponible ? 'usando el imponible' : undefined} valor={formatoPesos(base)} />
          <Fila texto="Valor hora ordinaria" valor={formatoPesos(r.valorHoraOrdinaria)} />
          <Fila
            texto="Valor hora extra"
            detalle={`sueldo base × ${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 7 }).format(r.factorHoraExtra)}`}
            valor={formatoPesos(r.valorHoraExtra)}
            fuerte
          />
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
          <h3 className="font-semibold">¿Cuánto ganas realmente por hora?</h3>
          {liquido <= 0 ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Se calcula con tu sueldo líquido.{' '}
              <button
                type="button"
                onClick={onIrASueldo}
                className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
              >
                Complétalo en la pestaña Sueldo líquido
              </button>
              .
            </p>
          ) : (
            <>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Con tu sueldo líquido de {formatoPesos(liquido)} (pestaña Sueldo líquido).
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Dato texto="Por hora trabajada" valor={formatoPesos(r.liquidoPorHora)} destacado={!conTraslado} />
                <Dato
                  texto="Valor hora real (con traslado)"
                  valor={conTraslado ? formatoPesos(r.valorHoraReal) : '—'}
                  destacado={conTraslado}
                />
              </div>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  Trabajas unas {formatoNumero(r.horasTrabajoMes)} horas al mes ({entrada.horasSemanales} horas
                  semanales).
                </li>
                {conTraslado ? (
                  <li>
                    El traslado te suma unas {formatoNumero(r.horasTrasladoMes)} horas al mes sin pago, y baja lo que
                    ganas por hora en un {formatoPorcentaje(caida)}.
                  </li>
                ) : (
                  <li>Agrega tus minutos de traslado para ver tu valor hora real.</li>
                )}
              </ul>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
