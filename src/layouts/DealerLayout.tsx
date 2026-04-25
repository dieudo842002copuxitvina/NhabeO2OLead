import { Outlet } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import PortalLayout from './PortalLayout';
import DealerSidebar from '@/components/sidebars/DealerSidebar';

export default function DealerLayout() {
  return (
    <ProtectedRoute allowedRoles={['dealer', 'admin']}>
      <PortalLayout sidebar={<DealerSidebar />} title="Cổng Đại lý">
        <Outlet />
      </PortalLayout>
    </ProtectedRoute>
  );
}
