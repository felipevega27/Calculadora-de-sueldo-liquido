import { useId } from 'react'
import type { Entrada, Indicadores, Parametros } from '../lib/tipos'
import { formatoCorto, formatoPesos } from '../lib/formato'
import CampoPesos from './CampoPesos'

interface Props {
  entrada: Entrada
  onChange: (cambios: Partial<Entrada>) => void
  parametros: Parametros
  indicadores: Indicadores
}

const claseSelect =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm focus:border-teal-600 focus:outline-2 focus:outline-teal-600/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'

function Segmentado<T extends string>({
  etiqueta,
  opciones,
  valor,
  onChange,
}: {
  etiqueta: string
  opciones: { valor: T; texto: string }[]
  valor: T
  onChange: (v: T) => void
}) {
  const id = useId()
  return (
    <fieldset>
      <legend id={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {etiqueta}
      </legend>
      <div role="radiogroup" aria-labelledby={id} className="grid grid-flow-col auto-cols-fr gap-1 rounded-lg bg-slate-200/70 p-1 dark:bg-slate-800">
        {opciones.map((o) => {
          const activo = o.valor === valor
          return (
            <button
              key={o.valor}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => onChange(o.valor)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-teal-600 ${
                activo
                  ? 'bg-white text-teal-800 shadow-sm dark:bg-slate-950 dark:text-teal-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {o.texto}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export default function Formulario({ entrada, onChange, parametros, indicadores }: Props) {
  const idAfp = useId()
  const idPlan = useId()

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="text-lg font-semibold">Tus datos</h2>

      <CampoPesos
        grande
        etiqueta="Sueldo imponible mensual"
        ayuda="Sueldo base + gratificación + bonos imponibles, antes de descuentos."
        valor={entrada.imponible}
        onChange={(imponible) => onChange({ imponible })}
      />

      <CampoPesos
        etiqueta="Haberes no imponibles (opcional)"
        ayuda="Colación, movilización y similares. No pagan cotizaciones ni impuesto."
        valor={entrada.noImponible}
        onChange={(noImponible) => onChange({ noImponible })}
      />

      <div>
        <label htmlFor={idAfp} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          AFP
        </label>
        <select
          id={idAfp}
          value={entrada.afpId}
          onChange={(e) => onChange({ afpId: e.target.value })}
          className={claseSelect}
        >
          {parametros.afp.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre} — comisión {formatoCorto(a.comision)}%
            </option>
          ))}
        </select>
      </div>

      <Segmentado
        etiqueta="Sistema de salud"
        valor={entrada.salud}
        onChange={(salud) => onChange({ salud })}
        opciones={[
          { valor: 'fonasa', texto: 'Fonasa (7%)' },
          { valor: 'isapre', texto: 'Isapre' },
        ]}
      />

      {entrada.salud === 'isapre' && (
        <div>
          <label htmlFor={idPlan} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Valor de tu plan (en UF)
          </label>
          <input
            id={idPlan}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0,00"
            value={entrada.planIsapreUF ? String(entrada.planIsapreUF).replace('.', ',') : ''}
            onChange={(e) => {
              const n = Number(e.target.value.replace(',', '.').replace(/[^\d.]/g, ''))
              onChange({ planIsapreUF: Number.isFinite(n) ? n : 0 })
            }}
            aria-describedby={`${idPlan}-ayuda`}
            className={`cifras ${claseSelect}`}
          />
          <p id={`${idPlan}-ayuda`} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {entrada.planIsapreUF > 0
              ? `≈ ${formatoPesos(entrada.planIsapreUF * indicadores.uf)} al mes con la UF actual. `
              : ''}
            Si tu plan vale menos que el 7 %, igual se descuenta el 7 %.
          </p>
        </div>
      )}

      <Segmentado
        etiqueta="Tipo de contrato"
        valor={entrada.contrato}
        onChange={(contrato) => onChange({ contrato })}
        opciones={[
          { valor: 'indefinido', texto: 'Indefinido' },
          { valor: 'plazo-fijo', texto: 'Plazo fijo / obra' },
        ]}
      />
    </form>
  )
}
