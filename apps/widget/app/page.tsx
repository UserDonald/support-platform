import { WidgetView } from '@/modules/widget/ui/views/widget-view';
import { Suspense } from 'react';

interface Props {
  searchParams: Promise<{ organizationId: string }>;
}

export default async function Page(props: Props) {
  return (
    <Suspense>
      <SuspendedComponent {...props} />
    </Suspense>
  );
}

async function SuspendedComponent({ searchParams }: Props) {
  const { organizationId } = await searchParams;

  return <WidgetView organizationId={organizationId} />;
}
