import { useId } from 'react'

export const claseCampo =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm focus:border-teal-600 focus:outline-2 focus:outline-teal-600/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'

export const claseEtiqueta = 'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'

/** Grupo de botones excluyentes (radio) con aspecto de control segmentado. */
export default function Segmentado<T extends string>({
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
      <legend id={id} className={claseEtiqueta}>
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
