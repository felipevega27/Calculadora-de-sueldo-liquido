import { useId } from 'react'
import { formatoNumero, leerEntero } from '../lib/formato'

interface Props {
  etiqueta: string
  ayuda?: string
  valor: number
  onChange: (valor: number) => void
  grande?: boolean
}

/** Input de dinero: muestra separador de miles mientras se escribe. */
export default function CampoPesos({ etiqueta, ayuda, valor, onChange, grande }: Props) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {etiqueta}
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500 dark:text-slate-400"
        >
          $
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={valor ? formatoNumero(valor) : ''}
          placeholder="0"
          onChange={(e) => onChange(leerEntero(e.target.value))}
          aria-describedby={ayuda ? `${id}-ayuda` : undefined}
          className={`cifras w-full rounded-lg border border-slate-300 bg-white pl-7 pr-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-teal-600 focus:outline-2 focus:outline-teal-600/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${
            grande ? 'py-3 text-xl font-semibold' : 'py-2.5 text-base'
          }`}
        />
      </div>
      {ayuda && (
        <p id={`${id}-ayuda`} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {ayuda}
        </p>
      )}
    </div>
  )
}
