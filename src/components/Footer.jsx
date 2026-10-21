import { Link } from 'react-router-dom'

const columns = [
  {
    title: 'Descubre',
    items: [
      { label: 'Experiencias', to: '/experiencias' },
      { label: 'Destinos' },
      { label: 'Guías locales' },
    ],
  },
  {
    title: 'Comunidad',
    items: [
      { label: 'Publicar experiencia', to: '/solicitar-operador' },
      { label: 'Turismo responsable' },
      { label: 'Sobre RutaSV' },
    ],
  },
  {
    title: 'Te acompañamos',
    items: [
      { label: 'Centro de ayuda' },
      { label: 'Contacto' },
      { label: 'Preguntas frecuentes' },
    ],
  },
]

const itemClass = 'text-sm text-white/75'

function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="text-2xl font-extrabold">RutaSV</p>
            <p className="mt-3 max-w-xs text-sm text-white/75">
              Un país pequeño. Historias enormes. Conecta con quienes hacen de
              El Salvador un lugar único.
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold">{column.title}</p>
              <ul className="mt-4 space-y-3">
                {column.items.map((item) => (
                  <li key={item.label}>
                    {item.to ? (
                      <Link to={item.to} className={`${itemClass} hover:text-white`}>
                        {item.label}
                      </Link>
                    ) : (
                      <span className={itemClass}>{item.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-white/15 pt-6 text-xs text-white/70">
          <p>© {new Date().getFullYear()} RutaSV · Hecho en El Salvador</p>
          <p>Privacidad · Términos</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
