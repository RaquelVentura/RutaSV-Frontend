
import { NavLink, Outlet } from 'react-router-dom'
import Container from '../../components/Container.jsx'

function TouristDashboard() {
  const modules = [


    { name: 'Explorar', path: '/turista/explorar' },
    { name: 'Reservar', path: '/turista/reservas' },
    { name: 'Actividad', path: '/turista/actividad' },
  ]

  return (
    <Container className="py-8">

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-ink">
          Panel del turista
        </h1>
        <p className="text-gray-500 mt-2">
          Administra tu experiencia en RutaSV.
        </p>
      </header>

      {/* Navegación principal */}
      <nav className="flex flex-wrap gap-3 mb-8">
        {modules.map((module) => (
          <NavLink
            key={module.path}
            to={module.path}
            className={({ isActive }) =>
              `rounded-xl px-5 py-3 font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`
            }
          >
            {module.name}
          </NavLink>
        ))}
      </nav>



      {/* Aquí aparecen las vistas hijas */}
      <section>
        <Outlet />
      </section>


    </Container>
    
  

)
}

export default TouristDashboard
