import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  generations: defineTable({
    source: v.union(v.literal("bible"), v.literal("quran")),
    language: v.union(v.literal("en"), v.literal("fr")),
    style: v.string(),
    verseText: v.string(),
    verseReference: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("pending"),
      v.literal("complete"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
  }).index("by_status", ["status"]),
});
