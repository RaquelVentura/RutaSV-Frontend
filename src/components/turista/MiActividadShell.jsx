import { NavLink } from 'react-router-dom';
import Container from './Container';

const tabClass = ({ isActive }) =>
  `rounded-full px-[22px] py-[9px] text-[14px] ${
    isActive ? 'bg-[#087E9A] font-semibold text-white' : 'font-medium text-[#102F3B] hover:bg-[#E9F5F7]'
  }`;

export default function MiActividadShell({ userName = 'Ana', children }) {
  return (
    <Container className="flex flex-col gap-7 py-10 lg:px-24 xl:px-[144px]">
      <header className="flex flex-col gap-1.5">
        <p className="text-[12px] font-bold uppercase text-[#087E9A]">Tu colección de historias · Hola, {userName}</p>
        <h1 className="text-[30px] font-bold leading-[1.6] text-[#102F3B] sm:text-[36px]">Mi actividad</h1>
        <p className="text-[16px] leading-[1.6] text-[#637780]">
          Tus reservas y las experiencias que guardaste, en un solo lugar.
        </p>
      </header>

      <nav aria-label="Secciones de Mi actividad" className="flex w-fit gap-2 rounded-full border border-[#DFE8EB] bg-white p-1.5">
        <NavLink to="/turista/mi-actividad/reservas" className={tabClass}>
          Reservas
        </NavLink>
        <NavLink to="/turista/mi-actividad/favoritos" className={tabClass}>
          Favoritos
        </NavLink>
      </nav>

      {children}
    </Container>
  );
}
