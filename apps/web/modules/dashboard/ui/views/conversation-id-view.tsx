'use client';

import { ConversationStatusButton } from '@/modules/dashboard/ui/components/conversation-status-button';
import { toUIMessages, useThreadMessages } from '@convex-dev/agent/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@workspace/backend/_generated/api';
import { Doc, Id } from '@workspace/backend/_generated/dataModel';
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from '@workspace/ui/components/ai/conversation';
import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from '@workspace/ui/components/ai/input';
import {
  AIMessage,
  AIMessageContent,
} from '@workspace/ui/components/ai/message';
import { AIResponse } from '@workspace/ui/components/ai/response';
import { Button } from '@workspace/ui/components/button';
import { DicebearAvatar } from '@workspace/ui/components/dicebear-avatar';
import { Form, FormField } from '@workspace/ui/components/form';
import { InifiniteScrollTrigger } from '@workspace/ui/components/infinite-scroll-trigger';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useInfiniteScroll } from '@workspace/ui/hooks/use-infinite-scroll';
import { cn } from '@workspace/ui/lib/utils';
import { useAction, useMutation, useQuery } from 'convex/react';
import { MoreHorizontalIcon, Wand2Icon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

export const ConversationIdView = ({
  conversationId,
}: {
  conversationId: Id<'conversations'>;
}) => {
  const conversation = useQuery(api.private.conversations.getOne, {
    conversationId,
  });

  const messages = useThreadMessages(
    api.private.messages.getMany,
    conversation?.threadId ? { threadId: conversation.threadId } : 'skip',
    { initialNumItems: 5 }
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } =
    useInfiniteScroll({
      status: messages.status,
      loadMore: messages.loadMore,
      loadSize: 4,
      observerEnabled: false,
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  const [isEnhancing, setIsEnhancing] = useState(false);
  const enhanceResponse = useAction(api.private.messages.enhanceResponse);
  const handleEnhancedResponse = async () => {
    setIsEnhancing(true);
    const currentValue = form.getValues('message');

    try {
      const response = await enhanceResponse({ prompt: currentValue });

      form.setValue('message', response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const createMessage = useMutation(api.private.messages.create);
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await createMessage({
        conversationId,
        prompt: data.message,
      });

      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const updateConversationStatus = useMutation(
    api.private.conversations.updateStatus
  );
  const handleToggleStatus = async () => {
    if (!conversation) return;

    setIsUpdatingStatus(true);

    let newStatus: Doc<'conversations'>['status'];

    if (conversation.status === 'unresolved') {
      newStatus = 'escalated';
    } else if (conversation.status === 'escalated') {
      newStatus = 'resolved';
    } else {
      newStatus = 'unresolved';
    }

    try {
      await updateConversationStatus({
        conversationId,
        status: newStatus,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (conversation === undefined || messages.status === 'LoadingFirstPage') {
    return <ConversationIdViewLoading />;
  }

  return (
    <div className="flex h-full flex-col bg-muted">
      <header className="flex items-center justify-between border-b bg-background p-2.5">
        <Button size="sm" variant="ghost">
          <MoreHorizontalIcon />
        </Button>
        {!!conversation && (
          <ConversationStatusButton
            onClick={handleToggleStatus}
            status={conversation?.status}
            disabled={isUpdatingStatus}
          />
        )}
      </header>
      <AIConversation className="max-h-[calc(100vh-180px)]">
        <AIConversationContent>
          <InifiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
          {toUIMessages(messages.results ?? [])?.map((message) => (
            <AIMessage
              from={message.role === 'user' ? 'assistant' : 'user'}
              key={message.id}
            >
              <AIMessageContent>
                <AIResponse>{message.content}</AIResponse>
              </AIMessageContent>
              {message.role === 'user' && (
                <DicebearAvatar
                  seed={conversation?.contactSessionId ?? 'user'}
                  size={38}
                />
              )}
            </AIMessage>
          ))}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>
      <Form {...form}>
        <AIInput
          onSubmit={form.handleSubmit(onSubmit)}
          className="rounded-none border-x-0 border-b-0"
        >
          <FormField
            control={form.control}
            disabled={conversation?.status === 'resolved'}
            name="message"
            render={({ field }) => (
              <AIInputTextarea
                disabled={
                  conversation?.status === 'resolved' ||
                  form.formState.isSubmitting ||
                  isEnhancing
                }
                onChange={field.onChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)();
                  }
                }}
                placeholder={
                  conversation?.status === 'resolved'
                    ? 'This conversation has been resolved.'
                    : 'Type your response as an operator...'
                }
                value={field.value}
              />
            )}
          />
          <AIInputToolbar>
            <AIInputTools>
              <AIInputButton
                disabled={
                  conversation?.status === 'resolved' ||
                  isEnhancing ||
                  !form.formState.isValid
                }
                onClick={handleEnhancedResponse}
              >
                <Wand2Icon />
                {isEnhancing ? 'Enhancing...' : 'Enhance'}
              </AIInputButton>
            </AIInputTools>
            <AIInputSubmit
              disabled={
                conversation?.status === 'resolved' ||
                !form.formState.isValid ||
                form.formState.isSubmitting ||
                isEnhancing
              }
              status="ready"
              type="submit"
            />
          </AIInputToolbar>
        </AIInput>
      </Form>
    </div>
  );
};

export const ConversationIdViewLoading = () => {
  return (
    <div className="flex h-full flex-col bg-muted">
      <header className="flex items-center justify-between border-b bg-background p-2.5">
        <Button size="sm" variant="ghost">
          <MoreHorizontalIcon />
        </Button>
      </header>
      <AIConversation className="max-h-[calc(100vh-180px)]">
        <AIConversationContent>
          {Array.from({ length: 8 }, (_, index) => {
            const isUser = index % 2 === 0;
            const widths = ['w-48', 'w-60', 'w-72'];
            const width = widths[index % widths.length];

            return (
              <div
                className={cn(
                  'group flex w-full items-end justify-end gap-2 py-2 [&>div]:max-w-[80%]',
                  isUser ? 'is-user' : 'is-assistant flex-row-reverse'
                )}
                key={index}
              >
                <Skeleton
                  className={`h-9 ${width} rounded-lg bg-neutral-200`}
                />
                <Skeleton className={`size-8 rounded-full bg-neutral-200`} />
              </div>
            );
          })}
        </AIConversationContent>
      </AIConversation>
      <AIInput className="rounded-none border-x-0 border-b-0">
        <AIInputTextarea
          disabled
          placeholder="Type your response as an operator..."
        />
        <AIInputToolbar>
          <AIInputTools />
          <AIInputSubmit disabled status="ready" />
        </AIInputToolbar>
      </AIInput>
    </div>
  );
};
