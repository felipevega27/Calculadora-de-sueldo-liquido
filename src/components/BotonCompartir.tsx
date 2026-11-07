import { useEffect, useState } from 'react'

interface Props {
  /** Si es false, el botón se muestra deshabilitado (no hay nada que compartir). */
  habilitado: boolean
}

type Estado = 'normal' | 'copiado' | 'error'

/**
 * Comparte el link actual, que ya lleva los datos del cálculo en la URL.
 * En celulares abre el menú nativo (WhatsApp, etc.); en computador copia el link.
 */
export default function BotonCompartir({ habilitado }: Props) {
  const [estado, setEstado] = useState<Estado>('normal')

  useEffect(() => {
    if (estado === 'normal') return
    const t = setTimeout(() => setEstado('normal'), 2500)
    return () => clearTimeout(t)
  }, [estado])

  async function compartir() {
    const url = location.href
    const tactil = matchMedia('(pointer: coarse)').matches
    if (tactil && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'Calculadora de sueldo líquido', text: 'Mira este cálculo de sueldo:', url })
        return
      } catch (err) {
        if ((err as DOMException).name === 'AbortError') return
        // Si el menú nativo falla, se intenta copiar.
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setEstado('copiado')
    } catch {
      setEstado('error')
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span role="status" className="text-xs text-slate-600 dark:text-slate-400">
        {estado === 'copiado' && '¡Link copiado!'}
        {estado === 'error' && 'No se pudo copiar: copia la dirección del navegador.'}
      </span>
      <button
        type="button"
        onClick={compartir}
        disabled={!habilitado}
        title={habilitado ? 'Compartir un link con estos datos' : 'Ingresa tu sueldo para compartir el cálculo'}
        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:disabled:hover:bg-slate-900"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
        </svg>
        Compartir
      </button>
    </div>
  )
}
