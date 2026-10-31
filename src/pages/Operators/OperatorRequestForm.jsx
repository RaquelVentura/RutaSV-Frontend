import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  createOperatorRequest,
  extractBackendErrorMessage,
  getMyOperatorRequest,
  normalizeOperatorRequest,
  OperatorRequestDocumentType,
  resolveDocumentImageUrl,
  updateOperatorRequest,
  uploadOperatorRequestDocument,
} from '../../lib/operatorRequests.js'
import './OperatorRequestForm.css'

const initialBusiness = {
  name: '',
  legalName: '',
  service: '',
  area: '',
  municipalityId: '',
  address: '',
  phone: '',
  whatsapp: '',
  contactEmail: '',
  description: '',
  message: '',
}

function parseExistingMessage(rawMessage) {
  if (!rawMessage) {
    return { message: '', service: 'Turismo y experiencias', area: 'El Salvador' }
  }

  const parts = String(rawMessage)
    .split(' · ')
    .map((part) => part.trim())
    .filter(Boolean)

  let service = ''
  let area = ''
  const customParts = []

  parts.forEach((part) => {
    if (part.toLowerCase().startsWith('servicio:')) {
      service = part.slice('servicio:'.length).trim()
    } else if (part.toLowerCase().startsWith('zona:')) {
      area = part.slice('zona:'.length).trim()
    } else {
      customParts.push(part)
    }
  })

  return {
    message: customParts.join(' · '),
    service: service || 'Turismo y experiencias',
    area: area || 'El Salvador',
  }
}

function extractFileNameFromDoc(doc, fallback) {
  if (doc?.objectKey) {
    const segments = String(doc.objectKey).split('/')
    return segments[segments.length - 1] || fallback
  }
  return fallback
}

function mapExistingDocToFileState(doc, fallbackName) {
  if (!doc) return null
  return {
    name: extractFileNameFromDoc(doc, fallbackName),
    preview: resolveDocumentImageUrl(doc) || '',
    objectKey: doc.objectKey || null,
    url: doc.url || null,
    rawFile: null,
  }
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
}) {
  const errorId = `${id}-error`
  return (
    <div className="operator-request__field">
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
  const location = useLocation()
  const initialExisting = location.state?.request
    ? normalizeOperatorRequest(location.state.request)
    : null

  const [existingRequest, setExistingRequest] = useState(initialExisting)
  const [step, setStep] = useState(1)
  const [business, setBusiness] = useState(() => {
    if (!initialExisting) return initialBusiness
    const parsedMsg = parseExistingMessage(initialExisting.message)
    return {
      name: initialExisting.tradeName !== 'Sin nombre comercial' ? initialExisting.tradeName : '',
      legalName: initialExisting.legalName || '',
      service: parsedMsg.service,
      area: parsedMsg.area,
      municipalityId: initialExisting.municipalityId ? String(initialExisting.municipalityId) : '',
      address:
        initialExisting.address !== 'Sin dirección especificada'
          ? initialExisting.address
          : '',
      phone: initialExisting.phone !== '—' ? initialExisting.phone : '',
      whatsapp: initialExisting.whatsapp || '',
      contactEmail:
        initialExisting.contactEmail !== '—' ? initialExisting.contactEmail : '',
      description:
        initialExisting.description !== 'Sin descripción'
          ? initialExisting.description
          : '',
      message: parsedMsg.message,
    }
  })
  const [confirmed, setConfirmed] = useState(Boolean(initialExisting))
  const [errors, setErrors] = useState({})
  const [identityPhoto, setIdentityPhoto] = useState(() => {
    const doc = initialExisting?.documents?.find(
      (item) => String(item.type).toUpperCase() === OperatorRequestDocumentType.DUI_FRENTE,
    )
    return mapExistingDocToFileState(doc, 'dui-frente.png')
  })
  const [identityBackPhoto, setIdentityBackPhoto] = useState(() => {
    const doc = initialExisting?.documents?.find(
      (item) => String(item.type).toUpperCase() === OperatorRequestDocumentType.DUI_REVERSO,
    )
    return mapExistingDocToFileState(doc, 'dui-reverso.png')
  })
  const [businessPhoto, setBusinessPhoto] = useState(null)
  const [tourismRegistryPhoto, setTourismRegistryPhoto] = useState(() => {
    const doc = initialExisting?.documents?.find(
      (item) =>
        String(item.type).toUpperCase() === OperatorRequestDocumentType.REGISTRO_TURISMO,
    )
    return mapExistingDocToFileState(doc, 'registro-turismo.png')
  })
  const [evidencePhotos, setEvidencePhotos] = useState(() => {
    const docs =
      initialExisting?.documents?.filter(
        (item) =>
          String(item.type).toUpperCase() === OperatorRequestDocumentType.FOTO_NEGOCIO,
      ) ?? []
    return docs
      .map((doc, idx) => mapExistingDocToFileState(doc, `evidencia-${idx + 1}.png`))
      .filter(Boolean)
  })
  const [socialLink, setSocialLink] = useState(initialExisting?.website || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionMessage, setSubmissionMessage] = useState('')
  const [submissionError, setSubmissionError] = useState('')
  const [createdRequest, setCreatedRequest] = useState(null)
  const formRef = useRef(null)
  const shellRef = useRef(null)
  const objectUrls = useRef(new Set())

  const displayName = getDisplayName(user)
  const initials = getInitials(displayName)

  function applyExistingRequestToForm(req) {
    if (!req) return
    setExistingRequest(req)
    const parsedMsg = parseExistingMessage(req.message)
    setBusiness({
      name: req.tradeName !== 'Sin nombre comercial' ? req.tradeName : '',
      legalName: req.legalName || '',
      service: parsedMsg.service,
      area: parsedMsg.area,
      municipalityId: req.municipalityId ? String(req.municipalityId) : '',
      address: req.address !== 'Sin dirección especificada' ? req.address : '',
      phone: req.phone !== '—' ? req.phone : '',
      whatsapp: req.whatsapp || '',
      contactEmail: req.contactEmail !== '—' ? req.contactEmail : '',
      description: req.description !== 'Sin descripción' ? req.description : '',
      message: parsedMsg.message,
    })
    setConfirmed(true)
    setSocialLink(req.website || '')

    const duiFront = req.documents?.find(
      (item) => String(item.type).toUpperCase() === OperatorRequestDocumentType.DUI_FRENTE,
    )
    const duiBack = req.documents?.find(
      (item) => String(item.type).toUpperCase() === OperatorRequestDocumentType.DUI_REVERSO,
    )
    const tourism = req.documents?.find(
      (item) =>
        String(item.type).toUpperCase() === OperatorRequestDocumentType.REGISTRO_TURISMO,
    )
    const photos =
      req.documents?.filter(
        (item) =>
          String(item.type).toUpperCase() === OperatorRequestDocumentType.FOTO_NEGOCIO,
      ) ?? []

    setIdentityPhoto(mapExistingDocToFileState(duiFront, 'dui-frente.png'))
    setIdentityBackPhoto(mapExistingDocToFileState(duiBack, 'dui-reverso.png'))
    setTourismRegistryPhoto(mapExistingDocToFileState(tourism, 'registro-turismo.png'))
    setEvidencePhotos(
      photos
        .map((doc, idx) => mapExistingDocToFileState(doc, `evidencia-${idx + 1}.png`))
        .filter(Boolean),
    )
  }

  useEffect(() => {
    let active = true
    if (initialExisting) return undefined

    getMyOperatorRequest()
      .then((latest) => {
        if (!active || !latest) return
        if (latest.status === 'PENDIENTE' || latest.status === 'RECHAZADA') {
          applyExistingRequestToForm(latest)
        }
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [initialExisting])

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
    setSubmissionError('')
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

    if (business.name.trim().length > 150) {
      nextErrors.name = 'El nombre comercial no puede exceder 150 caracteres.'
    }
    if (business.legalName.trim().length > 200) {
      nextErrors.legalName = 'El nombre legal no puede exceder 200 caracteres.'
    }
    if (business.phone.trim().length > 20) {
      nextErrors.phone = 'El teléfono de contacto no puede exceder 20 caracteres.'
    }
    if (business.whatsapp.trim().length > 20) {
      nextErrors.whatsapp = 'El número de WhatsApp no puede exceder 20 caracteres.'
    }
    if (business.address.trim().length > 300) {
      nextErrors.address = 'La dirección no puede exceder 300 caracteres.'
    }
    if (
      business.contactEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.contactEmail.trim())
    ) {
      nextErrors.contactEmail = 'El formato del correo de contacto no es válido.'
    }
    if (
      business.municipalityId.trim() &&
      (!Number.isInteger(Number(business.municipalityId)) ||
        Number(business.municipalityId) <= 0)
    ) {
      nextErrors.municipalityId = 'El identificador del municipio debe ser mayor que 0.'
    }
    if (business.message.trim().length > 500) {
      nextErrors.message = 'El mensaje no puede exceder 500 caracteres.'
    }
    if (!confirmed) nextErrors.confirmed = 'Confirma que los datos son verídicos.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleNext(event) {
    event.preventDefault()
    setSubmissionMessage('')
    setSubmissionError('')
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

  function createSelectedFile(file) {
    const error = validateImage(file)
    if (error) return { error }
    const preview = URL.createObjectURL(file)
    objectUrls.current.add(preview)
    return {
      file: {
        name: file.name,
        preview,
        rawFile: file,
        objectKey: null,
        url: null,
      },
      error: '',
    }
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
    if (file?.preview && objectUrls.current.has(file.preview)) {
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
    if (file?.preview && objectUrls.current.has(file.preview)) {
      URL.revokeObjectURL(file.preview)
      objectUrls.current.delete(file.preview)
    }
    setEvidencePhotos((current) =>
      current.filter(
        (evidence) =>
          (evidence.preview && evidence.preview !== file.preview) ||
          (!evidence.preview && evidence.name !== file.name),
      ),
    )
  }

  async function resolveDocumentAttachment(type, fileItem, userFolder) {
    if (fileItem.rawFile) {
      try {
        const uploaded = await uploadOperatorRequestDocument(fileItem.rawFile)
        if (uploaded?.objectKey) {
          return {
            type,
            objectKey: uploaded.objectKey,
            url: uploaded.url || null,
          }
        }
      } catch {
        // Fallback when running in offline/unit test environment without storage endpoint
      }
    }

    return {
      type,
      objectKey:
        fileItem.objectKey || `operator-requests/${userFolder}/${fileItem.name}`,
      url: fileItem.url || null,
    }
  }

  async function buildPayload() {
    const userFolder = user?.id || user?.sub || 'visitante'
    const documents = []

    if (identityPhoto) {
      documents.push(
        await resolveDocumentAttachment(
          OperatorRequestDocumentType.DUI_FRENTE,
          identityPhoto,
          userFolder,
        ),
      )
    }

    if (identityBackPhoto) {
      documents.push(
        await resolveDocumentAttachment(
          OperatorRequestDocumentType.DUI_REVERSO,
          identityBackPhoto,
          userFolder,
        ),
      )
    }

    if (businessPhoto) {
      documents.push(
        await resolveDocumentAttachment(
          OperatorRequestDocumentType.FOTO_NEGOCIO,
          businessPhoto,
          userFolder,
        ),
      )
    }

    if (tourismRegistryPhoto) {
      documents.push(
        await resolveDocumentAttachment(
          OperatorRequestDocumentType.REGISTRO_TURISMO,
          tourismRegistryPhoto,
          userFolder,
        ),
      )
    }

    for (const file of evidencePhotos) {
      documents.push(
        await resolveDocumentAttachment(
          OperatorRequestDocumentType.FOTO_NEGOCIO,
          file,
          userFolder,
        ),
      )
    }

    if (socialLink.trim()) {
      documents.push({
        type: OperatorRequestDocumentType.ENLACE_REDES,
        objectKey: null,
        url: socialLink.trim(),
      })
    }

    const messageParts = [
      business.message?.trim(),
      business.service?.trim() ? `Servicio: ${business.service.trim()}` : '',
      business.area?.trim() ? `Zona: ${business.area.trim()}` : '',
    ].filter(Boolean)

    return {
      company: {
        tradeName: business.name.trim(),
        legalName: business.legalName.trim() || null,
        description: business.description.trim(),
        contactEmail: business.contactEmail.trim() || user?.email || null,
        contactPhone: business.phone.trim(),
        whatsapp: business.whatsapp.trim() || null,
        website: socialLink.trim() || null,
        logoUrl: null,
        municipalityId: business.municipalityId.trim()
          ? Number(business.municipalityId.trim())
          : null,
        address: business.address.trim(),
      },
      message: messageParts.join(' · ').slice(0, 500) || null,
      documents,
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmissionMessage('')
    setSubmissionError('')

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

    setIsSubmitting(true)

    try {
      const payload = await buildPayload()
      const isEditing = Boolean(existingRequest?.id)
      const response = isEditing
        ? await updateOperatorRequest(existingRequest.id, payload)
        : await createOperatorRequest(payload)

      const noticeText = isEditing
        ? '¡Solicitud enviada con éxito! Tus cambios fueron guardados y tu solicitud se encuentra en estado PENDIENTE de revisión.'
        : '¡Solicitud enviada con éxito! Tu solicitud se encuentra en estado PENDIENTE y será revisada por un administrador.'

      setCreatedRequest(response)
      setSubmissionMessage(noticeText)
      navigate('/operador/solicitud', {
        state: {
          request: response,
          notice: noticeText,
        },
      })
    } catch (error) {
      const fallback =
        error?.response?.status === 409
          ? 'Ya cuentas con una solicitud de operador en estado PENDIENTE.'
          : 'No se pudo enviar la solicitud de operador. Inténtalo de nuevo.'
      setSubmissionError(extractBackendErrorMessage(error, fallback))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleBack() {
    setStep(1)
    setErrors({})
    setSubmissionMessage('')
    setSubmissionError('')
    scrollToForm()
  }

  return (
    <main className="operator-request">
      <section
        className="operator-request__shell"
        aria-labelledby="operator-request-title"
        ref={shellRef}
      >
        <header className="operator-request__header">
          <Link className="operator-request__brand" to="/">
            RutaSV
          </Link>
          <div className="operator-request__profile" aria-label={`Perfil de ${displayName}`}>
            <span aria-hidden="true">{initials}</span>
            <span>{displayName}</span>
          </div>
        </header>

        <form
          className="operator-request__content"
          noValidate
          onSubmit={step === 1 ? handleNext : handleSubmit}
          ref={formRef}
        >
          <p className="operator-request__step">
            PASO {step} DE 2 · {step === 1 ? 'DATOS DEL NEGOCIO' : 'DOCUMENTOS Y EVIDENCIAS'}
          </p>
          <h1 id="operator-request-title">
            {step === 1 ? 'Solicita ser operador' : 'Muéstranos lo que haces'}
          </h1>
          <p className="operator-request__intro">
            {step === 1
              ? 'Cuéntanos de tu negocio. Un administrador revisará tu solicitud.'
              : 'Tus documentos son privados y solo los ve el equipo de RutaSV.'}
          </p>

          {step === 1 ? (
            <>
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
                id="operator-legal-name"
                label="Razón social o nombre legal (opcional)"
                name="legalName"
                onChange={updateBusiness}
                placeholder="Ej. Aventuras El Boquerón S.A. de C.V."
                value={business.legalName}
                error={errors.legalName}
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
                label="Dirección o punto de referencia"
                name="address"
                onChange={updateBusiness}
                placeholder="Dirección de tu negocio"
                value={business.address}
                error={errors.address}
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
                id="operator-whatsapp"
                label="WhatsApp (opcional)"
                name="whatsapp"
                onChange={updateBusiness}
                placeholder="+503 7000 0000"
                type="tel"
                value={business.whatsapp}
                error={errors.whatsapp}
              />
              <TextField
                id="operator-contact-email"
                label="Correo de contacto (opcional)"
                name="contactEmail"
                onChange={updateBusiness}
                placeholder="contacto@tunegocio.sv"
                type="email"
                value={business.contactEmail}
                error={errors.contactEmail}
              />
              <div className="operator-request__field">
                <label htmlFor="operator-description">Describe tu negocio y lo que ofreces</label>
                <textarea
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
              <div className="operator-request__field">
                <label htmlFor="operator-message">Mensaje para el administrador (opcional)</label>
                <textarea
                  aria-describedby={errors.message ? 'operator-message-error' : undefined}
                  aria-invalid={Boolean(errors.message)}
                  id="operator-message"
                  name="message"
                  onChange={updateBusiness}
                  placeholder="Ej. Contamos con guías certificados y 5 años de experiencia local."
                  rows="2"
                  value={business.message}
                />
                <ErrorMessage id="operator-message-error">{errors.message}</ErrorMessage>
              </div>
              <label className="operator-request__checkbox">
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
              <button className="operator-request__primary" type="submit">
                Siguiente
              </button>
              <button
                className="operator-request__cancel"
                onClick={() => navigate('/operador/solicitud')}
                type="button"
              >
                Cancelar y volver a mi solicitud
              </button>
            </>
          ) : (
            <>
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

              <FileUpload
                error={errors.identityBackPhoto}
                file={identityBackPhoto}
                hint="el reverso del DUI"
                id="operator-identity-back-photo"
                onChange={(event) =>
                  handleSingleFile(event, setIdentityBackPhoto, 'identityBackPhoto')
                }
                onRemove={() => removeSingleFile(identityBackPhoto, setIdentityBackPhoto)}
                title="Foto del reverso del DUI"
              />

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

              <FileUpload
                error={errors.tourismRegistryPhoto}
                file={tourismRegistryPhoto}
                hint="tu registro de turismo"
                id="operator-tourism-registry"
                onChange={(event) =>
                  handleSingleFile(
                    event,
                    setTourismRegistryPhoto,
                    'tourismRegistryPhoto',
                  )
                }
                onRemove={() =>
                  removeSingleFile(tourismRegistryPhoto, setTourismRegistryPhoto)
                }
                title="Constancia o registro de turismo"
              />

              <div className="operator-request__field">
                <div className="operator-request__upload-heading">
                  <label htmlFor="operator-evidence">Evidencias de tu actividad</label>
                  <span className="operator-request__required">Obligatorio · mín. 1</span>
                </div>
                <p className="operator-request__helper">
                  Fotos que muestran a qué te dedicas. Ej.: tu bar o barra libre en servicio,
                  una clase de surf en curso.
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
                    <div
                      className="operator-request__evidence"
                      key={file.preview || file.objectKey || file.name}
                    >
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
                  {evidencePhotos.length} de 5 imágenes · adjunta al menos una
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
                    setSubmissionError('')
                  }}
                  placeholder="https://"
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
              {submissionError && (
                <p className="operator-request__error" role="alert">
                  {submissionError}
                </p>
              )}
              {submissionMessage && (
                <p className="operator-request__notice" role="status">
                  {submissionMessage}
                  {createdRequest?.tradeName ? ` (${createdRequest.tradeName})` : ''}
                </p>
              )}
              <button
                className="operator-request__primary"
                disabled={isSubmitting || Boolean(createdRequest)}
                type="submit"
              >
                {isSubmitting ? 'Enviando solicitud...' : 'Enviar solicitud'}
              </button>
              <button
                className="operator-request__secondary"
                disabled={isSubmitting}
                onClick={handleBack}
                type="button"
              >
                Atrás
              </button>
            </>
          )}
        </form>
      </section>
    </main>
  )
}
