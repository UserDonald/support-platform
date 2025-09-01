import { ConversationsPanel } from '@/modules/dashboard/ui/components/conversations-panel';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@workspace/ui/components/resizable';
import { ReactNode } from 'react';

export const ConversationsLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ResizablePanelGroup className="h-full flex-1" direction="horizontal">
      <ResizablePanel defaultSize={30} maxSize={30} minSize={20}>
        <ConversationsPanel />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={70} className="h-full">
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
