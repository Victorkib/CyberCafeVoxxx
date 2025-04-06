import AdminLayout from './admin-layout';
import { Orders } from './custom/dashboard';

export default function OrdersPage() {
  return (
    <AdminLayout activePage="/admin/orders">
      <Orders />
    </AdminLayout>
  );
}
