import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";

// ─── Internal Mutations (called from actions) ────────────────────────────────

export const store = internalMutation({
  args: {
    source: v.union(v.literal("bible"), v.literal("quran")),
    language: v.union(v.literal("en"), v.literal("fr")),
    style: v.string(),
    verseText: v.string(),
    verseReference: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("complete"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generations", {
      ...args,
      imageStorageId: undefined,
      errorMessage: undefined,
    });
  },
});

export const updateComplete = internalMutation({
  args: {
    id: v.id("generations"),
    verseText: v.string(),
    verseReference: v.string(),
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "complete",
      verseText: args.verseText,
      verseReference: args.verseReference,
      imageStorageId: args.imageStorageId,
    });
  },
});

export const updateFailed = internalMutation({
  args: {
    id: v.id("generations"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "failed",
      errorMessage: args.errorMessage,
    });
  },
});

// ─── Public Queries ──────────────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    const generations = await ctx.db
      .query("generations")
      .order("desc")
      .take(20);

    return Promise.all(
      generations.map(async (gen) => ({
        ...gen,
        imageUrl: gen.imageStorageId
          ? await ctx.storage.getUrl(gen.imageStorageId)
          : null,
      }))
    );
  },
});
