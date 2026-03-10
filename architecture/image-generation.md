# SOP: Image Generation Pipeline

## Purpose
Generate a 1024×1024 spiritual image from a random scripture verse.

## Pipeline Steps

### 1. Receive Request
- Input: `{ source: "bible" | "quran", language: "en" | "fr" }`
- Validate both fields

### 2. Fetch Random Verse
- Route to correct API based on `source:language` key
- Normalize into `Verse { text, reference, source, language }`

### 3. Build Imagen Prompt
- Extract themes from verse text (first 200 chars)
- Apply 4 randomized style anchors for variety
- Include negative constraints (no violence, no dark imagery)
- Tone: "serene, sacred, uplifting, golden light"

### 4. Generate Background
- SDK: `@google/genai` → `ai.models.generateImages()`
- Model: `gemini-3.1-flash-image-preview`
- Resolution: 1024×1024
- Returns: base64 image bytes → Buffer

### 5. Composite Text + Watermark
- Tool: Sharp + SVG overlay
- Elements:
  - Bottom gradient fade (40%-100% of image height, transparent → black 70%)
  - Verse text: white, Georgia/serif, centered, drop shadow
  - Reference: gold (#D4AF37), italic, below verse
  - Watermark: "GODSPEAKS", white at 20% opacity, letter-spaced, bottom center

### 6. Return PNG
- Content-Type: `image/png`
- Headers include verse metadata for frontend display

## Error Handling
- API timeout: log and return 500 with message
- Empty image from Gemini: retry once, then fail
- Missing API keys: return specific error message

## Cost
- ~$0.067 per image at 1024px resolution
- No free tier for Gemini 3.1 Flash Image Preview
