import AdminLayout from './admin-layout';
import { Products } from './custom/dashboard';

export default function ProductsPage() {
  return (
    <AdminLayout activePage="/admin/products">
      <Products />
    </AdminLayout>
  );
}
