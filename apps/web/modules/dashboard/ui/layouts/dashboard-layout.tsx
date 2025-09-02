import { AuthGuard } from '@/modules/auth/ui/components/auth-guard';
import { OrganizationGuard } from '@/modules/auth/ui/components/organization-guard';
import { DashboardSidebar } from '@/modules/dashboard/ui/components/dashboard-sidebar';
import { SidebarProvider } from '@workspace/ui/components/sidebar';
import { Provider as JotaiProvider } from 'jotai/react';
import { cookies } from 'next/headers';
import { ReactNode } from 'react';

export const DashboardLayout = async ({
  children,
}: {
  children: ReactNode;
}) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <AuthGuard>
      <OrganizationGuard>
        <JotaiProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <DashboardSidebar />
            <main className="flex flex-1 flex-col">{children}</main>
          </SidebarProvider>
        </JotaiProvider>
      </OrganizationGuard>
    </AuthGuard>
  );
};
