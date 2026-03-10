/**
 * Prompt engineering — builds the Gemini image generation prompt.
 *
 * The prompt does two things in one call:
 *  1. Uses the FULL verse to shape the background scene
 *  2. Asks Gemini to render a glassmorphism card with the verse
 *     truncated to 25 words + the GodSpeaks.com watermark
 *
 * Sharp compositing is no longer needed — Gemini handles the full layout.
 */

import type { Verse } from "./verse";

/** Truncate to a maximum number of words, appending "…" if cut */
export function truncateWords(text: string, maxWords: number): string {
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text.trim();
    return words.slice(0, maxWords).join(" ") + "…";
}

/**
 * Build the full Gemini image prompt.
 *
 * @param verse  The verse object — full text is used for scene generation,
 *               a 25-word truncation is used inside the glassmorphism card.
 */
export function buildImagenPrompt(verse: Verse): string {
    const cardText = truncateWords(verse.text, 25);

    return [
        `A stunning [SCENE representing the following verse: "${verse.text} - ${verse.reference}"] as the full background, surrealistic Gothic clay style, cinematic lighting, high resolution 1080x1080.`,

        `Centered in the middle of the image, a frosted glass card (glassmorphism style) with soft rounded corners, semi-transparent white/grey background with a subtle blur effect and a thin white border.`,
        `Inside the card, a large decorative double quotation mark "❝" in white on the top-left.`,
        `The following quote in clean white sans-serif font, max 25 words, with 2–3 key words in bold: "${cardText} - ${verse.reference}"`,

        `At the very bottom center of the image, near the lower edge, the text GODSpeaks.com — where "GOD" is in bold blue (#1A73E8) and "Speaks.com" is in bold white, clean modern font, slightly spaced.`,

        `Overall mood: peaceful, spiritual, inspirational. No watermarks, no extra UI elements.`,
    ].join("\n");
}
