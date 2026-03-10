/**
 * POST /api/generate
 * Generates a spiritual image from a random verse.
 *
 * Body: { source: "bible" | "quran", language: "en" | "fr" }
 * Returns: PNG image buffer
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchRandomVerse } from "@/lib/verse";
import { generateBackground, compositeImage } from "@/lib/image";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { source, language } = body;

        // Validate input
        if (!["bible", "quran"].includes(source)) {
            return NextResponse.json(
                { error: "source must be 'bible' or 'quran'" },
                { status: 400 }
            );
        }
        if (!["en", "fr"].includes(language)) {
            return NextResponse.json(
                { error: "language must be 'en' or 'fr'" },
                { status: 400 }
            );
        }

        // 1. Fetch random verse
        const verse = await fetchRandomVerse(source, language);

        // 2. Generate AI background
        const background = await generateBackground(verse);

        // 3. Composite text + watermark
        const finalImage = await compositeImage(background, verse);

        // 4. Return image with metadata headers
        return new NextResponse(new Uint8Array(finalImage), {
            status: 200,
            headers: {
                "Content-Type": "image/png",
                "Content-Disposition": `inline; filename="godspeaks-${source}-${language}.png"`,
                "X-Verse-Text": encodeURIComponent(verse.text.slice(0, 200)),
                "X-Verse-Reference": encodeURIComponent(verse.reference),
                "X-Verse-Source": verse.source,
                "X-Verse-Language": verse.language,
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("[/api/generate] Error:", error);
        const message =
            error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
