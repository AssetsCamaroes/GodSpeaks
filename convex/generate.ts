"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { GoogleGenAI } from "@google/genai";
import { fetchRandomVerse } from "./lib/verse";
import { buildImagenPrompt, IMAGE_STYLES, type ImageStyle } from "./lib/prompt";

async function generateImage(
  verse: { text: string; reference: string; source: string; language: string },
  style: ImageStyle,
  apiKey: string
): Promise<Buffer> {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildImagenPrompt(verse as any, style);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
    config: { responseModalities: ["IMAGE", "TEXT"] },
  });

  if (!response.candidates?.length) {
    throw new Error("Gemini returned no candidates");
  }

  const parts = response.candidates[0].content?.parts;
  if (!parts) throw new Error("Gemini response has no parts");

  for (const part of parts) {
    if (part.inlineData?.data) {
      return Buffer.from(part.inlineData.data, "base64");
    }
  }

  throw new Error("Gemini response contained no image data");
}

export const create = action({
  args: {
    source: v.union(v.literal("bible"), v.literal("quran")),
    language: v.union(v.literal("en"), v.literal("fr")),
    style: v.optional(v.string()),
  },
  returns: v.object({
    generationId: v.string(),
    verse: v.object({
      text: v.string(),
      reference: v.string(),
      source: v.string(),
      language: v.string(),
    }),
    imageUrl: v.union(v.string(), v.null()),
    style: v.string(),
  }),
  handler: async (ctx, args) => {
    const style: ImageStyle =
      args.style && IMAGE_STYLES.includes(args.style as ImageStyle)
        ? (args.style as ImageStyle)
        : "gothic-clay";

    // 1. Create pending record
    const generationId = await ctx.runMutation(
      internal.generations.store,
      {
        source: args.source,
        language: args.language,
        style,
        verseText: "",
        verseReference: "",
        status: "pending" as const,
      }
    );

    try {
      // 2. Fetch random verse
      const verse = await fetchRandomVerse(args.source, args.language);

      // 3. Generate image via Gemini
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY not set");

      const imageBuffer = await generateImage(verse, style, apiKey);

      // 4. Store image in Convex file storage
      const blob = new Blob([imageBuffer], { type: "image/png" });
      const storageId = await ctx.storage.store(blob);

      // 5. Update record to complete
      await ctx.runMutation(internal.generations.updateComplete, {
        id: generationId,
        verseText: verse.text,
        verseReference: verse.reference,
        imageStorageId: storageId,
      });

      // 6. Get serving URL
      const imageUrl = await ctx.storage.getUrl(storageId);

      return {
        generationId,
        verse: {
          text: verse.text,
          reference: verse.reference,
          source: verse.source,
          language: verse.language,
        },
        imageUrl,
        style,
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      await ctx.runMutation(internal.generations.updateFailed, {
        id: generationId,
        errorMessage: message,
      });
      throw err;
    }
  },
});
