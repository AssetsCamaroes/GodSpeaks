/**
 * Prompt engineering — converts verse text into safe, serene Imagen prompts.
 * Tone guardrails: always sacred, uplifting, golden — never dark or violent.
 */

import type { Verse } from "./verse";

const STYLE_ANCHORS = [
    "ethereal golden light",
    "sacred atmosphere",
    "photorealistic",
    "cinematic composition",
    "deep depth of field",
    "volumetric rays",
    "serene and peaceful",
    "majestic landscape",
    "warm tones",
    "divine radiance",
];

const NEGATIVE_CONSTRAINTS =
    "No dark themes, no violence, no blood, no war, no destruction, no horror, no gore, no weapons, no skulls, no fire and brimstone, no demons, no hellscape";

/**
 * Builds a safe, beautiful image prompt from a verse.
 * Extracts thematic imagery from the verse and wraps it in serene style anchors.
 */
export function buildImagenPrompt(verse: Verse): string {
    // Pick 4 random style anchors for variety
    const shuffled = [...STYLE_ANCHORS].sort(() => Math.random() - 0.5);
    const styleSlice = shuffled.slice(0, 4).join(", ");

    // Core prompt: verse-inspired scenic description
    const prompt = [
        `A breathtaking spiritual scene inspired by: "${verse.text.slice(0, 200)}"`,
        `Capture the essence and mood of this ${verse.source === "bible" ? "biblical" : "Quranic"} passage.`,
        `Style: ${styleSlice}.`,
        `The image should evoke reverence, hope, and transcendence.`,
        `Ultra-high quality, 8K detail, natural lighting.`,
        NEGATIVE_CONSTRAINTS,
    ].join(" ");

    return prompt;
}
