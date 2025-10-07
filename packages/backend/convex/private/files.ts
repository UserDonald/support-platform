import {
  contentHashFromArrayBuffer,
  guessMimeTypeFromContents,
  guessMimeTypeFromExtension,
  vEntryId,
} from '@convex-dev/rag';
import { ConvexError, v } from 'convex/values';
import { Id } from '../_generated/dataModel';
import { action, mutation } from '../_generated/server';
import { extractTextContent } from '../lib/extractTextContent';
import rag from '../system/ai/rag';

function guessMimeType(fileName: string, bytes: ArrayBuffer): string {
  return (
    guessMimeTypeFromExtension(fileName) ||
    guessMimeTypeFromContents(bytes) ||
    'application/octet-stream'
  );
}

export const deleteFile = mutation({
  args: {
    entryId: vEntryId,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Identity not found',
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Organization not found',
      });
    }

    const namespace = await rag.getNamespace(ctx, {
      namespace: orgId,
    });

    if (!namespace) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Invalid namespace',
      });
    }

    const entry = await rag.getEntry(ctx, {
      entryId: args.entryId,
    });

    if (!entry) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Entry not found',
      });
    }

    if (entry.metadata?.uploadedBy !== orgId) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Invalid Organization ID',
      });
    }

    if (entry.metadata?.storageId) {
      await ctx.storage.delete(entry.metadata.storageId as Id<'_storage'>);
    }

    await rag.deleteAsync(ctx, {
      entryId: args.entryId,
    });
  },
});

export const addFiles = action({
  args: {
    fileName: v.string(),
    mimeType: v.string(),
    bytes: v.bytes(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Identity not found',
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Organization not found',
      });
    }

    const { bytes, fileName, category } = args;

    const mimeType = args.mimeType || guessMimeType(fileName, bytes);
    const blob = new Blob([bytes], { type: mimeType });

    const storageId = await ctx.storage.store(blob);

    const text = await extractTextContent(ctx, {
      storageId,
      fileName,
      bytes,
      mimeType,
    });

    const { entryId, created } = await rag.add(ctx, {
      namespace: orgId,
      text,
      key: fileName,
      title: fileName,
      metadata: {
        storageId,
        uploadedBy: orgId,
        fileName,
        category: category ?? null,
      },
      contentHash: await contentHashFromArrayBuffer(bytes),
    });

    if (!created) {
      console.debug('Entry already exist, skipping upload metadata');
      await ctx.storage.delete(storageId);
    }

    return {
      url: await ctx.storage.getUrl(storageId),
      entryId,
    };
  },
});
