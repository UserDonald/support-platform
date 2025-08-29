import { DashboardLayout } from '@/modules/dashboard/ui/layouts/dashboard-layout';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
