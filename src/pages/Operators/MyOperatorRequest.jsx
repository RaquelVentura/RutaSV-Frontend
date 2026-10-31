import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Dialog from '../../components/admin/Dialog.jsx'
import Pill from '../../components/admin/Pill.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  DocumentTypeLabels,
  extractBackendErrorMessage,
  formatShortDate,
  getMyOperatorRequest,
  normalizeOperatorRequest,
  OperatorRequestDocumentType,
  OperatorRequestStatus,
  resolveDocumentImageUrl,
  StatusMeta,
} from '../../lib/operatorRequests.js'

function DetailItem({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium text-stone-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-stone-900">{children}</dd>
    </div>
  )
}

function VisitorDocumentCard({ document, onPreview }) {
  const [imageError, setImageError] = useState(false)
  const typeKey = String(document.type || 'OTRO').toUpperCase()
  const label = DocumentTypeLabels[typeKey] || typeKey
  const reference = document.objectKey || document.url || 'Documento adjunto'
  const isSocialLink = typeKey === OperatorRequestDocumentType.ENLACE_REDES
  const imageUrl = resolveDocumentImageUrl(document)

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-stone-50 p-3.5">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-stone-900">{label}</span>
          <Pill tone="info">{typeKey}</Pill>
        </div>

        {isSocialLink && document.url ? (
          <a
            href={document.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block truncate text-xs font-semibold text-[#087E9A] hover:underline"
          >
            {document.url}
          </a>
        ) : imageUrl && !imageError ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-stone-200 bg-white">
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
          <div className="mt-3 rounded-xl border border-dashed border-stone-300 bg-white p-3 text-xs text-stone-600">
            Vista previa no disponible en el servidor. Haz clic en «Modificar solicitud» para
            volver a subir este archivo.
          </div>
        )}
      </div>

      <p className="mt-2 truncate text-xs text-stone-500" title={reference}>
        {reference}
      </p>
    </div>
  )
}

export default function MyOperatorRequest() {
  const { user, refreshSession } = useAuth()
  const location = useLocation()
  const initialRequest = location.state?.request
    ? normalizeOperatorRequest(location.state.request)
    : null
  const noticeMessage = location.state?.notice || ''

  const [request, setRequest] = useState(initialRequest)
  const [loading, setLoading] = useState(!initialRequest)
  const [error, setError] = useState('')
  const [previewDoc, setPreviewDoc] = useState(null)

  useEffect(() => {
    let active = true

    async function loadMyRequest() {
      if (!initialRequest) {
        setLoading(true)
      }
      setError('')
      try {
        const latest = await getMyOperatorRequest()
        if (!active) return
        if (latest) {
          setRequest(latest)
          if (
            latest.status === OperatorRequestStatus.APROBADA &&
            user?.role !== 'OPERADOR' &&
            user?.role !== 'ADMIN'
          ) {
            await refreshSession?.('OPERADOR')
          }
        } else if (!initialRequest) {
          setRequest(null)
        }
      } catch (err) {
        if (!active) return
        if (!initialRequest) {
          setError(
            extractBackendErrorMessage(
              err,
              'No se pudo consultar el estado de tu solicitud de operador.',
            ),
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadMyRequest()

    return () => {
      active = false
    }
  }, [initialRequest, refreshSession, user?.role])

  if (loading) {
    return (
      <section role="status" className="py-14 text-center text-sm text-stone-600">
        Consultando el estado de tu solicitud de operador...
      </section>
    )
  }

  if (error && !request) {
    return (
      <section className="mx-auto max-w-3xl space-y-4">
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
        <Link
          to="/operador/solicitud/formulario"
          className="inline-flex items-center justify-center rounded-xl bg-[#087E9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800"
        >
          Ir al formulario de solicitud
        </Link>
      </section>
    )
  }

  if (!request) {
    return (
      <section className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-8 shadow-xs">
        <span className="inline-block rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold tracking-wide text-[#087E9A] uppercase">
          Conviértete en operador
        </span>
        <h1 className="mt-3 text-3xl font-extrabold text-stone-900">
          Solicitud de Operador
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Aún no has enviado ninguna solicitud para operar experiencias turísticas en RutaSV.
          Completa el formulario con los datos de tu negocio y adjunta tus documentos de respaldo
          para que un administrador revise tu perfil.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-bold text-[#087E9A]">PASO 1</p>
            <p className="mt-1 text-sm font-bold text-stone-900">Datos del negocio</p>
            <p className="mt-1 text-xs text-stone-600">
              Nombre comercial, teléfono, ubicación y descripción de tus servicios.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-bold text-[#087E9A]">PASO 2</p>
            <p className="mt-1 text-sm font-bold text-stone-900">Documentos y fotos</p>
            <p className="mt-1 text-xs text-stone-600">
              DUI, registro o constancia y fotografías reales de tu actividad.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-bold text-[#087E9A]">PASO 3</p>
            <p className="mt-1 text-sm font-bold text-stone-900">Revisión y activación</p>
            <p className="mt-1 text-xs text-stone-600">
              Recibirás notificación y podrás consultar el estado en esta misma página.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/operador/solicitud/formulario"
            className="inline-flex items-center justify-center rounded-xl bg-[#087E9A] px-6 py-3 text-sm font-bold text-white transition hover:bg-cyan-800"
          >
            Crear solicitud de operador
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    )
  }

  const status = request.status || OperatorRequestStatus.PENDIENTE
  const pill = StatusMeta[status] ?? StatusMeta.PENDIENTE
  const documents = Array.isArray(request.documents) ? request.documents : []
  const canModify =
    status === OperatorRequestStatus.PENDIENTE ||
    status === OperatorRequestStatus.RECHAZADA

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      {noticeMessage && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-900 shadow-xs"
        >
          {noticeMessage}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-stone-900 sm:text-3xl">
              Mi solicitud de operador
            </h1>
            <Pill tone={pill.tone}>{pill.label}</Pill>
          </div>
          <p className="mt-1.5 text-sm text-stone-600">
            Enviada el {request.sentLong}
            {request.reviewedAt
              ? ` · Revisada el ${formatShortDate(request.reviewedAt)}`
              : ''}
          </p>
        </div>

        {canModify && (
          <Link
            to="/operador/solicitud/formulario"
            state={{ request }}
            className="inline-flex items-center justify-center rounded-xl bg-[#087E9A] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-800"
          >
            {status === OperatorRequestStatus.RECHAZADA
              ? 'Corregir y reenviar solicitud'
              : 'Modificar solicitud'}
          </Link>
        )}
      </div>

      {status === OperatorRequestStatus.PENDIENTE && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <p className="font-bold">Tu solicitud está en revisión</p>
          <p className="mt-1 text-xs sm:text-sm">
            Nuestro equipo de administración está verificando los datos de{' '}
            <strong>{request.tradeName}</strong>. Si necesitas actualizar algún dato o volver a
            subir tus fotografías, puedes usar el botón «Modificar solicitud».
          </p>
        </div>
      )}

      {status === OperatorRequestStatus.RECHAZADA && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900"
        >
          <p className="font-bold">Tu solicitud fue rechazada</p>
          <p className="mt-1">
            <span className="font-semibold">Motivo del rechazo: </span>
            {request.rejectionReason ||
              'El administrador no especificó un motivo detallado.'}
          </p>
          <p className="mt-2 text-xs text-red-800">
            Puedes modificar la información o reemplazar los documentos observados y enviar tu
            solicitud nuevamente para revisión.
          </p>
        </div>
      )}

      {status === OperatorRequestStatus.APROBADA && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
          <div>
            <p className="font-bold">¡Tu solicitud fue aprobada!</p>
            <p className="mt-1">
              Tu empresa <strong>{request.tradeName}</strong> se encuentra activa como operador en
              RutaSV.
            </p>
          </div>
          <Link
            to="/operador"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800"
          >
            Ir al Panel de Operador
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs">
            <h2 className="text-lg font-extrabold text-stone-900">Datos del negocio</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Nombre comercial">{request.tradeName}</DetailItem>
              <DetailItem label="Razón social">
                {request.legalName || 'No especificada'}
              </DetailItem>
              <DetailItem label="Correo de contacto">{request.contactEmail}</DetailItem>
              <DetailItem label="Teléfono de contacto">{request.phone}</DetailItem>
              {request.whatsapp && (
                <DetailItem label="WhatsApp">{request.whatsapp}</DetailItem>
              )}
              {request.municipalityId && (
                <DetailItem label="Municipio ID">{request.municipalityId}</DetailItem>
              )}
              <DetailItem label="Dirección">{request.address}</DetailItem>
              <DetailItem label="Estado de la empresa">{request.companyStatus}</DetailItem>
            </dl>

            <div className="mt-5 border-t border-stone-100 pt-4">
              <p className="text-xs font-medium text-stone-500">Descripción del negocio</p>
              <p className="mt-1 text-sm text-stone-800">{request.description}</p>
            </div>

            {request.message && (
              <div className="mt-4 border-t border-stone-100 pt-4">
                <p className="text-xs font-medium text-stone-500">
                  Mensaje enviado al administrador
                </p>
                <p className="mt-1 text-sm text-stone-800">{request.message}</p>
              </div>
            )}

            {request.website && (
              <div className="mt-4 border-t border-stone-100 pt-4">
                <p className="text-xs font-medium text-stone-500">
                  Enlace a redes o sitio web
                </p>
                <a
                  href={request.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-sm font-semibold text-[#087E9A] hover:underline"
                >
                  {request.website}
                </a>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold text-stone-900">
                Documentos y fotografías adjuntas
              </h2>
              <Pill tone="info">{documents.length} documento(s)</Pill>
            </div>
            {documents.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">
                No hay documentos adjuntos en esta solicitud.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {documents.map((doc) => (
                  <VisitorDocumentCard
                    key={doc.id || `${doc.type}-${doc.objectKey || doc.url}`}
                    document={doc}
                    onPreview={setPreviewDoc}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs">
            <h2 className="text-lg font-extrabold text-stone-900">Resumen de estado</h2>
            <ul className="mt-4 space-y-2.5 text-xs text-stone-600">
              <li>• {request.sentShort} · Solicitud registrada</li>
              {status === OperatorRequestStatus.PENDIENTE && (
                <li>• En espera de revisión por un administrador</li>
              )}
              {status === OperatorRequestStatus.APROBADA && (
                <li>
                  • {formatShortDate(request.reviewedAt)} · Solicitud aprobada
                </li>
              )}
              {status === OperatorRequestStatus.RECHAZADA && (
                <li>
                  • {formatShortDate(request.reviewedAt)} · Solicitud rechazada
                </li>
              )}
            </ul>

            {canModify && (
              <div className="mt-6 border-t border-stone-100 pt-4">
                <p className="text-xs text-stone-500">
                  ¿Necesitas cambiar algún dato de tu negocio o subir nuevas imágenes?
                </p>
                <Link
                  to="/operador/solicitud/formulario"
                  state={{ request }}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[#087E9A] px-4 py-2.5 text-xs font-bold text-[#087E9A] transition hover:bg-cyan-50"
                >
                  Editar datos o documentos
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {previewDoc && (
        <Dialog title={previewDoc.label} onClose={() => setPreviewDoc(null)}>
          <div className="mt-3 overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
            <img
              src={previewDoc.imageUrl}
              alt={previewDoc.label}
              className="max-h-[70vh] w-full object-contain"
            />
          </div>
          <p className="mt-2 truncate text-xs text-stone-500">{previewDoc.reference}</p>
          <div className="mt-4 flex justify-end gap-2">
            <a
              href={previewDoc.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-[#087E9A] hover:bg-stone-50"
            >
              Abrir en pestaña nueva
            </a>
            <button
              type="button"
              onClick={() => setPreviewDoc(null)}
              className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              Cerrar
            </button>
          </div>
        </Dialog>
      )}
    </section>
  )
}
