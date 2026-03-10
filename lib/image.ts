/**
 * Image generation + compositing.
 * 1. Calls Gemini to generate the background scene
 * 2. Uses Sharp + SVG to overlay verse text and watermark
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

    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildImagenPrompt(verse);

    // Use generateContent with IMAGE modality (not generateImages which is Imagen-only/paid)
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: prompt,
        config: {
            responseModalities: ["IMAGE", "TEXT"],
        },
    });

    // Extract image from response parts
    if (!response.candidates || response.candidates.length === 0) {
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

// ─── Text Wrapping Helper ───────────────────────────────────────────────────

function wrapText(text: string, maxChars: number): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
        if ((currentLine + " " + word).trim().length > maxChars) {
            if (currentLine) lines.push(currentLine.trim());
            currentLine = word;
        } else {
            currentLine += " " + word;
        }
    }
    if (currentLine.trim()) lines.push(currentLine.trim());

    return lines;
}

// ─── SVG Escape ─────────────────────────────────────────────────────────────

function escapeXml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

// ─── Compositing ────────────────────────────────────────────────────────────

export async function compositeImage(
    background: Buffer,
    verse: Verse
): Promise<Buffer> {
    // Wrap verse text to fit the image
    const maxCharsPerLine = 45;
    const verseLines = wrapText(verse.text, maxCharsPerLine);
    const refLine = `— ${verse.reference}`;

    const fontSize = 28;
    const lineHeight = 38;
    const refFontSize = 22;
    const watermarkFontSize = 16;

    // Calculate text block height
    const textBlockHeight =
        verseLines.length * lineHeight + 60 + 40; // verse + ref + padding
    const textBlockY = SIZE - textBlockHeight - 80; // Position toward bottom

    // Build SVG overlay
    const verseTextSvg = verseLines
        .map(
            (line, i) =>
                `<text x="512" y="${textBlockY + i * lineHeight}" text-anchor="middle" font-family="'Georgia', 'Times New Roman', serif" font-size="${fontSize}" fill="white" filter="url(#shadow)">${escapeXml(line)}</text>`
        )
        .join("\n    ");

    const refY = textBlockY + verseLines.length * lineHeight + 45;
    const watermarkY = SIZE - 30;

    const svgOverlay = `
  <svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.8"/>
      </filter>
      <linearGradient id="bottomFade" x1="0" y1="0.5" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0)" />
        <stop offset="100%" stop-color="rgba(0,0,0,0.7)" />
      </linearGradient>
    </defs>

    <!-- Bottom gradient overlay for text readability -->
    <rect x="0" y="${SIZE * 0.4}" width="${SIZE}" height="${SIZE * 0.6}" fill="url(#bottomFade)" />

    <!-- Verse text -->
    ${verseTextSvg}

    <!-- Reference -->
    <text x="512" y="${refY}" text-anchor="middle" font-family="'Georgia', 'Times New Roman', serif" font-size="${refFontSize}" fill="#D4AF37" font-style="italic" filter="url(#shadow)">${escapeXml(refLine)}</text>

    <!-- Watermark -->
    <text x="512" y="${watermarkY}" text-anchor="middle" font-family="'Inter', 'Helvetica', sans-serif" font-size="${watermarkFontSize}" fill="white" opacity="0.2" letter-spacing="4">GODSPEAKS</text>
  </svg>`;

    // Compose with sharp
    const overlayBuffer = Buffer.from(svgOverlay);

    const composited = await sharp(background)
        .resize(SIZE, SIZE, { fit: "cover" })
        .composite([
            {
                input: overlayBuffer,
                top: 0,
                left: 0,
            },
        ])
        .png({ quality: 95 })
        .toBuffer();

    return composited;
}
