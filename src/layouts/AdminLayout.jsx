import { Outlet } from 'react-router-dom'
import Container from '../components/Container.jsx'
import AdminHeader from '../components/admin/AdminHeader.jsx'

function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <AdminHeader />
      <main className="flex-1">
        <Container className="py-8">
          <Outlet />
        </Container>
      </main>
    </div>
  )
}

export default AdminLayout
