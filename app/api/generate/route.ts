/**
 * POST /api/generate
 *   Body:    { source: "bible" | "quran", language: "en" | "fr", style?: ImageStyle }
 *   Returns: PNG image (1024×1024) with verse metadata in response headers
 *
 * GET /api/generate
 *   Returns: API schema — inputs, outputs, allowed values (self-documenting)
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchRandomVerse } from "@/lib/verse";
import { generateBackground, compositeImage } from "@/lib/image";
import { makeError, sanitizeError } from "@/lib/errors";
import { IMAGE_STYLES, type ImageStyle } from "@/lib/prompt";

const ALLOWED_SOURCES   = ["bible", "quran"] as const;
const ALLOWED_LANGUAGES = ["en", "fr"]       as const;

type Source   = typeof ALLOWED_SOURCES[number];
type Language = typeof ALLOWED_LANGUAGES[number];

// ─── GET — API schema (self-documenting) ─────────────────────────────────────

export async function GET() {
    return NextResponse.json({
        endpoint:    "POST /api/generate",
        description: "Generate a spiritual image from a random scripture verse.",
        request: {
            method:      "POST",
            contentType: "application/json",
            body: {
                source:   { type: "string", required: true,  values: ALLOWED_SOURCES },
                language: { type: "string", required: true,  values: ALLOWED_LANGUAGES },
                style:    { type: "string", required: false, values: IMAGE_STYLES, default: "gothic-clay" },
            },
        },
        response: {
            success: {
                status:      200,
                contentType: "image/png",
                description: "1024×1024 PNG with verse text and watermark composited.",
                headers: {
                    "X-Request-Id":      "Unique ID for this request (use for support)",
                    "X-Verse-Text":      "URL-encoded verse text (first 200 chars)",
                    "X-Verse-Reference": "URL-encoded scripture reference",
                    "X-Verse-Source":    "'bible' or 'quran'",
                    "X-Verse-Language":  "'en' or 'fr'",
                    "X-Verse-Style":     "Image style used for generation",
                },
            },
            error: {
                status:      "4xx | 5xx",
                contentType: "application/json",
                shape:        "{ error: { code, message, requestId, field? } }",
                codes: {
                    MISSING_FIELD:    "A required body field was not provided",
                    INVALID_SOURCE:   "source must be 'bible' or 'quran'",
                    INVALID_LANGUAGE: "language must be 'en' or 'fr'",
                    INVALID_STYLE:    `style must be one of: ${IMAGE_STYLES.join(", ")}`,
                    GENERATION_FAILED:"Image generation pipeline failed",
                    INTERNAL_ERROR:   "Unexpected server-side error",
                },
            },
        },
    });
}

// ─── POST — generation pipeline ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
    const requestId = crypto.randomUUID();

    try {
        // ── Parse body ──────────────────────────────────────────────────────
        let body: Record<string, unknown>;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                makeError("INTERNAL_ERROR", "Request body must be valid JSON", { requestId }),
                { status: 400 }
            );
        }

        const { source, language, style } = body;

        // ── Validate: presence ──────────────────────────────────────────────
        if (source === undefined || source === null) {
            return NextResponse.json(
                makeError("MISSING_FIELD", "'source' is required", { field: "source", requestId }),
                { status: 400 }
            );
        }
        if (language === undefined || language === null) {
            return NextResponse.json(
                makeError("MISSING_FIELD", "'language' is required", { field: "language", requestId }),
                { status: 400 }
            );
        }

        // ── Validate: allowed values ────────────────────────────────────────
        if (!ALLOWED_SOURCES.includes(source as Source)) {
            return NextResponse.json(
                makeError(
                    "INVALID_SOURCE",
                    `'source' must be one of: ${ALLOWED_SOURCES.join(", ")}`,
                    { field: "source", requestId }
                ),
                { status: 400 }
            );
        }
        if (!ALLOWED_LANGUAGES.includes(language as Language)) {
            return NextResponse.json(
                makeError(
                    "INVALID_LANGUAGE",
                    `'language' must be one of: ${ALLOWED_LANGUAGES.join(", ")}`,
                    { field: "language", requestId }
                ),
                { status: 400 }
            );
        }

        // ── Validate: style (optional, defaults to "gothic-clay") ───────────
        const resolvedStyle: ImageStyle =
            style === undefined || style === null
                ? "gothic-clay"
                : (style as ImageStyle);

        if (style !== undefined && style !== null && !IMAGE_STYLES.includes(resolvedStyle)) {
            return NextResponse.json(
                makeError(
                    "INVALID_STYLE",
                    `'style' must be one of: ${IMAGE_STYLES.join(", ")}`,
                    { field: "style", requestId }
                ),
                { status: 400 }
            );
        }

        // ── Pipeline ────────────────────────────────────────────────────────
        const verse      = await fetchRandomVerse(source as Source, language as Language);
        const background = await generateBackground(verse, resolvedStyle);
        const finalImage = await compositeImage(background, verse);

        // ── Respond with image ──────────────────────────────────────────────
        return new NextResponse(new Uint8Array(finalImage), {
            status: 200,
            headers: {
                "Content-Type":        "image/png",
                "Content-Disposition": `inline; filename="godspeaks-${source}-${language}-${resolvedStyle}.png"`,
                "Cache-Control":       "no-store",
                "X-Request-Id":        requestId,
                "X-Verse-Text":        encodeURIComponent(verse.text.slice(0, 200)),
                "X-Verse-Reference":   encodeURIComponent(verse.reference),
                "X-Verse-Source":      verse.source,
                "X-Verse-Language":    verse.language,
                "X-Verse-Style":       resolvedStyle,
            },
        });

    } catch (err) {
        console.error(`[/api/generate] requestId=${requestId}`, err);

        const message = sanitizeError(err);

        return NextResponse.json(
            makeError("GENERATION_FAILED", message, { requestId }),
            { status: 500 }
        );
    }
}
