import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import AdminCard from '../../components/admin/AdminCard.jsx'
import Dialog from '../../components/admin/Dialog.jsx'
import Notice from '../../components/admin/Notice.jsx'
import Pill from '../../components/admin/Pill.jsx'
import Button from '../../components/Button.jsx'
import LinkButton from '../../components/LinkButton.jsx'
import {
  DocumentTypeLabels,
  extractBackendErrorMessage,
  formatShortDate,
  getOperatorRequests,
  normalizeOperatorRequest,
  OperatorRequestDocumentType,
  OperatorRequestStatus,
  resolveDocumentImageUrl,
  reviewOperatorRequest,
  StatusMeta,
} from '../../lib/operatorRequests.js'

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-ink">{children}</dd>
    </div>
  )
}

function DocumentItem({ document, onPreview }) {
  const [imageError, setImageError] = useState(false)
  const typeKey = String(document.type || 'OTRO').toUpperCase()
  const label = DocumentTypeLabels[typeKey] || typeKey
  const reference = document.objectKey || document.url || 'Documento adjunto'
  const isSocialLink = typeKey === OperatorRequestDocumentType.ENLACE_REDES
  const imageUrl = resolveDocumentImageUrl(document)

  return (
    <div className="flex flex-col justify-between rounded-xl border border-mist bg-canvas p-3">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-ink">{label}</span>
          <Pill tone="info">{typeKey}</Pill>
        </div>

        {isSocialLink && document.url ? (
          <a
            href={document.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block truncate text-xs font-semibold text-brand hover:underline"
          >
            {document.url}
          </a>
        ) : imageUrl && !imageError ? (
          <div className="mt-3 overflow-hidden rounded-lg border border-mist bg-white">
            <button
              type="button"
              onClick={() => onPreview?.({ label, imageUrl, reference })}
              className="group relative block w-full text-left focus:outline-none"
              title="Haz clic para ampliar la imagen"
            >
              <img
                src={imageUrl}
                alt={label}
                onError={() => setImageError(true)}
                className="h-44 w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
              />
              <span className="absolute right-2 bottom-2 rounded-md bg-black/65 px-2 py-1 text-[11px] font-semibold text-white">
                Ampliar
              </span>
            </button>
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-mist bg-white/70 p-3 text-xs text-muted">
            No se pudo cargar la vista previa de esta imagen. Si fue adjuntada antes de habilitar el
            almacenamiento, el solicitante puede volver a subirla desde «Modificar solicitud».
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="truncate text-xs text-muted" title={reference}>
          {reference}
        </p>
        {imageUrl && !imageError && (
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-xs font-semibold text-brand hover:underline"
          >
            Abrir
          </a>
        )}
      </div>
    </div>
  )
}

function RequestDetail() {
  const { id } = useParams()
  const location = useLocation()
  const initialFromState =
    location.state?.request && String(location.state.request.id) === String(id)
      ? normalizeOperatorRequest(location.state.request)
      : null

  const [request, setRequest] = useState(initialFromState)
  const [loading, setLoading] = useState(!initialFromState)
  const [reason, setReason] = useState(initialFromState?.rejectionReason || '')
  const [reasonError, setReasonError] = useState('')
  const [actionError, setActionError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialog, setDialog] = useState(null)
  const [justReviewed, setJustReviewed] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)

  useEffect(() => {
    let active = true

    async function fetchDetail() {
      if (!initialFromState) {
        setLoading(true)
      }
      try {
        const paged = await getOperatorRequests({ pageNumber: 1, pageSize: 100 })
        if (!active) return
        const match = paged.data.find((item) => String(item.id) === String(id))
        if (match) {
          setRequest(match)
          if (match.rejectionReason) {
            setReason(match.rejectionReason)
          }
        } else if (!initialFromState) {
          setRequest(null)
        }
      } catch {
        if (active && !initialFromState) {
          setRequest(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchDetail()

    return () => {
      active = false
    }
  }, [id, initialFromState])

  if (loading) {
    return (
      <section role="status" className="py-12 text-center text-sm text-muted">
        Cargando detalle de la solicitud...
      </section>
    )
  }

  if (!request) {
    return (
      <section>
        <h1 className="text-3xl font-extrabold text-ink">Solicitud no encontrada</h1>
        <p className="mt-2 text-muted">La solicitud que buscas no existe o ya fue resuelta.</p>
        <LinkButton to="/admin/solicitudes" className="mt-6">
          Volver a solicitudes
        </LinkButton>
      </section>
    )
  }

  const status = request.status || OperatorRequestStatus.PENDIENTE
  const resolved = status !== OperatorRequestStatus.PENDIENTE
  const pill = StatusMeta[status] ?? StatusMeta.PENDIENTE
  const documents = Array.isArray(request.documents) ? request.documents : []

  function openReject() {
    const trimmed = reason.trim()
    if (!trimmed) {
      setReasonError('Escribe un motivo para poder rechazar.')
      return
    }
    if (trimmed.length > 500) {
      setReasonError('El motivo del rechazo no puede exceder 500 caracteres.')
      return
    }
    setReasonError('')
    setActionError('')
    setDialog('reject')
  }

  async function confirmApprove() {
    setIsSubmitting(true)
    setActionError('')
    try {
      const updated = await reviewOperatorRequest(request.id, {
        isApproved: true,
        rejectionReason: null,
      })
      setRequest(updated)
      setJustReviewed('APROBADA')
      setDialog(null)
    } catch (error) {
      setActionError(
        extractBackendErrorMessage(
          error,
          'No se pudo aprobar la solicitud de operador.',
        ),
      )
      setDialog(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function confirmReject() {
    const trimmed = reason.trim()
    if (!trimmed) {
      setReasonError('Escribe un motivo para poder rechazar.')
      return
    }
    if (trimmed.length > 500) {
      setReasonError('El motivo del rechazo no puede exceder 500 caracteres.')
      return
    }

    setIsSubmitting(true)
    setActionError('')
    try {
      const updated = await reviewOperatorRequest(request.id, {
        isApproved: false,
        rejectionReason: trimmed,
      })
      setRequest(updated)
      setJustReviewed('RECHAZADA')
      setDialog(null)
    } catch (error) {
      setActionError(
        extractBackendErrorMessage(
          error,
          'No se pudo rechazar la solicitud de operador.',
        ),
      )
      setDialog(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/solicitudes" className="text-xs font-semibold text-brand">
        ← Solicitudes de operador
      </Link>

      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-extrabold text-ink">Solicitud de {request.name}</h1>
          <Pill tone={pill.tone}>{pill.label}</Pill>
        </div>
        <p className="mt-2 text-sm text-muted">
          Enviada el {request.sentLong}
          {!resolved && ' · Debe resolverse con aprobación o rechazo.'}
        </p>
      </header>

      {actionError && <Notice tone="warning">{actionError}</Notice>}

      {status === OperatorRequestStatus.APROBADA && (
        <Notice tone="success">
          Solicitud aprobada. Se envió un correo a {request.name} y su rol pasó a{' '}
          {request.userRole || 'OPERADOR'}.
        </Notice>
      )}
      {status === OperatorRequestStatus.RECHAZADA && (
        <Notice tone="warning">
          Solicitud rechazada. Se notificó al solicitante.
          {request.rejectionReason ? ` Motivo: ${request.rejectionReason}` : ''}
        </Notice>
      )}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <AdminCard title="Datos del solicitante">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre">{request.name}</Field>
              <Field label="Correo">{request.email}</Field>
              <Field label="Teléfono">{request.userPhone}</Field>
              <Field label="Rol del usuario">{request.userRole}</Field>
              <div>
                <dt className="text-xs text-muted">Estado de cuenta</dt>
                <dd className="mt-1">
                  <Pill tone="success">{request.userStatus}</Pill>
                </dd>
              </div>
            </dl>
          </AdminCard>

          <AdminCard title="Datos del negocio">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre comercial">{request.tradeName}</Field>
              <Field label="Razón social">{request.legalName || 'No especificada'}</Field>
              <Field label="Correo de contacto">{request.contactEmail}</Field>
              <Field label="Teléfono">{request.phone}</Field>
              {request.whatsapp && <Field label="WhatsApp">{request.whatsapp}</Field>}
              {request.municipalityId && (
                <Field label="Municipio ID">{request.municipalityId}</Field>
              )}
              <Field label="Dirección">{request.address}</Field>
              <Field label="Estado de la empresa">{request.companyStatus}</Field>
            </dl>
            <p className="mt-4 text-xs text-muted">Descripción</p>
            <p className="mt-0.5 text-sm text-ink">{request.description}</p>
            {request.message && (
              <>
                <p className="mt-4 text-xs text-muted">Mensaje del solicitante</p>
                <p className="mt-0.5 text-sm text-ink">{request.message}</p>
              </>
            )}
          </AdminCard>

          <AdminCard title="Documentos y evidencias">
            <p className="rounded-lg bg-info-soft px-3 py-2 text-xs text-brand">
              Archivos privados · revisa los documentos adjuntos a la solicitud.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <h3 className="text-sm font-bold text-ink">Documentos de respaldo</h3>
              <Pill tone="info">{documents.length} documento(s)</Pill>
            </div>
            {documents.length === 0 ? (
              <p className="mt-3 text-xs text-muted">No hay documentos registrados.</p>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {documents.map((doc) => (
                  <DocumentItem
                    key={doc.id || `${doc.type}-${doc.objectKey || doc.url}`}
                    document={doc}
                    onPreview={setPreviewDoc}
                  />
                ))}
              </div>
            )}
            {request.website && (
              <>
                <p className="mt-4 text-xs text-muted">Enlace a redes o sitio web</p>
                <a
                  href={request.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-brand"
                >
                  {request.website}
                </a>
              </>
            )}
          </AdminCard>
        </div>

        <div className="space-y-4">
          <AdminCard title="Decisión">
            <p className="text-xs text-muted">
              Al aprobar, el usuario pasa a ser Operador y su empresa queda activa. Se le enviará
              un correo.
            </p>
            <Button
              className="mt-4 w-full"
              disabled={resolved || isSubmitting}
              onClick={() => {
                setActionError('')
                setDialog('approve')
              }}
            >
              Aprobar solicitud
            </Button>

            <div className="mt-5 border-t border-mist pt-4">
              <div className="flex items-center gap-2">
                <label htmlFor="reject-reason" className="text-sm font-bold text-ink">
                  Motivo del rechazo
                </label>
                <Pill tone="danger">Obligatorio</Pill>
              </div>
              <textarea
                id="reject-reason"
                rows="3"
                value={reason}
                disabled={resolved || isSubmitting}
                aria-invalid={Boolean(reasonError)}
                aria-describedby={reasonError ? 'reject-reason-error' : undefined}
                onChange={(event) => {
                  setReason(event.target.value)
                  setReasonError('')
                }}
                placeholder="Explica por qué se rechaza (el solicitante lo verá en su correo)."
                className="mt-2 w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 aria-invalid:border-danger"
              />
              {reasonError && (
                <p id="reject-reason-error" role="alert" className="mt-1 text-xs text-danger">
                  {reasonError}
                </p>
              )}
              <button
                type="button"
                disabled={resolved || isSubmitting}
                onClick={openReject}
                className="mt-3 w-full rounded-xl border border-danger px-5 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/40 disabled:opacity-50"
              >
                Rechazar solicitud
              </button>
            </div>
          </AdminCard>

          <AdminCard title="Historial">
            <ul className="space-y-1 text-xs text-muted">
              <li>• {request.sentShort} · Solicitud enviada</li>
              {status === OperatorRequestStatus.PENDIENTE && (
                <li>• {request.sentShort} · Pendiente de revisión</li>
              )}
              {status === OperatorRequestStatus.APROBADA && (
                <li>
                  • {justReviewed === 'APROBADA' ? 'Ahora' : formatShortDate(request.reviewedAt)} ·
                  Solicitud aprobada
                </li>
              )}
              {status === OperatorRequestStatus.RECHAZADA && (
                <li>
                  • {justReviewed === 'RECHAZADA' ? 'Ahora' : formatShortDate(request.reviewedAt)} ·
                  Solicitud rechazada
                </li>
              )}
            </ul>
          </AdminCard>
        </div>
      </div>

      {dialog === 'approve' && (
        <Dialog title="¿Aprobar la solicitud?" onClose={() => setDialog(null)}>
          <p className="mt-3 text-sm text-muted">
            {request.name} pasará a ser Operador y {request.business} quedará activo. Se le
            enviará un correo de confirmación.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setDialog(null)}
            >
              Cancelar
            </Button>
            <Button disabled={isSubmitting} onClick={confirmApprove}>
              {isSubmitting ? 'Aprobando...' : 'Sí, aprobar'}
            </Button>
          </div>
        </Dialog>
      )}

      {dialog === 'reject' && (
        <Dialog title="Rechazar solicitud" onClose={() => setDialog(null)}>
          <p className="mt-3 text-sm text-muted">
            Cuéntale a {request.name} por qué no se aprueba. El motivo se enviará por correo.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <label htmlFor="dialog-reason" className="text-sm font-bold text-ink">
              Motivo del rechazo
            </label>
            <Pill tone="danger">Obligatorio</Pill>
          </div>
          <textarea
            id="dialog-reason"
            rows="3"
            value={reason}
            disabled={isSubmitting}
            aria-invalid={Boolean(reasonError)}
            onChange={(event) => {
              setReason(event.target.value)
              setReasonError('')
            }}
            className="mt-2 w-full rounded-xl border border-mist bg-canvas px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 aria-invalid:border-danger"
          />
          {reasonError && (
            <p role="alert" className="mt-1 text-xs text-danger">
              {reasonError}
            </p>
          )}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setDialog(null)}
            >
              Cancelar
            </Button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={confirmReject}
              className="rounded-xl bg-danger px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-danger/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/40 disabled:opacity-50"
            >
              {isSubmitting ? 'Rechazando...' : 'Rechazar solicitud'}
            </button>
          </div>
        </Dialog>
      )}

      {previewDoc && (
        <Dialog title={previewDoc.label} onClose={() => setPreviewDoc(null)}>
          <div className="mt-3 overflow-hidden rounded-xl border border-mist bg-canvas">
            <img
              src={previewDoc.imageUrl}
              alt={previewDoc.label}
              className="max-h-[70vh] w-full object-contain"
            />
          </div>
          <p className="mt-2 truncate text-xs text-muted">{previewDoc.reference}</p>
          <div className="mt-4 flex justify-end gap-2">
            <a
              href={previewDoc.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-mist px-4 py-2 text-xs font-semibold text-brand hover:bg-canvas"
            >
              Abrir en pestaña nueva
            </a>
            <Button variant="outline" onClick={() => setPreviewDoc(null)}>
              Cerrar
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  )
}

export default RequestDetail
