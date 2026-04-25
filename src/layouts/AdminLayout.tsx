import { Outlet } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import PortalLayout from './PortalLayout';
import AdminSidebar from '@/components/sidebars/AdminSidebar';

export default function AdminLayout() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'bi_viewer', 'ai_editor']}>
      <PortalLayout sidebar={<AdminSidebar />} title="Admin Console">
        <Outlet />
      </PortalLayout>
    </ProtectedRoute>
  );
}
