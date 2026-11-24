import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { createWebReservation } from '../../lib/bookingApi.js'
import { extractApiError, resolveAssetUrl } from '../../lib/catalogApi.js'
import { formatCurrency, formatDateReadable } from '../../lib/formatters.js'
import { notify } from '../../lib/notify.js'

const inputClass =
  'w-full rounded-xl border bg-white px-3.5 py-3.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand'
const cardInputClass =
  'w-full rounded-[10px] border bg-white px-3.5 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-brand'

const steps = [
  { id: 1, label: 'Experiencia elegida', state: 'done' },
  { id: 2, label: 'Datos y pago', state: 'current' },
  { id: 3, label: 'Tu reserva', state: 'pending' },
]

// Métodos que acepta la API (pago simulado).
const paymentOptions = [
  {
    id: 'PAYPAL_DEMO',
    title: 'PayPal',
    description: 'Paga con tu cuenta de PayPal.',
    brands: ['PayPal'],
  },
  {
    id: 'TARJETA_DEMO',
    title: 'Tarjeta de crédito o débito',
    description: 'Paga con Visa o Mastercard. Pago simulado: no se cobra ni se guarda la tarjeta.',
    brands: ['VISA', 'Mastercard'],
  },
  {
    id: 'APPLE_PAY_DEMO',
    title: 'Apple Pay',
    description: 'Paga con Apple Pay en un toque.',
    brands: ['Apple Pay'],
  },
  {
    id: 'GOOGLE_PAY_DEMO',
    title: 'Google Pay',
    description: 'Paga con tu cuenta de Google en un toque.',
    brands: ['Google Pay'],
  },
  {
    id: 'TRANSFERENCIA_DEMO',
    title: 'Transferencia inmediata',
    description: 'Validación instantánea simulada de la transferencia.',
    brands: ['Transferencia'],
  },
]

const onlyDigits = (value) => value.replace(/\D/g, '')
const formatCardNumber = (value) => onlyDigits(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
const formatExpiry = (value) => {
  const digits = onlyDigits(value).slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

function Field({ id, label, error, hint, small = false, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={`${small ? 'text-[13px]' : 'text-sm'} font-semibold text-ink`}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

function StepIndicator() {
  return (
    <ol className="flex items-center gap-3 sm:gap-4" aria-label="Pasos de la reserva">
      {steps.map((step, index) => (
        <li key={step.id} className={`flex items-center gap-3 sm:gap-4 ${index > 0 ? 'flex-1' : ''}`}>
          {index > 0 && (
            <span className={`h-0.5 flex-1 ${steps[index - 1].state === 'done' ? 'bg-brand' : 'bg-mist'}`} />
          )}
          <span className="flex items-center gap-2.5" aria-current={step.state === 'current' ? 'step' : undefined}>
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                step.state === 'done'
                  ? 'border-2 border-brand text-brand'
                  : step.state === 'current'
                    ? 'bg-brand text-white'
                    : 'bg-mist text-muted'
              }`}
            >
              {step.state === 'done' ? '✓' : step.id}
            </span>
            <span
              className={`whitespace-nowrap text-sm ${
                step.state === 'current' ? 'inline font-semibold text-brand' : 'hidden sm:inline'
              } ${step.state === 'done' ? 'font-semibold text-ink' : ''} ${step.state === 'pending' ? 'font-medium text-muted' : ''}`}
            >
              {step.label}
            </span>
          </span>
        </li>
      ))}
    </ol>
  )
}

function Reservation() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const bookingState = location.state || {}
  const experience = bookingState.experience || null
  const availability = bookingState.availability || null
  const peopleCount = Number(bookingState.peopleCount ?? 1)

  const initialName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || ''
  const [contact, setContact] = useState({
    name: initialName,
    email: user?.email || '',
    phone: '',
    message: '',
  })
  const [method, setMethod] = useState('')
  const [card, setCard] = useState({ number: '', holder: initialName, expiry: '', cvv: '' })
  const [accepted, setAccepted] = useState(false)
  const [errors, setErrors] = useState({})
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
  const currency = experience.currency

  const updateContact = (field) => (event) => setContact((prev) => ({ ...prev, [field]: event.target.value }))
  const updateCard = (field, format) => (event) =>
    setCard((prev) => ({ ...prev, [field]: format ? format(event.target.value) : event.target.value }))

  function validate() {
    const next = {}
    if (!contact.name.trim()) next.name = 'Escribe tu nombre completo.'
    if (!/^\S+@\S+\.\S+$/.test(contact.email)) next.email = 'Ingresa un correo válido.'
    if (contact.phone.trim() && onlyDigits(contact.phone).length < 8) {
      next.phone = 'Ingresa un teléfono de al menos 8 dígitos.'
    }
    if (!method) next.method = 'Elige un método de pago.'
    if (method === 'TARJETA_DEMO') {
      if (onlyDigits(card.number).length < 12) next.number = 'Número de tarjeta incompleto.'
      if (!card.holder.trim()) next.holder = 'Escribe el nombre del titular.'
      if (!/^\d{2}\/\d{2}$/.test(card.expiry.trim())) next.expiry = 'Usa el formato MM/AA.'
      if (!/^\d{3,4}$/.test(card.cvv.trim())) next.cvv = 'Código inválido.'
    }
    if (!accepted) next.accepted = 'Debes aceptar las condiciones para continuar.'
    return next
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorBanner('')
    setNeedsVerification(false)

    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      const firstId = Object.keys(found)[0]
      document
        .getElementById(firstId === 'accepted' ? 'accepted' : firstId === 'method' ? 'payment-options' : `field-${firstId}`)
        ?.focus()
      return
    }

    setSubmitting(true)
    try {
      const created = await createWebReservation({
        experienceId: experience.id,
        availabilityId: availability.id,
        peopleCount,
        contactName: contact.name.trim(),
        contactEmail: contact.email.trim(),
        contactPhone: contact.phone.trim() || null,
        specialNotes: contact.message.trim() || null,
        paymentMethod: method,
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

  const borderFor = (key) => (errors[key] ? 'border-danger' : 'border-mist')

  const coverUrl =
    resolveAssetUrl(experience.images?.[0]?.url || experience.coverImageUrl) ||
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=70'

  return (
    <div className="w-full space-y-6 px-6 py-8">
      <Link to={`/experiencias/${experience.slug}`} className="text-sm text-brand hover:underline">
        ← Volver a la experiencia
      </Link>

      <StepIndicator />

      <header className="space-y-3">
        <p className="text-xs font-bold uppercase text-brand">Ya casi sientes la brisa</p>
        <h1 className="text-[26px] font-bold leading-tight text-ink sm:text-3xl">Confirma tu próxima aventura</h1>
        <p className="text-base text-muted">
          Revisa tu plan, cuéntanos cómo contactarte y elige cómo pagar.
        </p>
      </header>

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

      <form noValidate onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-xl border border-mist bg-surface p-5">
            <h2 className="text-2xl font-bold leading-tight text-ink">Datos de contacto</h2>
            <p className="text-[13px] text-muted">Aquí recibirás la confirmación y los detalles del encuentro.</p>
            <Field id="field-name" label="Nombre completo" error={errors.name}>
              <input id="field-name" autoComplete="name" value={contact.name} onChange={updateContact('name')} placeholder="Escribe tu nombre completo" aria-invalid={Boolean(errors.name)} className={`${inputClass} ${borderFor('name')}`} />
            </Field>
            <Field id="field-email" label="Correo electrónico" error={errors.email} hint="Aquí te enviamos el comprobante.">
              <input id="field-email" type="email" autoComplete="email" value={contact.email} onChange={updateContact('email')} placeholder="nombre@correo.com" aria-invalid={Boolean(errors.email)} className={`${inputClass} ${borderFor('email')}`} />
            </Field>
            <Field id="field-phone" label="Teléfono / WhatsApp (opcional)" error={errors.phone}>
              <input id="field-phone" type="tel" autoComplete="tel" value={contact.phone} onChange={updateContact('phone')} placeholder="+503 7000 0000" aria-invalid={Boolean(errors.phone)} className={`${inputClass} ${borderFor('phone')}`} />
            </Field>
            <Field id="field-message" label="Mensaje al operador (opcional)">
              <textarea id="field-message" rows={4} value={contact.message} onChange={updateContact('message')} placeholder="Alergias, equipo, es nuestra primera vez…" className={`${inputClass} min-h-[112px] resize-y border-mist`} />
            </Field>
          </section>

          <fieldset className="flex flex-col gap-3.5 rounded-xl border border-mist bg-surface p-5">
            <legend className="sr-only">Método de pago</legend>
            <h2 className="text-[22px] font-extrabold text-ink">Método de pago</h2>
            <p className="text-[13px] text-muted">
              Elige cómo quieres pagar. Es un pago simulado: se registra como <strong>PAGADO_DEMO</strong> sin cargos reales.
            </p>

            {errors.method && (
              <p id="payment-options" tabIndex={-1} role="alert" className="text-xs font-medium text-danger">
                {errors.method}
              </p>
            )}

            {paymentOptions.map((option) => {
              const selected = method === option.id
              return (
                <div
                  key={option.id}
                  className={`overflow-hidden rounded-[14px] ${selected ? 'border-2 border-brand bg-info-soft' : 'border border-mist bg-surface'}`}
                >
                  <label className="flex cursor-pointer items-center gap-3.5 px-[18px] py-4">
                    <input type="radio" name="metodo-pago" value={option.id} checked={selected} onChange={() => setMethod(option.id)} className="peer sr-only" />
                    <span
                      aria-hidden="true"
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-brand ${selected ? 'bg-brand' : 'border-[1.5px] border-mist bg-white'}`}
                    >
                      {selected && <span className="size-2 rounded-full bg-white" />}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-[15px] font-bold text-ink">{option.title}</span>
                      <span className="text-[13px] text-muted">{option.description}</span>
                    </span>
                    <span className="hidden gap-2 sm:flex">
                      {option.brands.map((brand) => (
                        <span key={brand} className="whitespace-nowrap rounded-full border border-mist bg-white px-2.5 py-1 text-[11px] font-semibold text-muted">
                          {brand}
                        </span>
                      ))}
                    </span>
                  </label>

                  {option.id === 'TARJETA_DEMO' && selected && (
                    <div className="px-[18px] pb-[18px]">
                      <div className="flex flex-col gap-3.5 rounded-xl border border-mist bg-white p-4">
                        <Field small id="field-number" label="Número de tarjeta" error={errors.number}>
                          <input id="field-number" inputMode="numeric" autoComplete="cc-number" value={card.number} onChange={updateCard('number', formatCardNumber)} placeholder="4242 4242 4242 4242" className={`${cardInputClass} ${borderFor('number')}`} />
                        </Field>
                        <Field small id="field-holder" label="Nombre del titular" error={errors.holder}>
                          <input id="field-holder" autoComplete="cc-name" value={card.holder} onChange={updateCard('holder')} placeholder="ANA LÓPEZ" className={`${cardInputClass} uppercase ${borderFor('holder')}`} />
                        </Field>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field small id="field-expiry" label="Vencimiento (MM/AA)" error={errors.expiry}>
                            <input id="field-expiry" inputMode="numeric" autoComplete="cc-exp" value={card.expiry} onChange={updateCard('expiry', formatExpiry)} placeholder="12/28" className={`${cardInputClass} ${borderFor('expiry')}`} />
                          </Field>
                          <Field small id="field-cvv" label="Código de seguridad (CVV)" error={errors.cvv}>
                            <input id="field-cvv" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={card.cvv} onChange={updateCard('cvv', (v) => onlyDigits(v).slice(0, 4))} placeholder="123" className={`${cardInputClass} ${borderFor('cvv')}`} />
                          </Field>
                        </div>
                      </div>
                    </div>
                  )}

                  {option.id !== 'TARJETA_DEMO' && selected && (
                    <p className="px-[18px] pb-[18px] text-xs text-muted">
                      Al confirmar, el sistema simulará el pago con {option.title} y emitirá tu comprobante por correo electrónico. No se cobra dinero real.
                    </p>
                  )}
                </div>
              )
            })}
          </fieldset>
        </div>

        <aside className="flex flex-col gap-4 rounded-xl border border-mist bg-surface p-5 lg:sticky lg:top-6">
          <img src={coverUrl} alt="" className="h-[210px] w-full rounded-xl object-cover" />
          <div>
            <p className="text-xs font-semibold uppercase text-brand">Resumen de tu reserva</p>
            <h2 className="mt-1 text-[23px] font-bold leading-tight text-ink">{experience.title}</h2>
            <p className="mt-1 text-[13px] text-muted">
              {experience.municipalityName}, {experience.departmentName}
            </p>
          </div>
          <hr className="border-mist" />
          <div className="flex flex-col gap-1.5 text-sm text-ink">
            <p className="font-semibold">Tu plan</p>
            <p>{formatDateReadable(availability.date)}</p>
            <p>
              {availability.startTime}
              {availability.endTime ? ` – ${availability.endTime}` : ''} · {peopleCount}{' '}
              {peopleCount === 1 ? 'persona' : 'personas'}
            </p>
          </div>
          <hr className="border-mist" />
          <dl className="flex flex-col gap-3 text-sm text-ink">
            <div className="flex justify-between gap-4">
              <dt>
                {formatCurrency(unitPrice, currency)} × {peopleCount} {peopleCount === 1 ? 'persona' : 'personas'}
              </dt>
              <dd>{formatCurrency(totalAmount, currency)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Cargo por servicio</dt>
              <dd>{formatCurrency(0, currency)}</dd>
            </div>
            <hr className="border-mist" />
            <div className="flex justify-between gap-4 text-xl font-bold">
              <dt>Total</dt>
              <dd>{formatCurrency(totalAmount, currency)} USD</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-3 border-t border-mist pt-4">
            <h3 className="text-base font-bold text-ink">Reserva con tranquilidad</h3>
            <div className="rounded-xl bg-info-soft p-3.5 text-xs leading-relaxed text-ink">
              <strong>Reglas de cancelación (hora El Salvador):</strong>
              <ul className="mt-1 list-disc pl-4 text-muted">
                <li>48 h o más antes: reembolso del 100 %.</li>
                <li>De 24 h a menos de 48 h antes: reembolso del 50 %.</li>
                <li>Menos de 24 h antes: sin reembolso (cupos liberados).</li>
              </ul>
            </div>
            <label className="flex items-start gap-2 text-sm text-ink">
              <input id="accepted" type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 size-4 accent-brand" />
              <span>Acepto las condiciones de la experiencia y los Términos de RutaSV.</span>
            </label>
            {errors.accepted && (
              <p role="alert" className="text-xs font-medium text-danger">
                {errors.accepted}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[50px] w-full rounded-xl bg-brand px-3 py-2.5 text-[15px] font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {submitting ? 'Procesando reserva…' : `Pagar y confirmar reserva · ${formatCurrency(totalAmount, currency)}`}
            </button>
          </div>
        </aside>
      </form>
    </div>
  )
}

export default Reservation
