import AdminLayout from './admin-layout';
import Dashboard from './custom/dashboard';

export default function AdminPage() {
  return (
    <AdminLayout activePage="/admin">
      <Dashboard />
    </AdminLayout>
  );
}
