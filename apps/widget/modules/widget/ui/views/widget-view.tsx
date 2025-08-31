'use client';

import { screenAtom } from '@/modules/widget/atoms/widget-atoms';
import { WidgetAuthScreen } from '@/modules/widget/ui/screens/widget-auth-screen';
import { WidgetErrorScreen } from '@/modules/widget/ui/screens/widget-error-screen';
import { WidgetLoadingScreen } from '@/modules/widget/ui/screens/widget-loading-screen';
import { WidgetSelectionScreen } from '@/modules/widget/ui/screens/widget-selection-screen';
import { useAtomValue } from 'jotai';
import { WidgetChatScreen } from '../screens/widget-chat-screen';

interface Props {
  organizationId: string | null;
}

export const WidgetView = ({ organizationId }: Props) => {
  const screen = useAtomValue(screenAtom);

  const screenComponents = {
    loading: <WidgetLoadingScreen organizationId={organizationId} />,
    error: <WidgetErrorScreen />,
    auth: <WidgetAuthScreen />,
    selection: <WidgetSelectionScreen />,
    chat: <WidgetChatScreen />,
    voice: <p>TODO: Voice</p>,
    inbox: <p>TODO: Inbox</p>,
    contact: <p>TODO: Contact</p>,
  };

  return (
    // TODO: Confirm if min-h-screen and min-w-screen is needed
    <main className="min-h-screen min-w-screen flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
      {screenComponents[screen]}
    </main>
  );
};
