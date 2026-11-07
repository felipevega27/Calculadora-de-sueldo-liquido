import { PREGUNTAS } from '../contenido/preguntas'

export default function PreguntasFrecuentes() {
  return (
    <section aria-labelledby="preguntas-titulo" className="mt-10">
      <h2 id="preguntas-titulo" className="text-xl font-bold tracking-tight">
        Preguntas frecuentes
      </h2>
      <div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        {PREGUNTAS.map((p) => (
          <details key={p.pregunta} className="group px-5 py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 [&::-webkit-details-marker]:hidden">
              <h3>{p.pregunta}</h3>
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0 text-slate-500 transition group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <p className="pb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{p.respuesta}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
