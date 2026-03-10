/**
 * Image generation + output.
 *
 * generateBackground() — calls Gemini with the full prompt (scene + card + watermark).
 *   Gemini now renders the glassmorphism card, verse text, and GodSpeaks.com branding
 *   directly into the image. No SVG compositing needed.
 *
 * compositeImage() — normalises the output to 1024×1024 PNG at consistent quality.
 */

import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import type { Verse } from "./verse";
import { buildImagenPrompt } from "./prompt";

const SIZE = 1024;

// ─── Background Generation ──────────────────────────────────────────────────

export async function generateBackground(verse: Verse): Promise<Buffer> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set in .env");

    const ai     = new GoogleGenAI({ apiKey });
    const prompt = buildImagenPrompt(verse); // uses full verse text

    const response = await ai.models.generateContent({
        model:    "gemini-2.5-flash-image",
        contents: prompt,
        config:   { responseModalities: ["IMAGE", "TEXT"] },
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

// ─── Output Normalisation ────────────────────────────────────────────────────
// The glassmorphism card, verse text, and watermark are now rendered by Gemini.
// This function only ensures a consistent 1024×1024 PNG output.

export async function compositeImage(
    background: Buffer,
    _verse: Verse   // kept for API compatibility; no longer used for compositing
): Promise<Buffer> {
    return sharp(background)
        .resize(SIZE, SIZE, { fit: "cover" })
        .png({ quality: 95 })
        .toBuffer();
}
