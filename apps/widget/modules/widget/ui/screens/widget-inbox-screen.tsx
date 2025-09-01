'use client';

import {
  contactSessionIdAtomFamily,
  conversationIdAtom,
  organizationIdAtom,
  screenAtom,
} from '@/modules/widget/atoms/widget-atoms';
import { WidgetFooter } from '@/modules/widget/ui/components/widget-footer';
import { WidgetHeader } from '@/modules/widget/ui/components/widget-header';
import { api } from '@workspace/backend/_generated/api';
import { Button } from '@workspace/ui/components/button';
import { ConversationStatusIcon } from '@workspace/ui/components/conversation-status-icon';
import { InifiniteScrollTrigger } from '@workspace/ui/components/infinite-scroll-trigger';
import { useInfiniteScroll } from '@workspace/ui/hooks/use-infinite-scroll';
import { usePaginatedQuery } from 'convex/react';
import { formatDistanceToNow } from 'date-fns';
import { useAtomValue, useSetAtom } from 'jotai';
import { ArrowLeftIcon } from 'lucide-react';

export const WidgetInboxScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setConversation = useSetAtom(conversationIdAtom);

  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || '')
  );

  const conversations = usePaginatedQuery(
    api.public.conversations.getMany,
    contactSessionId
      ? {
          contactSessionId,
        }
      : 'skip',
    { initialNumItems: 5 }
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } =
    useInfiniteScroll({
      status: conversations.status,
      loadMore: conversations.loadMore,
      loadSize: 2,
      observerEnabled: false,
    });

  return (
    <>
      <WidgetHeader>
        <div className="flex items-center gap-x-2">
          <Button
            size="icon"
            variant="transparent"
            onClick={() => setScreen('selection')}
          >
            <ArrowLeftIcon />
          </Button>
          <p>Chat</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col gap-y-2 p-4 overflow-y-auto">
        {conversations?.results.length > 0 &&
          conversations?.results.map((conversation) => (
            <Button
              className="h-20 w-full justify-between"
              key={conversation._id}
              onClick={() => {
                setConversation(conversation._id);
                setScreen('chat');
              }}
              variant="outline"
            >
              <div className="flex w-full flex-col gap-4 overflow-hidden text-start">
                <div className="flex w-full items-center justify-between gap-x-2">
                  <p className="text-muted-foreground text-xs">Chat</p>
                  <p className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(conversation._creationTime))}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between gap-x-2">
                  <p className="truncate text-sm">
                    {conversation.lastMessage?.text}
                  </p>
                  <ConversationStatusIcon
                    status={conversation.status}
                    className="shrink-0"
                  />
                </div>
              </div>
            </Button>
          ))}
        <InifiniteScrollTrigger
          canLoadMore={canLoadMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
          ref={topElementRef}
        />
      </div>
      <WidgetFooter />
    </>
  );
};
