import { useState } from 'react'

export default function BotonTema() {
  const [oscuro, setOscuro] = useState(() => document.documentElement.classList.contains('dark'))

  function alternar() {
    const siguiente = !oscuro
    document.documentElement.classList.toggle('dark', siguiente)
    try {
      localStorage.setItem('tema', siguiente ? 'oscuro' : 'claro')
    } catch {
      /* sin almacenamiento: el cambio igual se aplica en esta sesión */
    }
    setOscuro(siguiente)
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={oscuro ? 'Modo claro' : 'Modo oscuro'}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {oscuro ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  )
}
