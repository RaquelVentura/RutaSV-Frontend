

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';



const inputClass =
  'w-full rounded-xl border bg-white px-3.5 py-3.5 text-[14px] text-[#102F3B] outline-none placeholder:text-[#637780] focus:border-[#087E9A]';
const cardInputClass =
  'w-full rounded-[10px] border bg-white px-3.5 py-3 text-[14px] text-[#102F3B] outline-none placeholder:text-[#637780] focus:border-[#087E9A]';

const steps = [
  { id: 1, label: 'Experiencia elegida', state: 'done' },
  { id: 2, label: 'Datos y pago', state: 'current' },
  { id: 3, label: 'Tu reserva', state: 'pending' },
];

const onlyDigits = (value) => value.replace(/\D/g, '');
const formatCardNumber = (value) => onlyDigits(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
const formatExpiry = (value) => {
  const digits = onlyDigits(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
};

function Field({ id, label, error, hint, small = false, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={`${small ? 'text-[13px]' : 'text-[14px]'} font-semibold text-[#102F3B]`}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-[12px] text-[#637780]">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-[12px] font-medium text-[#B42318]">
          {error}
        </p>
      )}
    </div>
  );
}

function StepIndicator() {
  return (
    <ol className="flex items-center gap-3 sm:gap-4" aria-label="Pasos de la reserva">
      {steps.map((step, index) => (
        <li key={step.id} className={`flex items-center gap-3 sm:gap-4 ${index > 0 ? 'flex-1' : ''}`}>
          {index > 0 && (
            <span className={`h-0.5 flex-1 ${steps[index - 1].state === 'done' ? 'bg-[#087E9A]' : 'bg-[#C9D8DE]'}`} />
          )}
          <span className="flex items-center gap-2.5" aria-current={step.state === 'current' ? 'step' : undefined}>
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${
                step.state === 'done'
                  ? 'border-2 border-[#087E9A] text-[#087E9A]'
                  : step.state === 'current'
                    ? 'bg-[#087E9A] text-white'
                    : 'bg-[#E1EBEF] text-[#637780]'
              }`}
            >
              {step.state === 'done' ? '✓' : step.id}
            </span>
            <span
              className={`whitespace-nowrap text-[14px] ${
                step.state === 'current' ? 'inline font-semibold text-[#087E9A]' : 'hidden sm:inline'
              } ${step.state === 'done' ? 'font-semibold text-[#102F3B]' : ''} ${step.state === 'pending' ? 'font-medium text-[#637780]' : ''}`}
            >
              {step.label}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

 function Reservation() {
  const navigate = useNavigate();
  const booking = defaultBooking;
  const { experience, people } = booking;

  const [contact, setContact] = useState({ name: '', email: '', phone: '', message: '' });
  const [method, setMethod] = useState('card');
  const [card, setCard] = useState({ number: '', holder: '', expiry: '', cvv: '' });
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState({});

  const subtotal = experience.price * people;
  const total = subtotal;

  const updateContact = (field) => (event) => setContact((prev) => ({ ...prev, [field]: event.target.value }));
  const updateCard = (field, format) => (event) =>
    setCard((prev) => ({ ...prev, [field]: format ? format(event.target.value) : event.target.value }));

  const validate = () => {
    const next = {};
    if (!contact.name.trim()) next.name = 'Escribe tu nombre completo.';
    if (!/^\S+@\S+\.\S+$/.test(contact.email)) next.email = 'Ingresa un correo válido.';
    if (onlyDigits(contact.phone).length < 8) next.phone = 'Ingresa un teléfono de al menos 8 dígitos.';
    if (method === 'card') {
      if (onlyDigits(card.number).length < 13) next.number = 'Número de tarjeta incompleto.';
      if (!card.holder.trim()) next.holder = 'Escribe el nombre del titular.';
      if (onlyDigits(card.expiry).length !== 4) next.expiry = 'Usa el formato MM / AA.';
      if (onlyDigits(card.cvv).length < 3) next.cvv = 'Código inválido.';
    }
    if (!accepted) next.accepted = 'Debes aceptar las condiciones para continuar.';
    return next;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const firstId = Object.keys(next)[0];
      document.getElementById(firstId === 'accepted' ? 'accepted' : `field-${firstId}`)?.focus();
      return;
    }
    // Aún no hay endpoint de reservas: se pasa la información a la confirmación por estado de navegación.
    navigate('/turista/reservar/confirmacion', {
      state: { booking: { ...booking, contactName: contact.name, contactEmail: contact.email } },
    });
  };

  const borderFor = (key) => (errors[key] ? 'border-[#B42318]' : 'border-[#DFE8EB]');
  const cardBorderFor = (key) => (errors[key] ? 'border-[#B42318]' : 'border-[#D7E3E8]');

  return (
    <Container className="flex flex-col gap-6 py-8">
      <Link to="/turista/explorar" className="text-[13px] text-[#087E9A] hover:underline">
        ← Volver a la experiencia
      </Link>

      <StepIndicator />

      <header className="flex flex-col gap-3">
        <p className="text-[12px] font-bold uppercase leading-[1.45] text-[#087E9A]">Ya casi sientes la brisa</p>
        <h1 className="text-[26px] font-bold leading-[1.2] text-[#102F3B] sm:text-[30px]">Confirma tu próxima aventura</h1>
        <p className="text-[16px] leading-[1.45] text-[#637780]">
          Revisa tu plan, cuéntanos cómo contactarte y elige cómo pagar.
        </p>
      </header>

      <form noValidate onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-xl border border-[#DFE8EB] bg-white p-5">
            <h2 className="text-[22px] font-bold leading-[1.2] text-[#102F3B] sm:text-2xl">Datos de contacto</h2>
            <p className="text-[13px] leading-[1.45] text-[#637780]">
              Aquí recibirás la confirmación y los detalles del encuentro.
            </p>
            <Field id="field-name" label="Nombre completo" error={errors.name}>
              <input id="field-name" autoComplete="name" value={contact.name} onChange={updateContact('name')} placeholder="Ana López" aria-invalid={Boolean(errors.name)} className={`${inputClass} ${borderFor('name')}`} />
            </Field>
            <Field id="field-email" label="Correo electrónico" error={errors.email}>
              <input id="field-email" type="email" autoComplete="email" value={contact.email} onChange={updateContact('email')} placeholder="ana.lopez@correo.com" aria-invalid={Boolean(errors.email)} className={`${inputClass} ${borderFor('email')}`} />
            </Field>
            <Field id="field-phone" label="Teléfono" error={errors.phone}>
              <input id="field-phone" type="tel" autoComplete="tel" value={contact.phone} onChange={updateContact('phone')} placeholder="+503 7123 4567" aria-invalid={Boolean(errors.phone)} className={`${inputClass} ${borderFor('phone')}`} />
            </Field>
            <Field id="field-message" label="Mensaje al operador (opcional)">
              <textarea id="field-message" rows={4} value={contact.message} onChange={updateContact('message')} placeholder="Es nuestra primera clase de surf. ¡Nos emociona conocer El Tunco!" className={`${inputClass} min-h-[112px] resize-y border-[#DFE8EB]`} />
            </Field>
          </section>

          <fieldset className="flex flex-col gap-3.5 rounded-xl border border-[#DFE8EB] bg-white p-5">
            <legend className="sr-only">Método de pago</legend>
            <h2 className="text-[22px] font-extrabold leading-[normal] text-[#102F3B]">Método de pago</h2>
            <p className="text-[13px] text-[#637780]">
              Elige cómo quieres pagar. Verás solo los datos del método seleccionado.
            </p>

            {paymentMethods.map((option) => {
              const selected = method === option.id;
              return (
                <div
                  key={option.id}
                  className={`overflow-hidden rounded-[14px] ${selected ? 'border-2 border-[#087E9A] bg-[#EAF6F9]' : 'border border-[#D7E3E8] bg-white'}`}
                >
                  <label className="flex cursor-pointer items-center gap-3.5 px-[18px] py-4">
                    <input type="radio" name="metodo-pago" value={option.id} checked={selected} onChange={() => setMethod(option.id)} className="peer sr-only" />
                    <span
                      aria-hidden="true"
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-[#087E9A] ${selected ? 'bg-[#087E9A]' : 'border-[1.5px] border-[#D7E3E8] bg-white'}`}
                    >
                      {selected && <span className="size-2 rounded-full bg-white" />}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-[15px] font-bold text-[#102F3B]">{option.title}</span>
                      <span className="text-[13px] text-[#637780]">{option.description}</span>
                    </span>
                    <span className="hidden gap-2 sm:flex">
                      {option.brands.map((brand) => (
                        <span key={brand} className="whitespace-nowrap rounded-full border border-[#D7E3E8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#637780]">
                          {brand}
                        </span>
                      ))}
                    </span>
                  </label>

                  {option.id === 'card' && selected && (
                    <div className="px-[18px] pb-[18px]">
                      <div className="flex flex-col gap-3.5 rounded-xl border border-[#D7E3E8] bg-white p-4">
                        <Field small id="field-number" label="Número de tarjeta" error={errors.number}>
                          <input id="field-number" inputMode="numeric" autoComplete="cc-number" value={card.number} onChange={updateCard('number', formatCardNumber)} placeholder="4242 4242 4242 4242" className={`${cardInputClass} ${cardBorderFor('number')}`} />
                        </Field>
                        <Field small id="field-holder" label="Nombre del titular" error={errors.holder}>
                          <input id="field-holder" autoComplete="cc-name" value={card.holder} onChange={updateCard('holder')} placeholder="ANA LÓPEZ" className={`${cardInputClass} uppercase ${cardBorderFor('holder')}`} />
                        </Field>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field small id="field-expiry" label="Vencimiento" error={errors.expiry}>
                            <input id="field-expiry" inputMode="numeric" autoComplete="cc-exp" value={card.expiry} onChange={updateCard('expiry', formatExpiry)} placeholder="MM / AA" className={`${cardInputClass} ${cardBorderFor('expiry')}`} />
                          </Field>
                          <Field small id="field-cvv" label="Código de seguridad (CVV)" error={errors.cvv}>
                            <input id="field-cvv" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={card.cvv} onChange={updateCard('cvv', (v) => onlyDigits(v).slice(0, 4))} placeholder="123" className={`${cardInputClass} ${cardBorderFor('cvv')}`} />
                          </Field>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </fieldset>
        </div>

        <aside className="flex flex-col gap-4 rounded-xl border border-[#DFE8EB] bg-white p-5 lg:sticky lg:top-6">
          <img src={experience.image} alt="" className="h-[210px] w-full rounded-xl object-cover" />
          <h2 className="text-[23px] font-bold leading-[1.2] text-[#102F3B]">{experience.title}</h2>
          <p className="text-[13px] leading-[1.45] text-[#637780]">
            {experience.location} · ★ {experience.rating.toFixed(1)} ({experience.reviews} reseñas)
          </p>
          <hr className="border-[#DFE8EB]" />
          <div className="flex flex-col gap-3 text-[14px] leading-[1.45] text-[#102F3B]">
            <p className="font-semibold">Tu plan</p>
            <p>{booking.date}</p>
            <p>
              {booking.time} · {people} personas
            </p>
            <p className="text-[13px] text-[#637780]">Operador: {experience.operator}</p>
          </div>
          <hr className="border-[#DFE8EB]" />
          <dl className="flex flex-col gap-4 text-[14px] text-[#102F3B]">
            <div className="flex justify-between gap-4">
              <dt>
                {formatUsd(experience.price)} × {people} personas
              </dt>
              <dd>{formatUsd(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Cargo por servicio</dt>
              <dd>{formatUsd(0)}</dd>
            </div>
            <hr className="border-[#DFE8EB]" />
            <div className="flex justify-between gap-4 text-[21px] font-bold leading-[1.2]">
              <dt>Total</dt>
              <dd>{formatUsd(total)} USD</dd>
            </div>
          </dl>
          <div className="flex flex-col gap-3 border-t border-[#D7E3E8] pt-4">
            <h3 className="text-[16px] font-bold leading-[1.2] text-[#102F3B]">Reserva con tranquilidad</h3>
            <p className="text-[14px] leading-[1.45] text-[#637780]">
              Cancelación gratuita hasta el {booking.freeCancelUntil}. Después de ese momento, consulta las condiciones con el operador.
            </p>
            <label className="flex items-start gap-2 text-[14px] leading-[1.45] text-[#102F3B]">
              <input id="accepted" type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 size-4 accent-[#087E9A]" />
              <span>Acepto las condiciones de la experiencia y los Términos de RutaSV.</span>
            </label>
            {errors.accepted && (
              <p role="alert" className="text-[12px] font-medium text-[#B42318]">
                {errors.accepted}
              </p>
            )}
            <button type="submit" className="min-h-[50px] w-full rounded-xl bg-[#087E9A] px-3 py-2.5 text-[15px] font-semibold text-white hover:bg-cyan-800">
              Pagar y confirmar reserva
            </button>
          </div>
          <p className="text-[11px] leading-[1.45] text-[#637780]">Referencia: {booking.reference}</p>
        </aside>
      </form>
    </Container>
  );
}
export default Reservation