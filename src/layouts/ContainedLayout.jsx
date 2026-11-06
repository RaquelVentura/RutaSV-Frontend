import { Outlet } from 'react-router-dom'

// Contenedor centrado para las pantallas que no usan secciones a todo el ancho (login, registro, 404...).
export default function ContainedLayout() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <Outlet />
    </div>
  )
}
