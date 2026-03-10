# GodSpeaks — Findings

> Research, discoveries, constraints, and learnings.

---

## API Research (2026-03-08)

### 1. bible-api.com (KJV — English)
- **Endpoint:** `GET https://bible-api.com/data/kjv/random`
- **Auth:** None
- **Response shape:**
```json
{
  "translation": { "identifier": "kjv", "name": "King James Version" },
  "random_verse": {
    "book_id": "PSA", "book": "Psalms",
    "chapter": 48, "verse": 11,
    "text": "Let mount Zion rejoice..."
  }
}
```
- **Rate limits:** Free with soft limits

### 2. api.scripture.api.bible (Louis Segond — French)
- **Base:** `https://api.scripture.api.bible/v1/`
- **Auth:** `api-key` header (free key from scripture.api.bible)
- **Flow:** Need to list bibles → find Louis Segond ID → fetch random verse
- **Rate limits:** 5,000 queries/day, 500 verses max per request
- **Constraint:** Requires registered API key

### 3. api.alquran.cloud (Quran — EN & FR)
- **English endpoint:** `GET https://api.alquran.cloud/v1/ayah/random/en.asad`
- **French endpoint:** `GET https://api.alquran.cloud/v1/ayah/random/fr.hamidullah`
- **Auth:** None
- **Response shape:**
```json
{
  "code": 200,
  "data": {
    "number": 1180,
    "text": "verse text here",
    "surah": { "number": 8, "englishName": "Al-Anfaal" },
    "numberInSurah": 20
  }
}
```

### 4. Gemini 3.1 Flash Image Preview
- **SDK:** `@google/genai` (npm)
- **Method:** `ai.models.generateImages()`
- **Model:** `gemini-3.1-flash-image-preview`
- **Resolution:** 1024×1024 (default 1K)
- **Cost:** ~$0.067/image (no free tier)
- **Key feature:** Image Search Grounding, native conversational image gen
- **Constraint:** API key must be server-side only

### 5. Image Compositing
- **Strategy:** Sharp + SVG overlay (no node-canvas dependency needed)
- **Text layer:** Generate SVG string with verse text + watermark → composite via `sharp.composite()`
- **Alternative:** node-canvas for complex typography, but SVG is lighter
