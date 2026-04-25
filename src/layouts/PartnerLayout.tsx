import { Outlet } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import PortalLayout from './PortalLayout';
import PartnerSidebar from '@/components/sidebars/PartnerSidebar';

export default function PartnerLayout() {
  return (
    <ProtectedRoute allowedRoles={['dealer', 'technician', 'admin']}>
      <PortalLayout sidebar={<PartnerSidebar />} title="Cổng Đối tác">
        <Outlet />
      </PortalLayout>
    </ProtectedRoute>
  );
}
