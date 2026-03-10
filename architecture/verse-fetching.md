# SOP: Verse Fetching

## Purpose
Retrieve a random scripture verse from 4 different API endpoints based on source and language.

## Endpoints

| Key | API | Endpoint | Auth |
|-----|-----|----------|------|
| `bible:en` | bible-api.com | `GET /data/kjv/random` | None |
| `bible:fr` | api.scripture.api.bible | Multi-step (books → chapters → verses → verse) | `api-key` header |
| `quran:en` | api.alquran.cloud | `GET /v1/ayah/random/en.asad` | None |
| `quran:fr` | api.alquran.cloud | `GET /v1/ayah/random/fr.hamidullah` | None |

## Normalized Output

```typescript
interface Verse {
  text: string;       // Clean verse text, trimmed, no HTML
  reference: string;  // e.g. "Psalms 48:11" or "Al-Anfaal 8:20"
  source: "bible" | "quran";
  language: "en" | "fr";
}
```

## Bible FR Special Flow
Louis Segond requires 4 sequential API calls:
1. List all books → pick random book
2. List chapters for book → pick random chapter
3. List verses for chapter → pick random verse
4. Fetch verse content as plaintext

## Data Cleaning
- Quran EN (Asad): Strip `[bracketed annotations]` from translation
- Bible FR: Strip any residual HTML tags from content
- All: Trim whitespace, normalize multiple spaces

## Rate Limits
- bible-api.com: Soft limits, free
- api.scripture.api.bible: 5,000 queries/day
- api.alquran.cloud: No documented limits

## Error Handling
- Network failure: throw with descriptive message
- 404/400: throw with API name and status code
- Missing SCRIPTURE_API_KEY: throw "SCRIPTURE_API_KEY not set in .env"
