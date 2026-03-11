/**
 * Prompt engineering — builds the Gemini image generation prompt.
 *
 * The prompt does two things in one call:
 *  1. Uses the FULL verse to shape the background scene (style-aware)
 *  2. Asks Gemini to render a glassmorphism card with the verse
 *     truncated to 25 words + the GodSpeaks.com watermark
 *
 * Sharp compositing is no longer needed — Gemini handles the full layout.
 */

import type { Verse } from "./verse";

// ─── Style system ─────────────────────────────────────────────────────────────

export type ImageStyle =
    | "gothic-clay"
    | "cinematic"
    | "sketch"
    | "mystic-fight"
    | "surreal"
    | "oil-painting";

export const IMAGE_STYLES: ImageStyle[] = [
    "gothic-clay",
    "cinematic",
    "sketch",
    "mystic-fight",
    "surreal",
    "oil-painting",
];

/** Human-readable display labels for the UI */
export const STYLE_LABELS: Record<ImageStyle, { en: string; fr: string }> = {
    "gothic-clay":  { en: "Gothic Clay",   fr: "Argile Gothique" },
    "cinematic":    { en: "Cinematic",      fr: "Cinématique"     },
    "sketch":       { en: "Sketch",         fr: "Esquisse"        },
    "mystic-fight": { en: "Mystic Fight",   fr: "Combat Mystique" },
    "surreal":      { en: "Surreal",        fr: "Surréaliste"     },
    "oil-painting": { en: "Oil Painting",   fr: "Peinture à l'Huile" },
};

/** Gemini scene descriptor injected into the background prompt per style */
const STYLE_DESCRIPTORS: Record<ImageStyle, string> = {
    "gothic-clay":  "surrealistic Gothic clay sculpture style, dark cathedral atmosphere, intricate clay textures, dramatic volumetric lighting",
    "cinematic":    "cinematic photography, dramatic golden-hour lighting, anamorphic lens flare, shallow depth of field, 35mm film grain, hyper-realistic",
    "sketch":       "detailed pencil and ink sketch, fine cross-hatching, expressive line art, monochrome with soft sepia wash, hand-drawn texture",
    "mystic-fight": "dynamic celestial battle scene, divine energy beams, glowing sacred auras, warriors of light, explosive spiritual composition",
    "surreal":      "Salvador Dali-inspired surrealism, dreamlike impossible landscape, melting sacred architecture, vivid otherworldly colors, metaphysical atmosphere",
    "oil-painting": "classical oil painting, impasto brushwork, rich warm Rembrandt palette, chiaroscuro dramatic lighting, old masters museum quality",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Truncate to a maximum number of words, appending "…" if cut */
export function truncateWords(text: string, maxWords: number): string {
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text.trim();
    return words.slice(0, maxWords).join(" ") + "…";
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

/**
 * Build the full Gemini image prompt.
 *
 * @param verse  The verse object — full text is used for scene generation,
 *               a 25-word truncation is used inside the glassmorphism card.
 * @param style  Visual style for the background scene. Defaults to "gothic-clay".
 */
export function buildImagenPrompt(verse: Verse, style: ImageStyle = "gothic-clay"): string {
    const cardText   = truncateWords(verse.text, 25);
    const styleDesc  = STYLE_DESCRIPTORS[style];

    return [
        `A stunning [SCENE representing the following verse: "${verse.text} - ${verse.reference}"] as the full background, ${styleDesc}, high resolution 1080x1080.`,

        `Centered in the middle of the image, a frosted glass card (glassmorphism style) with soft rounded corners, semi-transparent white/grey background with a subtle blur effect and a thin white border.`,
        `Inside the card, a large decorative double quotation mark "❝" in white on the top-left.`,
        `The following quote in clean white sans-serif font, max 25 words, with 2–3 key words in bold: "${cardText} - ${verse.reference}"`,

        `At the very bottom center of the image, near the lower edge, the text GODSpeaks.com — where "GOD" is in bold blue (#1A73E8) and "Speaks.com" is in bold white, clean modern font, slightly spaced.`,

        `Overall mood: peaceful, spiritual, inspirational. No watermarks, no extra UI elements.`,
    ].join("\n");
}
