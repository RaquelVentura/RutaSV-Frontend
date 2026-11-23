import { useEffect, useState } from 'react'
import {
  extractApiError,
  getDepartments,
  getMunicipalities,
  getMyCompanies,
  resolveAssetUrl,
  updateCompany,
  uploadCompanyLogo,
} from '../../lib/catalogApi.js'
import { notify } from '../../lib/notify.js'

function OperatorSettings() {
  const [company, setCompany] = useState(null)
  const [departments, setDepartments] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [departmentId, setDepartmentId] = useState('')
  const [form, setForm] = useState({
    tradeName: '',
    legalName: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    whatsapp: '',
    website: '',
    logoUrl: '',
    municipalityId: '',
    address: '',
  })
  const [loading, setLoading] = useState(true)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorBanner, setErrorBanner] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setErrorBanner('')
      try {
        const [companies, depts, allMuns] = await Promise.all([
          getMyCompanies(),
          getDepartments(),
          getMunicipalities(),
        ])
        if (cancelled) return
        setDepartments(depts)
        const primary = companies[0] || null
        setCompany(primary)
        if (primary) {
          const matchedMuni = allMuns.find((m) => m.id === primary.municipalityId)
          const dept = matchedMuni ? String(matchedMuni.departmentId) : ''
          setDepartmentId(dept)
          setMunicipalities(
            dept ? allMuns.filter((m) => String(m.departmentId) === dept) : allMuns,
          )
          setForm({
            tradeName: primary.tradeName ?? '',
            legalName: primary.legalName ?? '',
            description: primary.description ?? '',
            contactEmail: primary.contactEmail ?? '',
            contactPhone: primary.contactPhone ?? '',
            whatsapp: primary.whatsapp ?? '',
            website: primary.website ?? '',
            logoUrl: primary.logoUrl ?? '',
            municipalityId: primary.municipalityId ? String(primary.municipalityId) : '',
            address: primary.address ?? '',
          })
        }
      } catch (error) {
        if (!cancelled) {
          setErrorBanner(extractApiError(error, 'No se pudo cargar el perfil de empresa.').message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleDepartmentChange(nextDept) {
    setDepartmentId(nextDept)
    setForm((prev) => ({ ...prev, municipalityId: '' }))
    try {
      const muns = await getMunicipalities(nextDept ? Number(nextDept) : undefined)
      setMunicipalities(muns)
    } catch {
      setMunicipalities([])
    }
  }

  async function handleLogoUpload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setUploadingLogo(true)
    try {
      const res = await uploadCompanyLogo(file)
      setForm((prev) => ({ ...prev, logoUrl: res.url }))
      notify.success('Logotipo subido. Guarda los cambios para aplicarlo.')
    } catch (error) {
      notify.error(extractApiError(error, 'No se pudo subir el logotipo.').message)
    } finally {
      setUploadingLogo(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!company) return
    if (!form.tradeName.trim()) {
      setErrorBanner('El nombre comercial es obligatorio.')
      return
    }
    setSaving(true)
    setErrorBanner('')
    try {
      const updated = await updateCompany(company.id, {
        tradeName: form.tradeName.trim(),
        legalName: form.legalName.trim() || null,
        description: form.description.trim() || null,
        contactEmail: form.contactEmail.trim() || null,
        contactPhone: form.contactPhone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        website: form.website.trim() || null,
        logoUrl: form.logoUrl || null,
        municipalityId: form.municipalityId ? Number(form.municipalityId) : null,
        address: form.address.trim() || null,
      })
      setCompany(updated)
      notify.success('Perfil de empresa actualizado correctamente.')
    } catch (error) {
      setErrorBanner(extractApiError(error, 'No se pudo actualizar la empresa.').message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="h-72 animate-pulse rounded-2xl bg-surface" />
  }

  if (!company) {
    return (
      <div className="rounded-2xl border border-dashed border-mist bg-surface p-10 text-center text-sm text-muted">
        No tienes una empresa asociada para configurar.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-wide text-brand">Perfil de empresa</p>
        <h1 className="mt-1 text-3xl font-bold text-ink">Configuración del negocio</h1>
        <p className="mt-1 text-sm text-muted">
          Actualiza la información pública y de contacto de tu empresa turística en RutaSV.
        </p>
      </header>

      {errorBanner && (
        <div role="alert" className="rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          {errorBanner}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-mist bg-surface p-6">
        <div className="flex flex-wrap items-center gap-4">
          {form.logoUrl ? (
            <img
              src={resolveAssetUrl(form.logoUrl)}
              alt={form.tradeName}
              className="size-16 rounded-2xl border border-mist object-cover"
            />
          ) : (
            <div className="grid size-16 place-items-center rounded-2xl bg-info-soft text-lg font-bold text-brand">
              {form.tradeName?.slice(0, 2).toUpperCase() || 'SV'}
            </div>
          )}
          <label className="cursor-pointer rounded-full border border-mist bg-canvas px-4 py-2 text-xs font-semibold text-ink hover:border-brand">
            {uploadingLogo ? 'Subiendo logo...' : 'Cambiar logotipo'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="hidden"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="comp-trade" className="mb-1 block text-xs font-semibold text-muted">
              Nombre comercial *
            </label>
            <input
              id="comp-trade"
              type="text"
              required
              value={form.tradeName}
              onChange={(e) => setForm((p) => ({ ...p, tradeName: e.target.value }))}
              className="w-full rounded-xl border border-mist bg-canvas px-3.5 py-2.5 text-sm text-ink"
            />
          </div>
          <div>
            <label htmlFor="comp-legal" className="mb-1 block text-xs font-semibold text-muted">
              Razón social
            </label>
            <input
              id="comp-legal"
              type="text"
              value={form.legalName}
              onChange={(e) => setForm((p) => ({ ...p, legalName: e.target.value }))}
              className="w-full rounded-xl border border-mist bg-canvas px-3.5 py-2.5 text-sm text-ink"
            />
          </div>
        </div>

        <div>
          <label htmlFor="comp-desc" className="mb-1 block text-xs font-semibold text-muted">
            Descripción
          </label>
          <textarea
            id="comp-desc"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className="w-full rounded-xl border border-mist bg-canvas p-3 text-sm text-ink"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="comp-email" className="mb-1 block text-xs font-semibold text-muted">
              Correo de contacto
            </label>
            <input
              id="comp-email"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
              className="w-full rounded-xl border border-mist bg-canvas px-3.5 py-2.5 text-sm text-ink"
            />
          </div>
          <div>
            <label htmlFor="comp-phone" className="mb-1 block text-xs font-semibold text-muted">
              Teléfono
            </label>
            <input
              id="comp-phone"
              type="tel"
              value={form.contactPhone}
              onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
              className="w-full rounded-xl border border-mist bg-canvas px-3.5 py-2.5 text-sm text-ink"
            />
          </div>
          <div>
            <label htmlFor="comp-wa" className="mb-1 block text-xs font-semibold text-muted">
              WhatsApp
            </label>
            <input
              id="comp-wa"
              type="tel"
              value={form.whatsapp}
              onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
              className="w-full rounded-xl border border-mist bg-canvas px-3.5 py-2.5 text-sm text-ink"
            />
          </div>
          <div>
            <label htmlFor="comp-web" className="mb-1 block text-xs font-semibold text-muted">
              Sitio web
            </label>
            <input
              id="comp-web"
              type="url"
              value={form.website}
              onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
              placeholder="https://..."
              className="w-full rounded-xl border border-mist bg-canvas px-3.5 py-2.5 text-sm text-ink"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="comp-dept" className="mb-1 block text-xs font-semibold text-muted">
              Departamento
            </label>
            <select
              id="comp-dept"
              value={departmentId}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full rounded-xl border border-mist bg-canvas px-3 py-2.5 text-sm text-ink"
            >
              <option value="">Selecciona departamento</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="comp-muni" className="mb-1 block text-xs font-semibold text-muted">
              Municipio
            </label>
            <select
              id="comp-muni"
              value={form.municipalityId}
              onChange={(e) => setForm((p) => ({ ...p, municipalityId: e.target.value }))}
              className="w-full rounded-xl border border-mist bg-canvas px-3 py-2.5 text-sm text-ink"
            >
              <option value="">Selecciona municipio</option>
              {municipalities.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="comp-address" className="mb-1 block text-xs font-semibold text-muted">
            Dirección física
          </label>
          <input
            id="comp-address"
            type="text"
            value={form.address}
            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            className="w-full rounded-xl border border-mist bg-canvas px-3.5 py-2.5 text-sm text-ink"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios de empresa'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default OperatorSettings
