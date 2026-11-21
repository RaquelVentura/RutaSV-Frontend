import { Link } from 'react-router-dom';
import Container from './Container';

export default function TuristaFooter() {
  return (
    <footer className="bg-[#102F3B] text-[12px] leading-[1.45] text-[#C2D5DC]">
      <Container className="flex flex-col items-center gap-3 py-7 text-center md:flex-row md:justify-between">
        <Link to="/" className="text-[22px] font-extrabold text-white">
          RutaSV
        </Link>
        <p>© 2026 RutaSV · Hecho en El Salvador</p>
        <p className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <span>Ayuda</span>
          <span>Privacidad</span>
          <span>Términos</span>
          <span>ES / EN · USD</span>
        </p>
      </Container>
    </footer>
  );
}
