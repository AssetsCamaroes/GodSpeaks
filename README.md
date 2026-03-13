# GodSpeaks

**AI-powered spiritual image generation from sacred scriptures.**

GodSpeaks generates stunning, one-of-a-kind images from random Bible and Quran verses using Google Gemini. Each image combines a verse-inspired scene with a glassmorphism card overlay, rendered in one of six artistic styles. Fully bilingual (English & French), mobile-first, and built for serenity.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Generation Pipeline](#generation-pipeline)
- [Image Styles](#image-styles)
- [Scripture Sources](#scripture-sources)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Design System](#design-system)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Sacred verse discovery** — Random verses from Bible (KJV / Louis Segond) and Quran (Asad / Hamidullah)
- **AI image generation** — Google Gemini 2.5 Flash renders complete scenes with verse overlay in a single call
- **6 artistic styles** — Gothic Clay, Cinematic, Sketch, Mystic Fight, Surreal, Oil Painting
- **Bilingual UI** — Full English and French support for interface labels and verse sources
- **Persistent history** — Convex backend stores every generation with verse metadata and image
- **Mobile-first** — Touch-optimized, safe-area aware, responsive typography via `clamp()`
- **SEO-ready** — Open Graph image, sitemap, robots.txt, PWA manifest
- **Download** — One-click PNG download of generated images
- **Serene by design** — Peaceful, uplifting imagery regardless of verse content

---

## Architecture

```
Client (Next.js 15 + React 19)
  │
  │  useAction(api.generate.create)
  ▼
Convex Action ("use node" runtime)
  │
  ├── fetchRandomVerse() ──► ibibles.net (Bible) / alquran.cloud (Quran)
  │
  ├── buildImagenPrompt() ──► Style-aware prompt with verse context
  │
  ├── Google Gemini 2.5 Flash ──► 1024x1024 PNG (scene + card + watermark)
  │
  ├── ctx.storage.store() ──► Convex file storage
  │
  └── mutation: update record ──► generations table (status: "complete")
  │
  ▼
Client receives { verse, imageUrl, style } ──► Renders image + metadata
```

**Key architectural decisions:**
- Gemini renders the entire image in one call (background scene, glassmorphism card, verse text, watermark) — no server-side compositing needed
- Business logic is deterministic; only image generation is probabilistic
- All external API calls run in Convex actions (server-side), never in the client
- Bible verses use weighted random selection across all 31,102 verses for fair distribution

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript 5 (strict) |
| Backend | Convex (self-hosted via Docker) |
| Image AI | Google Gemini 2.5 Flash |
| Image Processing | Sharp 0.34 (resize/encode) |
| Font | Cormorant Garamond (Google Fonts) |
| SEO | Next.js metadata API, OG image generation |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for self-hosted Convex)
- Google Gemini API key (paid tier with image generation access)

### 1. Clone & Install

```bash
git clone https://github.com/AssetsCamaroes/GodSpeaks.git
cd GodSpeaks
npm install
```

### 2. Start Convex (Self-Hosted)

Run the Convex backend and dashboard via Docker:

```bash
docker run -d --name convex-backend \
  -p 3210:3210 \
  ghcr.io/get-convex/convex-backend

docker run -d --name convex-dashboard \
  -p 6791:6791 \
  ghcr.io/get-convex/convex-dashboard
```

Generate an admin key:

```bash
docker exec convex-backend ./generate_admin_key.sh
```

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CONVEX_SELF_HOSTED_URL=http://127.0.0.1:3210
CONVEX_SELF_HOSTED_ADMIN_KEY=<output from step 2>
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
```

Set the Gemini key in Convex:

```bash
npx convex env set GEMINI_API_KEY your_gemini_api_key
```

### 4. Deploy Convex Functions

```bash
npx convex dev
```

This syncs the schema, actions, and queries to your local Convex backend.

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **"Receive a Verse"**.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key (set in Convex env + `.env.local`) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical URL for SEO (OG tags, sitemap, robots.txt) |
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Convex backend URL |
| `CONVEX_SELF_HOSTED_URL` | Yes* | Self-hosted Convex backend URL (*not needed for Convex Cloud) |
| `CONVEX_SELF_HOSTED_ADMIN_KEY` | Yes* | Self-hosted admin key (*not needed for Convex Cloud) |

---

## Project Structure

```
GodSpeaks/
├── app/
│   ├── page.tsx                  # Main UI — verse generation interface
│   ├── layout.tsx                # Root layout with SEO metadata + ConvexProvider
│   ├── ConvexClientProvider.tsx  # Convex React client wrapper
│   ├── globals.css               # Design tokens, animations, mobile styles
│   ├── opengraph-image.tsx       # Dynamic OG image (1200x630)
│   ├── robots.ts                 # SEO robots directives
│   ├── sitemap.ts                # XML sitemap
│   ├── manifest.ts               # PWA manifest
│   └── api/
│       ├── generate/route.ts     # Legacy REST endpoint (POST → image)
│       └── health/route.ts       # Liveness check
├── convex/
│   ├── schema.ts                 # Database schema (generations table)
│   ├── generate.ts               # Main action: verse → Gemini → store
│   ├── generations.ts            # Mutations (store, update) + list query
│   └── lib/
│       ├── verse.ts              # Verse fetching (Bible + Quran APIs)
│       └── prompt.ts             # Gemini prompt builder + style system
├── lib/
│   ├── verse.ts                  # Verse fetching (Next.js API route copy)
│   ├── image.ts                  # Gemini image generation + Sharp resize
│   ├── prompt.ts                 # Prompt builder (Next.js API route copy)
│   └── errors.ts                 # Error codes + sanitization
├── .env.example                  # Environment variable template
├── package.json
├── tsconfig.json
├── next.config.ts
└── CLAUDE.md                     # Project constitution & rules
```

---

## Generation Pipeline

```
1. User selects    →  Source (Bible/Quran) + Language (EN/FR) + Style
2. Click button    →  useAction(api.generate.create) fires
3. Pending record  →  Convex mutation creates { status: "pending" }
4. Fetch verse     →  Random verse from ibibles.net or alquran.cloud
5. Build prompt    →  Style-aware multi-line prompt with full verse context
6. Gemini call     →  gemini-2.5-flash-image → 1024x1024 PNG
7. Store image     →  Convex file storage (ctx.storage.store)
8. Update record   →  { status: "complete", imageStorageId, verseText, ... }
9. Return result   →  { generationId, verse, imageUrl, style }
10. Render          →  Image displayed with verse text + download button
```

---

## Image Styles

| Style | Description |
|-------|-------------|
| **Gothic Clay** | Surrealistic Gothic clay sculpture, dark cathedral atmosphere, dramatic volumetric lighting |
| **Cinematic** | Cinematic photography, golden-hour lighting, anamorphic lens flare, 35mm film grain |
| **Sketch** | Pencil and ink sketch, fine cross-hatching, monochrome with soft sepia wash |
| **Mystic Fight** | Celestial battle scene, divine energy beams, glowing sacred auras, warriors of light |
| **Surreal** | Dali-inspired surrealism, dreamlike impossible landscape, melting sacred architecture |
| **Oil Painting** | Classical oil painting, impasto brushwork, rich Rembrandt palette, chiaroscuro lighting |

Each style includes a full Gemini descriptor that guides scene composition, lighting, and texture. The default style is **Gothic Clay**.

---

## Scripture Sources

| Source | Language | Provider | Translation | Auth |
|--------|----------|----------|-------------|------|
| Bible | English | ibibles.net | King James Version (KJV) | None |
| Bible | French | ibibles.net | Louis Segond (LSG) | None |
| Quran | English | alquran.cloud | Muhammad Asad (`en.asad`) | None |
| Quran | French | alquran.cloud | Hamidullah (`fr.hamidullah`) | None |

**Bible verse selection:** Weighted random across all 31,102 verses (66 books, 1,189 chapters). Each verse has equal probability of being selected, regardless of book or chapter size.

---

## API Reference

### Convex Actions

#### `api.generate.create`

Generate a spiritual image from a random verse.

**Input:**
```typescript
{
  source: "bible" | "quran",       // Required
  language: "en" | "fr",           // Required
  style?: ImageStyle               // Optional, defaults to "gothic-clay"
}
```

**Returns:**
```typescript
{
  generationId: Id<"generations">,
  verse: { text: string, reference: string, source: string, language: string },
  imageUrl: string,                // Convex serving URL
  style: string
}
```

### Convex Queries

#### `api.generations.list`

Fetch the 20 most recent generations with resolved image URLs.

**Returns:** `Array<Generation & { imageUrl: string | null }>`

### REST Endpoints (Legacy)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/generate` | Self-documenting API schema |
| `POST` | `/api/generate` | Generate image (returns PNG with `X-Verse-*` headers) |
| `GET` | `/api/health` | Liveness check with service configuration |

---

## Database Schema

### `generations` table

| Field | Type | Description |
|-------|------|-------------|
| `source` | `"bible" \| "quran"` | Scripture source |
| `language` | `"en" \| "fr"` | Verse language |
| `style` | `string` | Image style used |
| `verseText` | `string` | Full verse text |
| `verseReference` | `string` | Reference (e.g., "Psalms 48:11") |
| `imageStorageId` | `Id<"_storage">?` | Convex file storage reference |
| `status` | `"pending" \| "complete" \| "failed"` | Generation state |
| `errorMessage` | `string?` | Error details (failed only) |
| `_creationTime` | `number` | Auto-generated timestamp |

**Index:** `by_status` on `status` field.

---

## Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--gold` | `#C8A45A` | Primary accent, borders, interactive states |
| `--gold-bright` | `#E2C07A` | Hover states, highlights |
| `--gold-dim` | `#8A6E32` | Subtle accents, scrollbar |
| `--ink` | `#0C0906` | Background |
| `--ink-warm` | `#120E09` | Card backgrounds |
| `--parchment` | `#F0E6CC` | Primary text |
| `--parchment-dim` | `#A89A7E` | Secondary text |

### Typography

- **Primary font:** Cormorant Garamond (serif)
- **Fallback:** Georgia, Times New Roman, serif
- **Responsive sizing:** `clamp()` functions throughout (no breakpoints)

### Animations

| Class | Effect | Duration |
|-------|--------|----------|
| `.animate-fade-up` | Slide up 16px + fade in | 0.9s |
| `.animate-fade-up-delay` | Same, delayed 0.15s | 0.9s |
| `.animate-fade-in` | Fade in | 0.7s |
| `.shimmer` | Loading shimmer | 1.8s loop |
| `.spin` | Continuous rotation | 1.6s loop |

---

## Deployment

### Production Build

```bash
npm run build
npm run start
```

### Convex Cloud (Alternative to Self-Hosted)

Replace self-hosted Docker setup with Convex Cloud:

1. Create a project at [convex.dev](https://www.convex.dev)
2. Set `NEXT_PUBLIC_CONVEX_URL` to your Convex Cloud URL
3. Remove `CONVEX_SELF_HOSTED_*` variables
4. Deploy functions: `npx convex deploy`

### Checklist

- [ ] Set `GEMINI_API_KEY` in Convex environment
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Verify Convex functions are deployed
- [ ] Add PWA icons (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`)

---

## Contributing

1. Create a feature branch from `main`
2. Follow existing code patterns and naming conventions
3. Keep changes incremental (Kaizen philosophy)
4. Open a PR with a clear description and test plan

---

## License

Private. All rights reserved.
