'use client';

import { AuthLayout } from '@/modules/auth/ui/layouts/auth-layout';
import { OrgSelectionView } from '@/modules/auth/ui/views/org-selection-view';
import { useOrganization } from '@clerk/nextjs';
import { ReactNode } from 'react';

export const OrganizationGuard = ({ children }: { children: ReactNode }) => {
  const { organization } = useOrganization();

  if (!organization) {
    return (
      <AuthLayout>
        <OrgSelectionView />
      </AuthLayout>
    );
  }

  return <>{children}</>;
};
