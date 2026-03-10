/**
 * Shared API error types and factory helpers.
 * All API routes use these to guarantee a consistent error envelope:
 *
 *   { "error": { "code": "INVALID_SOURCE", "message": "...", "requestId": "..." } }
 */

export type ErrorCode =
    | "MISSING_FIELD"
    | "INVALID_SOURCE"
    | "INVALID_LANGUAGE"
    | "GENERATION_FAILED"
    | "INTERNAL_ERROR";

export interface ApiError {
    code: ErrorCode;
    message: string;
    field?: string;     // present for field-level validation errors
    requestId?: string; // present when a requestId was assigned
}

export interface ApiErrorResponse {
    error: ApiError;
}

/** Build a structured error payload */
export function makeError(
    code: ErrorCode,
    message: string,
    extras: { field?: string; requestId?: string } = {}
): ApiErrorResponse {
    return { error: { code, message, ...extras } };
}

/**
 * Sanitize an unknown thrown value into a client-safe message.
 * Strips internal details (API keys, URLs, stack traces).
 */
export function sanitizeError(err: unknown): string {
    if (!(err instanceof Error)) return "An unexpected error occurred";

    const msg = err.message;

    // Never expose API key quota messages, model names, or upstream URLs
    if (
        msg.includes("GEMINI_API_KEY") ||
        msg.includes("googleapis.com") ||
        msg.includes("RESOURCE_EXHAUSTED") ||
        msg.includes("quota")
    ) {
        return "Image generation is temporarily unavailable. Please try again later.";
    }

    if (msg.includes("ibibles.net")) {
        return "Scripture service is temporarily unavailable. Please try again.";
    }

    if (msg.includes("alquran.cloud")) {
        return "Quran service is temporarily unavailable. Please try again.";
    }

    return msg;
}
