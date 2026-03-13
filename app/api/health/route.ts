/**
 * GET /api/health
 * Lightweight liveness check — no external calls, instant response.
 * Returns configuration state and API surface summary.
 */

import { NextResponse } from "next/server";

export async function GET() {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    return NextResponse.json(
        {
            status:    "ok",
            timestamp: new Date().toISOString(),
            backend:   "convex",
            services: {
                convex: {
                    url:  convexUrl || "not configured",
                    note: convexUrl ? "Self-hosted Convex backend" : "NEXT_PUBLIC_CONVEX_URL not set",
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
                "Convex action generate:create": "Generate a spiritual image from a random verse (primary)",
                "GET /api/health": "This endpoint",
            },
        },
        {
            status: 200,
            headers: { "Cache-Control": "no-store" },
        }
    );
}
