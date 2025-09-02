import { ConversationIdView } from '@/modules/dashboard/ui/views/conversation-id-view';
import { Id } from '@workspace/backend/_generated/dataModel';
import { Suspense } from 'react';

interface Props {
  params: Promise<{ conversationId: string }>;
}

export default function Page(props: Props) {
  return (
    <Suspense>
      <SuspendedComponent {...props} />
    </Suspense>
  );
}

async function SuspendedComponent({ params }: Props) {
  const { conversationId } = await params;

  return (
    <ConversationIdView
      conversationId={conversationId as Id<'conversations'>}
    />
  );
}
