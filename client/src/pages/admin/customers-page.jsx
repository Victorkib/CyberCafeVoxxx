import AdminLayout from './admin-layout';
import { Customers } from './custom/customers';

export default function CustomersPage() {
  return (
    <AdminLayout activePage="/admin/customers">
      <Customers />
    </AdminLayout>
  );
}
