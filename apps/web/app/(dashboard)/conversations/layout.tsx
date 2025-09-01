import { ConversationsLayout } from '@/modules/dashboard/ui/layouts/conversations-layout';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <ConversationsLayout>{children}</ConversationsLayout>;
}
