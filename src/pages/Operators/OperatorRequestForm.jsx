import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import './OperatorRequestForm.css'

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
      className="operator-request__upload-icon"
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

function ErrorMessage({ id, children }) {
  if (!children) return null
  return (
    <p className="operator-request__error" id={id} role="alert">
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
    <div className={`operator-request__field ${className}`.trim()}>
      <label htmlFor={id}>{label}</label>
      <input
        autoComplete="off"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
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
    <div className="operator-request__field">
      <div className="operator-request__upload-heading">
        <label htmlFor={id}>{title}</label>
        <span className="operator-request__optional">Opcional por ahora</span>
      </div>
      <input
        accept="image/jpeg,image/png"
        aria-describedby={error ? errorId : undefined}
        aria-label={title}
        className="operator-request__file-input"
        id={id}
        onChange={onChange}
        type="file"
      />
      <div className="operator-request__file-control">
        <label
          className={`operator-request__dropzone${file ? ' has-file' : ''}`}
          htmlFor={id}
        >
          {file ? (
            <>
              <img className="operator-request__file-preview" src={file.preview} alt="" />
              <span className="operator-request__file-name">{file.name}</span>
            </>
          ) : (
            <>
              <UploadIcon />
              <span>Selecciona {hint}</span>
              <small>JPG o PNG · máx. 5 MB</small>
            </>
          )}
        </label>
        {file && (
          <button
            aria-label={`Quitar ${title.toLowerCase()}`}
            className="operator-request__remove-file"
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
    <main className="operator-request">
      <header className="operator-request__header">
        <div className="operator-request__header-inner">
          <Link className="operator-request__brand" to="/">
            RutaSV
          </Link>
          <div className="operator-request__profile" aria-label={`Perfil de ${displayName}`}>
            <span aria-hidden="true">{initials}</span>
            <span>{displayName}</span>
            <svg aria-hidden="true" viewBox="0 0 16 16">
              <path d="m4 6 4 4 4-4" />
            </svg>
          </div>
        </div>
      </header>

      <div className="operator-request__layout">
        <aside className="operator-request__sidebar" aria-label="Progreso de solicitud">
          <div className="operator-request__sidebar-intro">
            <p className="operator-request__eyebrow">Solicitud de operador</p>
            <h1>Únete a RutaSV como operador</h1>
            <p>Un administrador revisará tu solicitud en 24–48 horas.</p>
          </div>

          <ol className="operator-request__steps">
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
                    className={`operator-request__step-link${isActive ? ' is-active' : ''}`}
                    onClick={() => navigateToStep(number)}
                    type="button"
                  >
                    <span className={`operator-request__step-number${isActive || isComplete ? ' is-current' : ''}`}>
                      {isComplete ? '✓' : number}
                    </span>
                    <span>
                      <span className="operator-request__step-title">{title}</span>
                      <span className="operator-request__step-description">{description}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          <ul className="operator-request__benefits">
            <li>
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M12 3 19 6v5c0 4.5-2.9 8-7 10-4.1-2-7-5.5-7-10V6l7-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>Tus documentos son privados.</span>
            </li>
            <li>
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span>Toma menos de 5 minutos.</span>
            </li>
            <li>
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
                <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
              </svg>
              <span>Aparece ante miles de viajeros.</span>
            </li>
          </ul>
        </aside>

        <section
          className="operator-request__panel"
          aria-labelledby="operator-request-title"
          ref={shellRef}
        >
          <form
            className="operator-request__content"
            noValidate
            onSubmit={step === 1 ? handleNext : handleSubmit}
            ref={formRef}
          >
            <div className="operator-request__form-heading">
              <div>
                <p className="operator-request__step">Paso {step} de 2</p>
                <h2 id="operator-request-title">
                  {step === 1 ? 'Solicita ser operador' : 'Muéstranos lo que haces'}
                </h2>
                <p className="operator-request__intro">
                  {step === 1
                    ? 'Cuéntanos de tu negocio.'
                    : 'Tus documentos son privados y solo los ve el equipo de RutaSV.'}
                </p>
              </div>
              <div className="operator-request__progress" aria-label={`Progreso: ${step} de 2 pasos`}>
                <span style={{ width: `${step * 50}%` }} />
              </div>
            </div>

            {step === 1 ? (
              <div className="operator-request__step-fields">
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
                  id="operator-phone"
                  label="Teléfono de contacto"
                  name="phone"
                  onChange={updateBusiness}
                  placeholder="+503 0000 0000"
                  type="tel"
                  value={business.phone}
                  error={errors.phone}
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
                  className="operator-request__field--full"
                  id="operator-address"
                  label="Dirección o punto de referencia"
                  name="address"
                  onChange={updateBusiness}
                  placeholder="Dirección de tu negocio"
                  value={business.address}
                  error={errors.address}
                />
                <div className="operator-request__field operator-request__field--full">
                  <label htmlFor="operator-description">Describe tu negocio y lo que ofreces</label>
                  <textarea
                    aria-describedby={errors.description ? 'operator-description-error' : undefined}
                    aria-invalid={Boolean(errors.description)}
                    id="operator-description"
                    name="description"
                    onChange={updateBusiness}
                    placeholder="Cuéntanos sobre tu experiencia y los servicios que ofreces."
                    rows="4"
                    value={business.description}
                  />
                  <ErrorMessage id="operator-description-error">{errors.description}</ErrorMessage>
                </div>
                <label className="operator-request__checkbox operator-request__field--full">
                  <input
                    checked={confirmed}
                    onChange={(event) => {
                      setConfirmed(event.target.checked)
                      setErrors((current) => ({ ...current, confirmed: '' }))
                    }}
                    type="checkbox"
                  />
                  <span>Confirmo que los datos del negocio son verídicos.</span>
                </label>
                <ErrorMessage id="operator-confirmed-error">{errors.confirmed}</ErrorMessage>
                <button className="operator-request__primary operator-request__field--full" type="submit">
                  Siguiente
                </button>
                <button
                  className="operator-request__cancel operator-request__field--full"
                  onClick={() => navigate(-1)}
                  type="button"
                >
                  Cancelar y volver a mi perfil
                </button>
              </div>
            ) : (
              <div className="operator-request__document-fields">
                <div className="operator-request__upload-grid">
                  <div className="operator-request__upload-group">
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
                    <p className="operator-request__helper">
                      Solo para verificar tu identidad. Nunca se muestra públicamente.
                    </p>
                  </div>

                  <div className="operator-request__upload-group">
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
                    <p className="operator-request__helper">
                      Una imagen de tu local, equipo o punto de encuentro.
                    </p>
                  </div>
                </div>

                <div className="operator-request__field">
                  <div className="operator-request__upload-heading">
                    <label htmlFor="operator-evidence">Evidencias de tu actividad</label>
                    <span className="operator-request__required">Obligatorio · mín. 1</span>
                  </div>
                  <p className="operator-request__helper">
                    Fotos que muestren a qué te dedicas. Ej.: tu bar en servicio, una clase de surf en curso.
                  </p>
                  <input
                    accept="image/jpeg,image/png"
                    aria-label="Adjuntar evidencias de tu actividad"
                    className="operator-request__file-input"
                    id="operator-evidence"
                    multiple
                    onChange={handleEvidenceChange}
                    type="file"
                  />
                  <div className="operator-request__evidence-grid">
                    {evidencePhotos.map((file) => (
                      <div className="operator-request__evidence" key={file.preview}>
                        <img src={file.preview} alt={`Evidencia: ${file.name}`} />
                        <button
                          aria-label={`Quitar evidencia ${file.name}`}
                          onClick={() => removeEvidence(file)}
                          type="button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {evidencePhotos.length < 5 && (
                      <label className="operator-request__add-evidence" htmlFor="operator-evidence">
                        <span aria-hidden="true">+</span>
                        <span className="sr-only">Agregar evidencia</span>
                      </label>
                    )}
                    {evidencePhotos.length === 0 && (
                      <label
                        className="operator-request__add-evidence operator-request__add-evidence--secondary"
                        htmlFor="operator-evidence"
                        aria-hidden="true"
                      >
                        <span>+</span>
                      </label>
                    )}
                  </div>
                  <p className="operator-request__file-count">
                    {evidencePhotos.length} de 5 imágenes ·{' '}
                    {evidencePhotos.length > 0 ? 'ya cumples el mínimo' : 'adjunta al menos una'}
                  </p>
                  <ErrorMessage id="operator-evidence-error">{errors.evidence}</ErrorMessage>
                </div>

                <div className="operator-request__field">
                  <div className="operator-request__upload-heading">
                    <label htmlFor="operator-social-link">Enlace a redes o sitio web</label>
                    <span className="operator-request__optional">Opcional</span>
                  </div>
                  <input
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

                <p className="operator-request__privacy">
                  Tus archivos se guardan de forma privada. Solo el equipo administrador puede
                  verlos.
                </p>
                {submissionMessage && (
                  <p className="operator-request__notice" role="status">
                    {submissionMessage}
                  </p>
                )}
                <div className="operator-request__actions">
                  <button className="operator-request__primary" type="submit">
                    Enviar solicitud
                  </button>
                  <button className="operator-request__secondary" onClick={handleBack} type="button">
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
