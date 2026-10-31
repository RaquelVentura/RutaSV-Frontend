import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminCard from '../../components/admin/AdminCard.jsx'
import Dialog from '../../components/admin/Dialog.jsx'
import Notice from '../../components/admin/Notice.jsx'
import Pill from '../../components/admin/Pill.jsx'
import Button from '../../components/Button.jsx'
import LinkButton from '../../components/LinkButton.jsx'
import { operatorRequests } from '../../data/admin.js'

const statusPills = {
  pendiente: { tone: 'pending', label: 'Pendiente' },
  aprobada: { tone: 'success', label: 'Aprobada' },
  rechazada: { tone: 'danger', label: 'Rechazada' },
}

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-ink">{children}</dd>
    </div>
  )
}

function Photo({ caption, file }) {
  return (
    <figure>
      <figcaption className="mb-2 text-sm font-bold text-ink">{caption}</figcaption>
      <div
        role="img"
        aria-label={`${caption} (vista de ejemplo)`}
        className="h-36 rounded-xl bg-linear-to-br from-[#bfe3ea] to-brand"
      />
      <p className="mt-1.5 text-xs text-brand">{file} · Ver en grande</p>
    </figure>
  )
}

function RequestDetail() {
  const { id } = useParams()
  const request = operatorRequests.find((item) => item.id === id)
  const [status, setStatus] = useState('pendiente')
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [dialog, setDialog] = useState(null)

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

  const resolved = status !== 'pendiente'
  const pill = statusPills[status]

  function openReject() {
    if (!reason.trim()) {
      setReasonError('Escribe un motivo para poder rechazar.')
      return
    }
    setReasonError('')
    setDialog('reject')
  }

  function confirmApprove() {
    setStatus('aprobada')
    setDialog(null)
  }

  function confirmReject() {
    if (!reason.trim()) {
      setReasonError('Escribe un motivo para poder rechazar.')
      return
    }
    setStatus('rechazada')
    setDialog(null)
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

      {status === 'aprobada' && (
        <Notice tone="success">
          Solicitud aprobada. Se envió un correo a {request.name}.
        </Notice>
      )}
      {status === 'rechazada' && (
        <Notice tone="warning">Solicitud rechazada. Se notificó al solicitante.</Notice>
      )}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <AdminCard title="Datos del solicitante">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre">{request.name}</Field>
              <Field label="Correo">{request.email}</Field>
              <Field label="Registrado desde">{request.registeredAt}</Field>
              <div>
                <dt className="text-xs text-muted">Correo</dt>
                <dd className="mt-1">
                  <Pill tone="success">✓ Verificado</Pill>
                </dd>
              </div>
            </dl>
          </AdminCard>

          <AdminCard title="Datos del negocio">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre del negocio">{request.business}</Field>
              <Field label="Tipo de servicio">{request.service}</Field>
              <Field label="Zona">{request.zone}</Field>
              <Field label="Teléfono">{request.phone}</Field>
              <Field label="Dirección">{request.address}</Field>
            </dl>
            <p className="mt-4 text-xs text-muted">Descripción</p>
            <p className="mt-0.5 text-sm text-ink">{request.description}</p>
          </AdminCard>

          <AdminCard title="Documentos y evidencias">
            <p className="rounded-lg bg-info-soft px-3 py-2 text-xs text-brand">
              Archivos privados · el enlace de cada imagen es temporal y solo lo ves tú como
              administrador.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Photo caption="Foto del DUI" file="dui.jpg" />
              <Photo caption="Foto del negocio" file="negocio.jpg" />
            </div>
            <div className="mt-5 flex items-center gap-2">
              <h3 className="text-sm font-bold text-ink">Evidencias de la actividad</h3>
              <Pill tone="info">3 imágenes</Pill>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[1, 2, 3].map((number) => (
                <div
                  key={number}
                  role="img"
                  aria-label={`Evidencia ${number} (vista de ejemplo)`}
                  className="h-24 rounded-xl bg-linear-to-br from-[#bfe3ea] to-brand"
                />
              ))}
            </div>
            <p className="mt-4 text-xs text-muted">Enlace a redes o sitio web</p>
            <a
              href={request.link}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-brand"
            >
              {request.link}
            </a>
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
              disabled={resolved}
              onClick={() => setDialog('approve')}
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
                disabled={resolved}
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
                disabled={resolved}
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
              <li>• {request.sentShort} · Pendiente de revisión</li>
              {status === 'aprobada' && <li>• Ahora · Solicitud aprobada</li>}
              {status === 'rechazada' && <li>• Ahora · Solicitud rechazada</li>}
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
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmApprove}>Sí, aprobar</Button>
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
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancelar
            </Button>
            <button
              type="button"
              onClick={confirmReject}
              className="rounded-xl bg-danger px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-danger/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
            >
              Rechazar solicitud
            </button>
          </div>
        </Dialog>
      )}
    </div>
  )
}

export default RequestDetail
