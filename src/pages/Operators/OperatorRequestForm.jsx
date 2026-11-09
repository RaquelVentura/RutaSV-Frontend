//solicitud para ser operador 



import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const initialBusiness = {
  name: '',
  service: '',
  area: '',
  address: '',
  phone: '',
  description: '',
}

function getDisplayName(user) {
  return (
    user?.name ||
    [user?.given_name, user?.family_name].filter(Boolean).join(' ') ||
    user?.email ||
    'Mi perfil'
  )
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function validateImage(file) {
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    return 'Selecciona una imagen JPG o PNG.'
  }
  if (file.size > 5 * 1024 * 1024) {
    return 'La imagen no puede superar los 5 MB.'
  }
  return ''
}

function UploadIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15v4h14v-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ErrorMessage({ id, children, className = '' }) {
  if (!children) return null
  return (
    <p className={`-mt-0.5 text-xs leading-5 text-danger ${className}`.trim()} id={id} role="alert">
      {children}
    </p>
  )
}

function TextField({
  id,
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
  className = '',
}) {
  const errorId = `${id}-error`
  return (
    <div className={`relative grid min-w-0 gap-2 ${className}`.trim()}>
    <label className="text-[13px] font-bold text-ink" htmlFor={id}>{label}</label>
      <input
        autoComplete="off"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      className="min-h-12 w-full rounded-xl border border-mist bg-surface px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10 aria-[invalid=true]:border-danger"
        id={id}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      <ErrorMessage id={errorId}>{error}</ErrorMessage>
    </div>
  )
}

function FileUpload({ id, title, hint, file, error, onChange, onRemove }) {
  const errorId = `${id}-error`
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[13px] font-bold text-ink" htmlFor={id}>{title}</label>
        <span className="shrink-0 rounded-full bg-info-soft px-2.5 py-1.5 text-[10px] font-semibold text-brand-dark">Opcional por ahora</span>
      </div>
      <div className="relative">
        <input
          accept="image/jpeg,image/png"
          aria-describedby={error ? errorId : undefined}
          aria-label={title}
          className="peer sr-only"
          id={id}
          onChange={onChange}
          type="file"
        />
        <label
          className={`flex min-h-[126px] cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-2xl border-2 border-dashed border-mist bg-canvas px-3 text-center text-[13px] font-semibold text-brand-dark transition hover:border-brand hover:bg-info-soft peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand${file ? ' justify-start pr-12 text-left' : ' flex-col'}`}
          htmlFor={id}
        >
          {file ? (
            <>
              <img className="h-[76px] w-[76px] shrink-0 rounded-[10px] object-cover" src={file.preview} alt="" />
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-ink">{file.name}</span>
            </>
          ) : (
            <>
              <UploadIcon />
              <span>Selecciona {hint}</span>
              <small className="font-normal text-muted">JPG o PNG · máx. 5 MB</small>
            </>
          )}
        </label>
        {file && (
          <button
            aria-label={`Quitar ${title.toLowerCase()}`}
            className="absolute right-2 top-2 grid h-[26px] w-[26px] place-items-center rounded-full border-0 bg-ink/80 text-lg leading-none text-white"
            onClick={onRemove}
            type="button"
          >
            ×
          </button>
        )}
      </div>
      <ErrorMessage id={errorId}>{error}</ErrorMessage>
    </div>
  )
}

export default function OperatorRequestForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [business, setBusiness] = useState(initialBusiness)
  const [confirmed, setConfirmed] = useState(false)
  const [errors, setErrors] = useState({})
  const [identityPhoto, setIdentityPhoto] = useState(null)
  const [businessPhoto, setBusinessPhoto] = useState(null)
  const [evidencePhotos, setEvidencePhotos] = useState([])
  const [socialLink, setSocialLink] = useState('')
  const [submissionMessage, setSubmissionMessage] = useState('')
  const formRef = useRef(null)
  const shellRef = useRef(null)
  const objectUrls = useRef(new Set())

  const displayName = getDisplayName(user)
  const initials = getInitials(displayName)

  function scrollToForm() {
    shellRef.current?.scrollIntoView?.({ block: 'start' })
  }

  useEffect(
    () => () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
    },
    [],
  )

  function updateBusiness(event) {
    const { name, value } = event.target
    setBusiness((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setSubmissionMessage('')
  }

  function validateBusiness() {
    const nextErrors = {}
    const labels = {
      name: 'Ingresa el nombre del negocio o guía.',
      service: 'Indica el tipo de servicio.',
      area: 'Indica el departamento o zona.',
      address: 'Ingresa una dirección o punto de referencia.',
      phone: 'Ingresa un teléfono de contacto.',
      description: 'Describe el negocio y lo que ofreces.',
    }

    Object.entries(labels).forEach(([key, message]) => {
      if (!business[key].trim()) nextErrors[key] = message
    })
    if (!confirmed) nextErrors.confirmed = 'Confirma que los datos son verídicos.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleNext(event) {
    event.preventDefault()
    setSubmissionMessage('')
    if (!validateBusiness()) {
      formRef.current
        ?.querySelector('[aria-invalid="true"]')
        ?.focus()
      return
    }
    setStep(2)
    setErrors({})
    scrollToForm()
  }

  function navigateToStep(nextStep) {
    setSubmissionMessage('')
    if (nextStep === 2 && step === 1 && !validateBusiness()) {
      formRef.current
        ?.querySelector('[aria-invalid="true"]')
        ?.focus()
      return
    }

    setStep(nextStep)
    setErrors({})
    scrollToForm()
  }

  function createSelectedFile(file) {
    const error = validateImage(file)
    if (error) return { error }
    const preview = URL.createObjectURL(file)
    objectUrls.current.add(preview)
    return { file: { name: file.name, preview }, error: '' }
  }

  function handleSingleFile(event, setter, fieldName) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const selected = createSelectedFile(file)
    if (selected.error) {
      setErrors((current) => ({ ...current, [fieldName]: selected.error }))
      return
    }

    setter(selected.file)
    setErrors((current) => ({ ...current, [fieldName]: '' }))
  }

  function removeSingleFile(file, setter) {
    if (file?.preview) {
      URL.revokeObjectURL(file.preview)
      objectUrls.current.delete(file.preview)
    }
    setter(null)
  }

  function handleEvidenceChange(event) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    const availableSlots = 5 - evidencePhotos.length
    const nextFiles = files.slice(0, availableSlots)
    const nextErrors = []
    const validFiles = []

    nextFiles.forEach((file) => {
      const selected = createSelectedFile(file)
      if (selected.error) {
        nextErrors.push(`${file.name}: ${selected.error}`)
      } else {
        validFiles.push(selected.file)
      }
    })

    if (files.length > availableSlots) {
      nextErrors.push('Puedes adjuntar hasta 5 evidencias.')
    }
    setEvidencePhotos((current) => [...current, ...validFiles])
    setErrors((current) => ({
      ...current,
      evidence: nextErrors.join(' '),
    }))
  }

  function removeEvidence(file) {
    URL.revokeObjectURL(file.preview)
    objectUrls.current.delete(file.preview)
    setEvidencePhotos((current) =>
      current.filter((evidence) => evidence.preview !== file.preview),
    )
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (evidencePhotos.length === 0) {
      setErrors((current) => ({
        ...current,
        evidence: 'Adjunta al menos una imagen de tu actividad.',
      }))
      return
    }
    if (socialLink && !event.currentTarget.elements.socialLink.validity.valid) {
      setErrors((current) => ({
        ...current,
        socialLink: 'Ingresa una URL válida.',
      }))
      event.currentTarget.elements.socialLink.focus()
      return
    }

    setSubmissionMessage(
      'El formulario está completo, pero la solicitud no se envió porque esta vista aún no está conectada al backend.',
    )
  }

  function handleBack() {
    setStep(1)
    setErrors({})
    setSubmissionMessage('')
    scrollToForm()
  }

  return (
    <main className="min-h-screen bg-canvas font-sans text-ink">
      <header className="sticky top-0 z-10 border-b border-mist bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[68px] w-full max-w-[1480px] items-center justify-between gap-4 px-6 max-[620px]:min-h-[62px] max-[620px]:px-4">
          <Link className="text-[25px] font-extrabold tracking-[-0.06em] text-brand" to="/">
            RutaSV
          </Link>
          <div className="flex min-w-0 items-center gap-2 rounded-full bg-info-soft py-1.5 pl-2 pr-3 text-[13px] font-semibold text-brand-dark max-[620px]:gap-1.5 max-[620px]:pr-2 max-[620px]:text-[11px]" aria-label={`Perfil de ${displayName}`}>
            <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-brand text-[10px] text-white" aria-hidden="true">{initials}</span>
            <span className="max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap max-[620px]:max-w-[110px]">{displayName}</span>
            <svg className="h-3.5 w-3.5 shrink-0 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.7]" aria-hidden="true" viewBox="0 0 16 16">
              <path d="m4 6 4 4 4-4" />
            </svg>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1480px] grid-cols-[minmax(270px,320px)_minmax(0,1fr)] items-start gap-[clamp(28px,3.2vw,48px)] px-6 py-[clamp(36px,4vh,52px)] pb-14 max-[900px]:grid-cols-1 max-[900px]:gap-7 max-[900px]:pt-8 max-[620px]:gap-[22px] max-[620px]:px-4 max-[620px]:pt-6">
        <aside className="sticky top-[100px] grid gap-5 max-[900px]:static max-[900px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] max-[900px]:gap-x-7 max-[900px]:gap-y-5 max-[620px]:grid-cols-1 max-[620px]:gap-3" aria-label="Progreso de solicitud">
          <div className="rounded-[18px] border border-mist bg-surface p-[22px] max-[900px]:col-span-full max-[620px]:p-[18px]">
            <p className="m-0 text-xs font-bold tracking-[0.09em] text-brand uppercase">Solicitud de operador</p>
            <h1 className="my-3 text-[clamp(27px,2.7vw,32px)] leading-[1.14] font-extrabold tracking-[-0.045em] text-ink max-[900px]:max-w-[560px] max-[900px]:text-[30px] max-[620px]:my-1.5 max-[620px]:text-[25px]">Únete a RutaSV como operador</h1>
            <p className="m-0 text-sm leading-[1.6] text-muted max-[620px]:text-[13px]">Un administrador revisará tu solicitud en 24–48 horas.</p>
          </div>

          <ol className="m-0 grid list-none gap-2 rounded-[18px] border border-mist bg-surface p-3 max-[620px]:grid-cols-2 max-[620px]:gap-1.5 max-[620px]:p-2">
            {[
              { number: 1, title: 'Datos del negocio', description: 'Información básica y contacto' },
              { number: 2, title: 'Documentos y evidencias', description: 'Verificación de identidad y actividad' },
            ].map(({ number, title, description }) => {
              const isActive = step === number
              const isComplete = step > number
              return (
                <li key={number}>
                  <button
                    aria-current={isActive ? 'step' : undefined}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left font-sans transition hover:bg-canvas max-[620px]:items-center max-[620px]:gap-2 max-[620px]:p-2 ${isActive ? 'border-brand/20 bg-info-soft' : 'border-mist bg-transparent'}`}
                    onClick={() => navigateToStep(number)}
                    type="button"
                  >
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-bold max-[620px]:h-7 max-[620px]:w-7 max-[620px]:basis-7 ${isActive || isComplete ? 'bg-brand text-white' : 'bg-canvas text-muted'}`}>
                      {isComplete ? '✓' : number}
                    </span>
                    <span className="min-w-0">
                      <span className="my-0.5 mb-1 block text-[13px] font-bold text-ink max-[620px]:text-[11px] max-[620px]:leading-tight">{title}</span>
                      <span className="block text-[11px] leading-[1.45] text-muted max-[620px]:hidden">{description}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          <ul className="m-0 grid gap-3.5 rounded-[18px] border border-mist bg-surface p-[18px] text-[13px] text-muted max-[900px]:content-center max-[900px]:gap-3 max-[620px]:grid-cols-2 max-[620px]:gap-x-3 max-[620px]:gap-y-2 max-[620px]:p-3.5 max-[620px]:text-[11px]">
            <li className="flex items-center gap-[11px]">
              <svg className="h-5 w-5 shrink-0 fill-none stroke-brand [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.7] max-[620px]:h-[17px] max-[620px]:w-[17px]" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M12 3 19 6v5c0 4.5-2.9 8-7 10-4.1-2-7-5.5-7-10V6l7-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>Tus documentos son privados.</span>
            </li>
            <li className="flex items-center gap-[11px]">
              <svg className="h-5 w-5 shrink-0 fill-none stroke-brand [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.7] max-[620px]:h-[17px] max-[620px]:w-[17px]" aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span>Toma menos de 5 minutos.</span>
            </li>
            <li className="flex items-center gap-[11px]">
              <svg className="h-5 w-5 shrink-0 fill-none stroke-brand [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.7] max-[620px]:h-[17px] max-[620px]:w-[17px]" aria-hidden="true" viewBox="0 0 24 24">
                <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
                <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
              </svg>
              <span>Aparece ante miles de viajeros.</span>
            </li>
          </ul>
        </aside>

        <section
          className="min-w-0 rounded-[20px] border border-mist bg-surface shadow-[0_10px_30px_rgba(23,52,58,0.05)]"
          aria-labelledby="operator-request-title"
          ref={shellRef}
        >
          <form
            className="grid content-start gap-[clamp(24px,2.5vw,36px)] p-[clamp(30px,3.5vw,48px)] max-[620px]:gap-[22px] max-[620px]:px-[18px] max-[620px]:py-[22px]"
            noValidate
            onSubmit={step === 1 ? handleNext : handleSubmit}
            ref={formRef}
          >
            <div className="flex items-end justify-between gap-6 border-b border-mist pb-[18px] max-[620px]:items-start">
              <div>
                <p className="m-0 text-[11px] font-bold tracking-[0.08em] text-muted uppercase">Paso {step} de 2</p>
                <h2 className="my-1.5 mb-1 text-[clamp(22px,2.5vw,28px)] leading-[1.2] font-extrabold tracking-[-0.04em] text-ink" id="operator-request-title">
                  {step === 1 ? 'Solicita ser operador' : 'Muéstranos lo que haces'}
                </h2>
                <p className="m-0 text-[13px] leading-[1.5] text-muted">
                  {step === 1
                    ? 'Cuéntanos de tu negocio.'
                    : 'Tus documentos son privados y solo los ve el equipo de RutaSV.'}
                </p>
              </div>
              <div className="mb-[5px] h-2 w-36 shrink-0 overflow-hidden rounded-full bg-canvas max-[620px]:mt-[7px] max-[620px]:w-12" aria-label={`Progreso: ${step} de 2 pasos`}>
                <span className="block h-full rounded-full bg-brand transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${step * 50}%` }} />
              </div>
            </div>

            {step === 1 ? (
              <div className="grid grid-cols-2 items-start gap-x-[26px] gap-y-[22px] max-[620px]:grid-cols-1 max-[620px]:gap-[18px]">
                <TextField
                  id="operator-business-name"
                  label="Nombre del negocio / guía"
                  name="name"
                  onChange={updateBusiness}
                  placeholder="Nombre de tu negocio o guía"
                  value={business.name}
                  error={errors.name}
                />
                <TextField
                  id="operator-service"
                  label="Tipo de servicio"
                  name="service"
                  onChange={updateBusiness}
                  placeholder="Ej. Surf y deportes acuáticos"
                  value={business.service}
                  error={errors.service}
                />
                <TextField
                  id="operator-area"
                  label="Departamento / zona"
                  name="area"
                  onChange={updateBusiness}
                  placeholder="Departamento y localidad"
                  value={business.area}
                  error={errors.area}
                />
                <TextField
                  id="operator-address"
                  label="Dirección o punto de encuentro"
                  name="address"
                  onChange={updateBusiness}
                  placeholder="Calle, local o punto de referencia"
                  value={business.address}
                  error={errors.address}
                />
                <TextField
                  className="col-span-full"
                  id="operator-phone"
                  label="Teléfono de contacto"
                  name="phone"
                  onChange={updateBusiness}
                  placeholder="+503 0000 0000"
                  type="tel"
                  value={business.phone}
                  error={errors.phone}
                />
                <div className="relative col-span-full grid min-w-0 gap-2">
                  <label className="text-[13px] font-bold text-ink" htmlFor="operator-description">Describe tu negocio y lo que ofreces</label>
                  <textarea
                    className="min-h-[108px] w-full resize-y rounded-xl border border-mist bg-surface px-3 py-2.5 text-sm leading-[1.5] text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10 aria-[invalid=true]:border-danger"
                    aria-describedby={errors.description ? 'operator-description-error' : undefined}
                    aria-invalid={Boolean(errors.description)}
                    id="operator-description"
                    name="description"
                    onChange={updateBusiness}
                    placeholder="Cuéntanos sobre tu experiencia y los servicios que ofreces."
                    rows="3"
                    value={business.description}
                  />
                  <ErrorMessage id="operator-description-error">{errors.description}</ErrorMessage>
                </div>
                <label className="col-span-full flex items-start gap-2.5 text-[13px] leading-[1.5] text-muted">
                  <input
                    className="mt-px h-[17px] w-[17px] shrink-0 accent-brand"
                    checked={confirmed}
                    onChange={(event) => {
                      setConfirmed(event.target.checked)
                      setErrors((current) => ({ ...current, confirmed: '' }))
                    }}
                    type="checkbox"
                  />
                  <span>Confirmo que los datos del negocio son verídicos.</span>
                </label>
                <ErrorMessage className="col-span-full" id="operator-confirmed-error">{errors.confirmed}</ErrorMessage>
                <div className="col-span-full grid grid-cols-[minmax(160px,0.7fr)_minmax(0,1fr)] items-center gap-3 max-[620px]:grid-cols-1">
                  <button className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-brand bg-brand px-4 font-sans text-sm font-bold text-white transition hover:border-brand-dark hover:bg-brand-dark active:translate-y-px" type="submit">
                    Siguiente
                  </button>
                  <button
                    className="justify-self-start border-0 bg-transparent px-2.5 py-1 text-left text-xs text-brand hover:underline"
                    onClick={() => navigate(-1)}
                    type="button"
                  >
                    Cancelar y volver a mi perfil
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-[26px]">
                <div className="grid grid-cols-2 gap-5 max-[620px]:grid-cols-1 max-[620px]:gap-[18px]">
                  <div className="grid content-start gap-3 rounded-2xl border border-mist bg-canvas p-[18px] max-[620px]:p-3.5">
                    <FileUpload
                      error={errors.identityPhoto}
                      file={identityPhoto}
                      hint="la foto del DUI"
                      id="operator-identity-photo"
                      onChange={(event) =>
                        handleSingleFile(event, setIdentityPhoto, 'identityPhoto')
                      }
                      onRemove={() => removeSingleFile(identityPhoto, setIdentityPhoto)}
                      title="Foto del DUI"
                    />
                    <p className="m-0 text-xs leading-[1.5] text-muted">
                      Solo para verificar tu identidad. Nunca se muestra públicamente.
                    </p>
                  </div>

                  <div className="grid content-start gap-3 rounded-2xl border border-mist bg-canvas p-[18px] max-[620px]:p-3.5">
                    <FileUpload
                      error={errors.businessPhoto}
                      file={businessPhoto}
                      hint="una foto del local"
                      id="operator-business-photo"
                      onChange={(event) =>
                        handleSingleFile(event, setBusinessPhoto, 'businessPhoto')
                      }
                      onRemove={() => removeSingleFile(businessPhoto, setBusinessPhoto)}
                      title="Foto del negocio o servicio"
                    />
                    <p className="m-0 text-xs leading-[1.5] text-muted">
                      Una imagen de tu local, equipo o punto de encuentro.
                    </p>
                  </div>
                </div>

                <div className="relative grid min-w-0 gap-2 rounded-2xl border border-mist bg-canvas p-[18px] max-[620px]:p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[13px] font-bold text-ink" htmlFor="operator-evidence">Evidencias de tu actividad</label>
                    <span className="shrink-0 rounded-full bg-success-soft px-2.5 py-1.5 text-[10px] font-semibold text-success">Obligatorio · mín. 1</span>
                  </div>
                  <p className="m-0 text-xs leading-[1.5] text-muted">
                    Fotos que muestren a qué te dedicas. Ej.: tu bar en servicio, una clase de surf en curso.
                  </p>
                  <input
                    accept="image/jpeg,image/png"
                    aria-label="Adjuntar evidencias de tu actividad"
                    className="peer sr-only"
                    id="operator-evidence"
                    multiple
                    onChange={handleEvidenceChange}
                    type="file"
                  />
                  <div className="grid grid-cols-5 gap-3 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand max-[620px]:grid-cols-3 max-[620px]:gap-[9px]">
                    {evidencePhotos.map((file) => (
                      <div className="relative aspect-square overflow-hidden rounded-[14px] border border-dashed border-mist bg-surface" key={file.preview}>
                        <img className="h-full w-full object-cover" src={file.preview} alt={`Evidencia: ${file.name}`} />
                        <button
                          aria-label={`Quitar evidencia ${file.name}`}
                          className="absolute right-[7px] top-[7px] grid h-6 w-6 place-items-center rounded-full border-0 bg-ink/80 text-lg leading-none text-white"
                          onClick={() => removeEvidence(file)}
                          type="button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {evidencePhotos.length < 5 && (
                      <label className="grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-[14px] border border-dashed border-mist bg-surface text-[30px] text-brand-dark transition hover:border-brand hover:bg-info-soft" htmlFor="operator-evidence">
                        <span aria-hidden="true">+</span>
                        <span className="sr-only">Agregar evidencia</span>
                      </label>
                    )}
                  </div>
                  <p className="mt-2 mb-0 text-[11px] text-muted">
                    {evidencePhotos.length} de 5 imágenes ·{' '}
                    {evidencePhotos.length > 0 ? 'ya cumples el mínimo' : 'adjunta al menos una'}
                  </p>
                  <ErrorMessage id="operator-evidence-error">{errors.evidence}</ErrorMessage>
                </div>

                <div className="relative grid min-w-0 gap-2.5 rounded-2xl border border-mist bg-canvas p-[18px] max-[620px]:p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[13px] font-bold text-ink" htmlFor="operator-social-link">Enlace a redes o sitio web</label>
                    <span className="shrink-0 rounded-full bg-info-soft px-2.5 py-1.5 text-[10px] font-semibold text-brand-dark">Opcional</span>
                  </div>
                  <input
                    className="min-h-12 w-full rounded-xl border border-mist bg-surface px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10 aria-[invalid=true]:border-danger"
                    aria-describedby={errors.socialLink ? 'operator-social-link-error' : undefined}
                    aria-invalid={Boolean(errors.socialLink)}
                    id="operator-social-link"
                    name="socialLink"
                    onChange={(event) => {
                      setSocialLink(event.target.value)
                      setErrors((current) => ({ ...current, socialLink: '' }))
                      setSubmissionMessage('')
                    }}
                    placeholder="https://instagram.com/tu-negocio"
                    type="url"
                    value={socialLink}
                  />
                  <ErrorMessage id="operator-social-link-error">
                    {errors.socialLink}
                  </ErrorMessage>
                </div>

                <p className="m-0 rounded-xl border border-brand/15 bg-info-soft px-[18px] py-[15px] text-[13px] leading-[1.5] text-brand-dark">
                  Tus archivos se guardan de forma privada. Solo el equipo administrador puede
                  verlos.
                </p>
                {submissionMessage && (
                  <p className="m-0 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-[13px] leading-[1.5] text-amber-900" role="status">
                    {submissionMessage}
                  </p>
                )}
                <div className="grid grid-cols-[minmax(0,1fr)_140px] gap-2.5 border-t border-mist pt-2 max-[620px]:grid-cols-1">
                  <button className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-brand bg-brand px-4 font-sans text-sm font-bold text-white transition hover:border-brand-dark hover:bg-brand-dark active:translate-y-px" type="submit">
                    Enviar solicitud
                  </button>
                  <button className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-mist bg-surface px-4 font-sans text-sm font-bold text-ink transition hover:border-slate-300 hover:bg-canvas active:translate-y-px" onClick={handleBack} type="button">
                    Atrás
                  </button>
                </div>
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  )
}
