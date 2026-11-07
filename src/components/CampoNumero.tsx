import { useId } from 'react'
import { leerEntero } from '../lib/formato'
import { claseCampo, claseEtiqueta } from './Segmentado'

interface Props {
  etiqueta: string
  ayuda?: string
  valor: number
  onChange: (valor: number) => void
  /** Unidad que se muestra a la derecha ("horas", "min"). */
  unidad: string
  max: number
}

/** Input de número entero pequeño (horas, minutos, días). */
export default function CampoNumero({ etiqueta, ayuda, valor, onChange, unidad, max }: Props) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className={claseEtiqueta}>
        {etiqueta}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={valor ? String(valor) : ''}
          onChange={(e) => onChange(Math.min(max, leerEntero(e.target.value)))}
          aria-describedby={ayuda ? `${id}-ayuda` : undefined}
          className={`cifras pr-16 ${claseCampo}`}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-500 dark:text-slate-400"
        >
          {unidad}
        </span>
      </div>
      {ayuda && (
        <p id={`${id}-ayuda`} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {ayuda}
        </p>
      )}
    </div>
  )
}
