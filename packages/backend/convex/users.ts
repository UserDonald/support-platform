import { mutation, query } from './_generated/server';

export const getMany = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('users').collect();
  },
});

export const add = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.insert('users', {
      name: 'Donald',
    });
  },
});
