import { Outlet } from 'react-router-dom';
import TuristaNavbar from '../components/turista/TuristaNavbar';
import TuristaFooter from '../components/turista/TuristaFooter';

export default function TuristaLayout({ user }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] font-sans text-[#102F3B]">
      <TuristaNavbar user={user} />
      <main className="flex-1">
        <Outlet />
      </main>
      <TuristaFooter />
    </div>
  );
}
