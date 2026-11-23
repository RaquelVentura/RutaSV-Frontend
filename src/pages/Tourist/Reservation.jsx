import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { createWebReservation } from '../../lib/bookingApi.js'
import { extractApiError, resolveAssetUrl } from '../../lib/catalogApi.js'
import { formatCurrency, formatDateReadable } from '../../lib/formatters.js'
import { notify } from '../../lib/notify.js'

function Reservation() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const bookingState = location.state || {}
  const experience = bookingState.experience || null
  const availability = bookingState.availability || null
  const peopleCount = Number(bookingState.peopleCount ?? 1)

  const initialName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || ''
  const [contactName, setContactName] = useState(initialName)
  const [contactEmail, setContactEmail] = useState(user?.email || '')
  const [contactPhone, setContactPhone] = useState('')
  const [specialNotes, setSpecialNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('TARJETA_DEMO')
  const [cardHolder, setCardHolder] = useState(initialName)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorBanner, setErrorBanner] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)

  if (!experience || !availability) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-ink">Selecciona una experiencia primero</h1>
        <p className="mt-2 text-sm text-muted">
          Para iniciar una reservación elige una experiencia, una fecha y la cantidad de cupos disponibles.
        </p>
        <Link
          to="/experiencias"
          className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Explorar experiencias
        </Link>
      </div>
    )
  }

  const unitPrice = Number(availability.effectivePrice ?? experience.price ?? 0)
  const totalAmount = unitPrice * peopleCount

  function validateForm() {
    if (!contactName.trim()) return 'Ingresa el nombre del titular de la reserva.'
    if (!contactEmail.trim() || !contactEmail.includes('@')) return 'Ingresa un correo electrónico válido.'
    if (paymentMethod === 'TARJETA_DEMO') {
      const digits = cardNumber.replace(/\D/g, '')
      if (!cardHolder.trim()) return 'Ingresa el nombre en la tarjeta (simulada).'
      if (digits.length < 12 || digits.length > 19) return 'Ingresa un número de tarjeta simulado válido (12-19 dígitos).'
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) return 'Ingresa el vencimiento en formato MM/AA.'
      if (!/^\d{3,4}$/.test(cardCvv.trim())) return 'Ingresa un código CVV simulado de 3 o 4 dígitos.'
    }
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorBanner('')
    setNeedsVerification(false)

    const validationError = validateForm()
    if (validationError) {
      setErrorBanner(validationError)
      return
    }

    setSubmitting(true)
    try {
      const created = await createWebReservation({
        experienceId: experience.id,
        availabilityId: availability.id,
        peopleCount,
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim() || null,
        specialNotes: specialNotes.trim() || null,
        paymentMethod,
      })

      notify.success(`Reserva ${created.reservationCode} creada correctamente.`)
      navigate(`/turista/reservar/confirmacion?id=${created.id}`, {
        replace: true,
        state: { reservation: created },
      })
    } catch (error) {
      const parsed = extractApiError(error, 'No se pudo completar la reserva.')
      if (parsed.code === 'EMAIL_NO_VERIFICADO' || parsed.status === 403) {
        setNeedsVerification(true)
      }
      setErrorBanner(parsed.message)
    } finally {
      setSubmitting(false)
    }
  }

  const coverUrl =
    resolveAssetUrl(experience.images?.[0]?.url || experience.coverImageUrl) ||
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=70'

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to={`/experiencias/${experience.slug}`} className="text-sm font-semibold text-brand hover:underline">
            ← Volver a la experiencia
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-ink">Confirmar reserva y pago demo</h1>
        </div>
        <span className="rounded-full bg-info-soft px-3.5 py-1.5 text-xs font-bold text-brand">
          Entorno de pago simulado (sin cargos reales)
        </span>
      </div>

      {errorBanner && (
        <div role="alert" className="rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          <p className="font-semibold">{errorBanner}</p>
          {needsVerification && (
            <Link to="/verify-email" className="mt-2 inline-block font-bold underline">
              Ir a verificar mi correo electrónico →
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-mist bg-surface p-6">
            <h2 className="text-lg font-bold text-ink">1. Datos de contacto del visitante</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="res-name" className="mb-1 block text-xs font-semibold text-muted">
                  Nombre completo *
                </label>
                <input
                  id="res-name"
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full rounded-xl border border-mist bg-canvas px-3.5 py-2.5 text-sm text-ink"
                />
              </div>
              <div>
                <label htmlFor="res-email" className="mb-1 block text-xs font-semibold text-muted">
                  Correo electrónico (para comprobante) *
                </label>
                <input
                  id="res-email"
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full rounded-xl border border-mist bg-canvas px-3.5 py-2.5 text-sm text-ink"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="res-phone" className="mb-1 block text-xs font-semibold text-muted">
                  Teléfono / WhatsApp
                </label>
                <input
                  id="res-phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="7000-0000"
                  className="w-full rounded-xl border border-mist bg-canvas px-3.5 py-2.5 text-sm text-ink"
                />
              </div>
              <div>
                <label htmlFor="res-notes" className="mb-1 block text-xs font-semibold text-muted">
                  Notas especiales (alergias, equipo, etc.)
                </label>
                <input
                  id="res-notes"
                  type="text"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Opcional"
                  className="w-full rounded-xl border border-mist bg-canvas px-3.5 py-2.5 text-sm text-ink"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-mist bg-surface p-6">
            <h2 className="text-lg font-bold text-ink">2. Pago simulado (Demo)</h2>
            <p className="text-xs text-muted">
              Este flujo registra el pago como <strong>PAGADO_DEMO</strong> y envía la notificación por correo sin procesar dinero real ni almacenar datos de tarjeta.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('TARJETA_DEMO')}
                className={`rounded-xl border p-3.5 text-left text-sm font-semibold ${
                  paymentMethod === 'TARJETA_DEMO'
                    ? 'border-brand bg-info-soft text-brand'
                    : 'border-mist bg-canvas text-ink'
                }`}
              >
                Tarjeta de crédito / débito (Demo)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFERENCIA_DEMO')}
                className={`rounded-xl border p-3.5 text-left text-sm font-semibold ${
                  paymentMethod === 'TRANSFERENCIA_DEMO'
                    ? 'border-brand bg-info-soft text-brand'
                    : 'border-mist bg-canvas text-ink'
                }`}
              >
                Transferencia inmediata (Demo)
              </button>
            </div>

            {paymentMethod === 'TARJETA_DEMO' ? (
              <div className="grid gap-4 pt-2 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="card-holder" className="mb-1 block text-xs font-semibold text-muted">
                    Titular de la tarjeta
                  </label>
                  <input
                    id="card-holder"
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full rounded-xl border border-mist bg-canvas px-3.5 py-2.5 text-sm text-ink"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="card-number" className="mb-1 block text-xs font-semibold text-muted">
                    Número de tarjeta simulado
                  </label>
                  <input
                    id="card-number"
                    type="text"
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full rounded-xl border border-mist bg-canvas px-3.5 py-2.5 text-sm text-ink"
                  />
                </div>
                <div>
                  <label htmlFor="card-expiry" className="mb-1 block text-xs font-semibold text-muted">
                    Vencimiento (MM/AA)
                  </label>
                  <input
                    id="card-expiry"
                    type="text"
                    placeholder="12/28"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full rounded-xl border border-mist bg-canvas px-3.5 py-2.5 text-sm text-ink"
                  />
                </div>
                <div>
                  <label htmlFor="card-cvv" className="mb-1 block text-xs font-semibold text-muted">
                    CVV
                  </label>
                  <input
                    id="card-cvv"
                    type="text"
                    inputMode="numeric"
                    placeholder="123"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full rounded-xl border border-mist bg-canvas px-3.5 py-2.5 text-sm text-ink"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-mist bg-canvas p-4 text-xs text-muted">
                Al confirmar, el sistema simulará la validación instantánea de la transferencia y emitirá tu comprobante por correo electrónico.
              </div>
            )}
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            {submitting
              ? 'Procesando reserva y pago demo...'
              : `Confirmar y pagar ${formatCurrency(totalAmount, experience.currency)} (Demo)`}
          </button>
        </form>

        <aside className="h-fit space-y-4 rounded-2xl border border-mist bg-surface p-6">
          <img
            src={coverUrl}
            alt={experience.title}
            className="aspect-[16/10] w-full rounded-xl object-cover"
          />
          <div>
            <p className="text-xs font-semibold uppercase text-brand">Resumen de tu reserva</p>
            <h2 className="mt-1 text-lg font-bold text-ink">{experience.title}</h2>
            <p className="text-xs text-muted">
              {experience.municipalityName}, {experience.departmentName}
            </p>
          </div>

          <dl className="space-y-2 border-t border-mist pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Fecha</dt>
              <dd className="font-semibold text-ink">{formatDateReadable(availability.date)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Horario</dt>
              <dd className="font-semibold text-ink">
                {availability.startTime}
                {availability.endTime ? ` – ${availability.endTime}` : ''}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Cupos</dt>
              <dd className="font-semibold text-ink">
                {peopleCount} {peopleCount === 1 ? 'persona' : 'personas'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Precio unitario congelado</dt>
              <dd className="font-semibold text-ink">
                {formatCurrency(unitPrice, experience.currency)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-mist pt-3 text-base font-bold text-ink">
              <dt>Total</dt>
              <dd>{formatCurrency(totalAmount, experience.currency)}</dd>
            </div>
          </dl>

          <div className="rounded-xl bg-info-soft p-3.5 text-xs leading-relaxed text-ink">
            <strong>Reglas de cancelación (hora El Salvador):</strong>
            <ul className="mt-1 list-disc pl-4 text-muted">
              <li>≥ 48 h antes: reembolso del 100 %.</li>
              <li>24 h a 48 h antes: reembolso del 50 %.</li>
              <li>&lt; 24 h antes: sin reembolso (cupos liberados).</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Reservation
