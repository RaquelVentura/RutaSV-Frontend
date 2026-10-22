import { Link } from 'react-router-dom'

export default function VerificationResult({ accepted }) {
  const title = accepted ? '¡Correo verificado!' : 'No se pudo verificar'
  const description = accepted
    ? 'El código fue aceptado y tu correo quedó verificado.'
    : 'El código no fue aceptado. Revisa el código e inténtalo de nuevo.'

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-sm sm:p-8">
      <div
        aria-hidden="true"
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold ${
          accepted ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {accepted ? '✓' : '×'}
      </div>
      <h1 className="mt-5 text-2xl font-bold text-stone-900">{title}</h1>
      <p className="mt-2 text-sm text-stone-600">{description}</p>
      <div className="mt-7 flex flex-col gap-3">
        {accepted ? (
          <Link
            to="/login"
            className="rounded-xl bg-[#087E9A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800"
          >
            Ir a iniciar sesión
          </Link>
        ) : (
          <Link
            to="/registro"
            className="rounded-xl bg-[#087E9A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800"
          >
            Intentar de nuevo
          </Link>
        )}
        <Link to="/" className="py-2 text-sm font-medium text-[#087E9A] hover:underline">
          Volver al inicio
        </Link>
      </div>
    </section>
  )
}
