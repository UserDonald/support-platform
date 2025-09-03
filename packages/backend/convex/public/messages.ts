import { saveMessage } from '@convex-dev/agent';
import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { components, internal } from '../_generated/api';
import { action, query } from '../_generated/server';
import { supportAgent } from '../system/ai/agents/supportAgent';
import { escalateConversation } from '../system/ai/tools/escalateConversation';
import { resolveConversation } from '../system/ai/tools/resolveConversation';

export const create = action({
  args: {
    prompt: v.string(),
    threadId: v.string(),
    contactSessionId: v.id('contactSessions'),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.runQuery(
      internal.system.contactSessions.getOne,
      {
        contactSessionId: args.contactSessionId,
      }
    );

    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Invalid session',
      });
    }

    const conversation = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      {
        threadId: args.threadId,
      }
    );

    if (!conversation) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Conversation not found',
      });
    }

    if (conversation.status === 'resolved') {
      throw new ConvexError({
        code: 'BAD_REQUEST',
        message: 'Conversation resolved',
      });
    }

    // TODO: Implement subscription check
    const shouldTriggerAgent = conversation.status === 'unresolved';

    if (shouldTriggerAgent) {
      await supportAgent.generateText(
        ctx,
        { threadId: args.threadId },
        {
          prompt: args.prompt,
          tools: { escalateConversation, resolveConversation },
        }
      );
    } else {
      await saveMessage(ctx, components.agent, {
        threadId: args.threadId,
        prompt: args.prompt,
      });
    }
  },
});

export const getMany = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    contactSessionId: v.id('contactSessions'),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);

    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Invalid session',
      });
    }

    const paginated = await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });

    return paginated;
  },
});
