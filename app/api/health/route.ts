/**
 * GET /api/health
 * Lightweight liveness check — no external calls, instant response.
 * Returns configuration state and API surface summary.
 */

import { NextResponse } from "next/server";

export async function GET() {
    const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);

    return NextResponse.json(
        {
            status:    "ok",
            timestamp: new Date().toISOString(),
            services: {
                gemini: {
                    configured: geminiConfigured,
                    note:       geminiConfigured ? "API key present" : "GEMINI_API_KEY not set",
                },
                bible: {
                    provider: "ibibles.net",
                    auth:     "none",
                    versions: ["kjv", "lsg"],
                },
                quran: {
                    provider: "alquran.cloud",
                    auth:     "none",
                    editions: ["en.asad", "fr.hamidullah"],
                },
            },
            api: {
                "POST /api/generate": "Generate a spiritual image from a random verse",
                "GET  /api/generate": "API schema and documentation",
                "GET  /api/health":   "This endpoint",
            },
        },
        {
            status: 200,
            headers: { "Cache-Control": "no-store" },
        }
    );
}
