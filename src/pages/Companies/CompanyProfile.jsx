import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ExperienceCard from '../../components/ExperienceCard.jsx'
import { extractApiError, getCompanyProfile, resolveAssetUrl } from '../../lib/catalogApi.js'
import { formatDuration } from '../../lib/formatters.js'

function CompanyProfile() {
  const { slug } = useParams()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setErrorMessage('')
      try {
        const data = await getCompanyProfile(slug)
        if (!cancelled) setCompany(data)
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(extractApiError(error, 'No se encontró el perfil de esta empresa.').message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className="w-full space-y-6 px-6 py-10">
        <div className="h-36 animate-pulse rounded-2xl bg-surface" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-ink">Empresa no encontrada</h1>
        <p className="mt-2 text-sm text-muted">{errorMessage}</p>
        <Link
          to="/experiencias"
          className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
        >
          Explorar experiencias
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full space-y-10 px-6 py-8">
      <section className="rounded-2xl border border-mist bg-surface p-7">
        <div className="flex flex-wrap items-start gap-6">
          {company.logoUrl ? (
            <img
              src={resolveAssetUrl(company.logoUrl)}
              alt={company.tradeName}
              className="size-20 rounded-2xl border border-mist object-cover"
            />
          ) : (
            <div className="grid size-20 place-items-center rounded-2xl bg-info-soft text-2xl font-bold text-brand">
              {company.tradeName?.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-brand">
              Operador verificado en RutaSV
            </p>
            <h1 className="text-3xl font-bold text-ink">{company.tradeName}</h1>
            {(company.municipalityName || company.address) && (
              <p className="text-sm text-muted">
                {[company.address, company.municipalityName, company.departmentName]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
            {company.description && (
              <p className="max-w-3xl text-sm leading-relaxed text-muted">
                {company.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-ink">
              {company.contactEmail && <span>✉ {company.contactEmail}</span>}
              {company.contactPhone && <span>☎ {company.contactPhone}</span>}
              {company.whatsapp && <span>WhatsApp: {company.whatsapp}</span>}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand underline"
                >
                  Sitio web
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="experiencias" className="space-y-5">
        <h2 className="text-2xl font-bold text-ink">
          Experiencias publicadas ({company.experiences?.length ?? 0})
        </h2>
        {!company.experiences || company.experiences.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-mist bg-surface p-8 text-center text-sm text-muted">
            Esta empresa aún no tiene experiencias publicadas.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {company.experiences.map((exp) => (
              <ExperienceCard
                key={exp.id}
                slug={exp.slug}
                image={exp.coverImageUrl}
                location={`${exp.municipalityName}, ${exp.departmentName}`}
                rating={exp.averageRating}
                title={exp.title}
                details={`${formatDuration(exp.durationMinutes)} · ${exp.shortDescription}`}
                price={exp.price}
                spots={exp.hasLimitedCapacity ? exp.maxPeople : 'Abierto'}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default CompanyProfile
