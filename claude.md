# GodSpeaks — Project Constitution

> This file is LAW. It defines schemas, rules, and architecture. Updated only when schemas change, rules are added, or architecture is modified.

---

## Project Identity
- **Name:** GodSpeaks
- **Phase:** Phase 1 (Blueprint — awaiting approval)
- **Created:** 2026-03-08
- **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind CSS

---

## Data Schema

### Input (User Request)
```json
{
  "source": "bible | quran",
  "language": "en | fr",
  "style": "gothic-clay | cinematic | sketch | mystic-fight | surreal | oil-painting  (optional, default: gothic-clay)"
}
```

### Verse (Normalized Internal Shape)
```json
{
  "text": "string",
  "reference": "string (e.g. 'Psalms 48:11' or 'Al-Anfaal 8:20')",
  "source": "bible | quran",
  "language": "en | fr"
}
```

### Imagen Prompt
```json
{
  "prompt": "string (derived from verse themes — serene, sacred, golden light)",
  "negativePrompt": "dark, violent, blood, war, destruction, horror, gore",
  "resolution": "1024x1024"
}
```

### Output (Generated Image)
```json
{
  "imageBuffer": "Buffer (PNG, 1024x1024)",
  "mimeType": "image/png",
  "verse": "Verse object"
}
```

---

## Behavioral Rules

1. **Tone:** Always serene, sacred, uplifting — no dark or violent imagery regardless of verse content
2. **Language:** EN and FR supported; affects both verse text and UI labels
3. **Bible translations:** KJV (EN) / Louis Segond (FR)
4. **Quran translations:** Muhammad Asad `en.asad` (EN) / Hamidullah `fr.hamidullah` (FR)
5. **Watermark:** "GodSpeaks" — subtle, low opacity (~15-20%), bottom center of image
6. **Access:** Public (no auth). Architecture supports future auth gate via NextAuth middleware
7. **Image prompt:** Derived from verse themes/mood. Never literal depiction of prophets or sacred figures
8. **Stateless:** No database, no user accounts. Every generation is independent
9. **API keys:** Server-side only. Never exposed to client

---

## Architectural Invariants

1. LLMs are probabilistic; business logic must be deterministic
2. All API calls happen in Next.js API routes (server-side only)
3. Temporary files go in `.tmp/` — never committed
4. API keys live in `.env` — never committed
5. If logic changes, update the SOP in `architecture/` before updating code
6. A project is only "Complete" when it's deployed and publicly accessible
7. Image compositing uses Sharp + SVG — no node-canvas dependency
8. Verse fetching is abstracted through a unified `Verse` interface

---

## API Endpoints

| Source | Language | Endpoint | Auth |
|--------|----------|----------|------|
| Bible | EN (KJV) | `bible-api.com/data/kjv/random` | None |
| Bible | FR (Louis Segond) | `api.scripture.api.bible/v1/...` | API key |
| Quran | EN (Asad) | `api.alquran.cloud/v1/ayah/random/en.asad` | None |
| Quran | FR (Hamidullah) | `api.alquran.cloud/v1/ayah/random/fr.hamidullah` | None |
| Image | — | Gemini `gemini-3.1-flash-image-preview` | API key |

---

## Maintenance Log

_Empty. Will be populated in Phase 5._
