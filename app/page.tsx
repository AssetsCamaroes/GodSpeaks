"use client";

import { useState, useCallback } from "react";

type Source = "bible" | "quran";
type Language = "en" | "fr";

interface VerseMetadata {
  text: string;
  reference: string;
  source: Source;
  language: Language;
}

const LABELS = {
  en: {
    subtitle: "Divine verses, beautifully rendered",
    fromThe: "from the",
    generate: "Receive a Verse",
    generating: "Seeking wisdom…",
    download: "Save this Image",
    error: "Something went wrong. Please try again.",
    footer: "Each vision is uniquely woven by AI",
  },
  fr: {
    subtitle: "Versets divins, magnifiquement illustrés",
    fromThe: "tiré de",
    generate: "Recevoir un Verset",
    generating: "En quête de sagesse…",
    download: "Sauvegarder l'Image",
    error: "Une erreur est survenue. Réessayez.",
    footer: "Chaque vision est tissée de manière unique par l'IA",
  },
};

// ─── Decorative SVG Components ───────────────────────────────────────────────

const Ornament = ({ opacity = 1 }: { opacity?: number }) => (
  <svg
    width="200" height="14" viewBox="0 0 200 14" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
  >
    <line x1="0" y1="7" x2="76" y2="7" stroke="rgba(200,164,90,0.35)" strokeWidth="0.5" />
    <circle cx="84"  cy="7" r="1.5" fill="rgba(200,164,90,0.45)" />
    <circle cx="100" cy="7" r="3"   fill="rgba(200,164,90,0.65)" />
    <circle cx="116" cy="7" r="1.5" fill="rgba(200,164,90,0.45)" />
    <line x1="124" y1="7" x2="200" y2="7" stroke="rgba(200,164,90,0.35)" strokeWidth="0.5" />
  </svg>
);

const CornerFrame = ({ size = 18, flip = false }: { size?: number; flip?: boolean }) => {
  const s = flip ? -1 : 1;
  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={`M0 ${size} L0 0 L${size} 0`}
        stroke="rgba(200,164,90,0.55)"
        strokeWidth="1.5"
        transform={`scale(${s},1) translate(${flip ? -size : 0},0)`}
        fill="none"
      />
    </svg>
  );
};

const FrameCorners = ({ offset = -10 }: { offset?: number }) => (
  <>
    {/* top-left */}
    <div style={{ position: "absolute", top: offset, left: offset }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M0 22 L0 0 L22 0" stroke="rgba(200,164,90,0.65)" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
    {/* top-right */}
    <div style={{ position: "absolute", top: offset, right: offset }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M22 22 L22 0 L0 0" stroke="rgba(200,164,90,0.65)" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
    {/* bottom-left */}
    <div style={{ position: "absolute", bottom: offset, left: offset }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M0 0 L0 22 L22 22" stroke="rgba(200,164,90,0.65)" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
    {/* bottom-right */}
    <div style={{ position: "absolute", bottom: offset, right: offset }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M22 0 L22 22 L0 22" stroke="rgba(200,164,90,0.65)" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  </>
);

const StarGlyph = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="14" y1="0"  x2="14" y2="28" stroke="rgba(200,164,90,0.55)" strokeWidth="0.75" />
    <line x1="0"  y1="14" x2="28" y2="14" stroke="rgba(200,164,90,0.55)" strokeWidth="0.75" />
    <line x1="4"  y1="4"  x2="24" y2="24" stroke="rgba(200,164,90,0.28)" strokeWidth="0.5" />
    <line x1="24" y1="4"  x2="4"  y2="24" stroke="rgba(200,164,90,0.28)" strokeWidth="0.5" />
    <circle cx="14" cy="14" r="2.5" fill="rgba(200,164,90,0.8)" />
    <circle cx="14" cy="14" r="5"   stroke="rgba(200,164,90,0.2)" strokeWidth="0.5" fill="none" />
  </svg>
);

// ─── Spinner ─────────────────────────────────────────────────────────────────

const Spinner = () => (
  <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="rgba(200,164,90,0.25)" strokeWidth="2" />
    <path d="M12 2a10 10 0 0110 10" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [source, setSource]   = useState<Source>("bible");
  const [language, setLanguage] = useState<Language>("en");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [verse, setVerse]       = useState<VerseMetadata | null>(null);

  const t = LABELS[language];

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setImageUrl(null);
    setVerse(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, language }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed: ${res.status}`);
      }

      const verseText   = decodeURIComponent(res.headers.get("X-Verse-Text")     || "");
      const verseRef    = decodeURIComponent(res.headers.get("X-Verse-Reference") || "");
      const verseSource = (res.headers.get("X-Verse-Source")   || source)   as Source;
      const verseLang   = (res.headers.get("X-Verse-Language") || language) as Language;

      setVerse({ text: verseText, reference: verseRef, source: verseSource, language: verseLang });
      const blob = await res.blob();
      setImageUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setLoading(false);
    }
  }, [source, language, t.error]);

  const handleDownload = useCallback(() => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `godspeaks-${source}-${language}-${Date.now()}.png`;
    a.click();
  }, [imageUrl, source, language]);

  // ─── shared style tokens ────────────────────────────────────────────────
  const serif: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  };

  return (
    <main
      style={{
        ...serif,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "5rem 1.5rem",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="animate-fade-up" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <StarGlyph />
        </div>

        <h1
          style={{
            ...serif,
            fontSize: "clamp(4.5rem, 11vw, 8rem)",
            fontWeight: 300,
            letterSpacing: "0.18em",
            lineHeight: 1,
            color: "var(--parchment)",
            textTransform: "uppercase",
            marginBottom: "0.25rem",
          }}
        >
          God
          <em
            style={{
              fontStyle: "italic",
              fontWeight: 400,
              color: "var(--gold)",
              letterSpacing: "0.12em",
            }}
          >
            Speaks
          </em>
        </h1>

        <div style={{ display: "flex", justifyContent: "center", margin: "1.25rem 0" }}>
          <Ornament />
        </div>

        <p
          style={{
            ...serif,
            fontSize: "0.82rem",
            fontStyle: "italic",
            fontWeight: 300,
            color: "var(--parchment-dim)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          {t.subtitle}
        </p>
      </header>

      {/* ── Control Card ────────────────────────────────────────────────── */}
      <div
        className="animate-fade-up-delay"
        style={{ width: "100%", maxWidth: "420px", position: "relative" }}
      >
        <FrameCorners offset={-8} />

        <div
          style={{
            padding: "2.5rem 2.25rem",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Language toggle */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "2rem",
            }}
          >
            {(["en", "fr"] as Language[]).map((lang, i) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{
                  ...serif,
                  padding: "0.5rem 2rem",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  background: language === lang ? "rgba(200,164,90,0.1)" : "transparent",
                  color: language === lang ? "var(--gold-bright)" : "var(--parchment-dim)",
                  border: "1px solid var(--border)",
                  borderRight: i === 0 ? "none" : "1px solid var(--border)",
                }}
              >
                {lang === "en" ? "English" : "Français"}
              </button>
            ))}
          </div>

          {/* "from the" label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.875rem",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span
              style={{
                ...serif,
                fontSize: "0.68rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "var(--parchment-dim)",
                fontStyle: "italic",
              }}
            >
              {t.fromThe}
            </span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          {/* Source selector */}
          <div style={{ display: "flex", gap: "0.625rem", marginBottom: "2rem" }}>
            {(["bible", "quran"] as Source[]).map((s) => (
              <button
                key={s}
                onClick={() => setSource(s)}
                style={{
                  ...serif,
                  flex: 1,
                  padding: "0.85rem",
                  fontSize: "1.15rem",
                  fontWeight: source === s ? 500 : 300,
                  fontStyle: source === s ? "italic" : "normal",
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  background: source === s ? "rgba(200,164,90,0.09)" : "transparent",
                  color: source === s ? "var(--gold-bright)" : "var(--parchment-dim)",
                  border: `1px solid ${source === s ? "var(--border-active)" : "var(--border)"}`,
                }}
              >
                {s === "bible" ? (language === "fr" ? "Bible" : "Bible") : language === "fr" ? "Coran" : "Quran"}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
            <Ornament opacity={0.7} />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              ...serif,
              width: "100%",
              padding: "1.05rem",
              fontSize: "0.9rem",
              fontWeight: 400,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.4s ease",
              background: loading
                ? "transparent"
                : "linear-gradient(135deg, rgba(200,164,90,0.14), rgba(200,164,90,0.07))",
              color: loading ? "var(--parchment-dim)" : "var(--gold-bright)",
              border: `1px solid ${loading ? "var(--border)" : "var(--border-active)"}`,
              boxShadow: loading ? "none" : "0 0 28px rgba(200,164,90,0.1)",
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem" }}>
                <Spinner />
                {t.generating}
              </span>
            ) : (
              t.generate
            )}
          </button>
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && (
        <div
          className="animate-fade-in"
          style={{
            ...serif,
            marginTop: "2rem",
            padding: "1rem 1.5rem",
            maxWidth: "420px",
            width: "100%",
            border: "1px solid rgba(220,80,80,0.2)",
            background: "rgba(220,80,80,0.05)",
            color: "#E08080",
            fontSize: "0.95rem",
            fontStyle: "italic",
            textAlign: "center",
            letterSpacing: "0.03em",
          }}
        >
          {error}
        </div>
      )}

      {/* ── Loading Shimmer ──────────────────────────────────────────────── */}
      {loading && (
        <div
          className="shimmer"
          style={{
            marginTop: "3rem",
            width: "100%",
            maxWidth: "512px",
            aspectRatio: "1",
            border: "1px solid var(--border)",
          }}
        />
      )}

      {/* ── Image Result ─────────────────────────────────────────────────── */}
      {imageUrl && !loading && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: "3.5rem",
            width: "100%",
            maxWidth: "512px",
          }}
        >
          {/* Image with corner frame */}
          <div style={{ position: "relative" }}>
            <FrameCorners offset={-10} />
            <img
              src={imageUrl}
              alt={verse?.reference || "Generated spiritual image"}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                border: "1px solid rgba(200,164,90,0.18)",
              }}
            />
          </div>

          {/* Verse info */}
          {verse && (
            <div style={{ marginTop: "2.25rem", textAlign: "center", padding: "0 0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
                <Ornament />
              </div>
              <p
                style={{
                  ...serif,
                  fontSize: "1.2rem",
                  fontStyle: "italic",
                  fontWeight: 300,
                  lineHeight: 1.85,
                  color: "var(--parchment)",
                  marginBottom: "1rem",
                  letterSpacing: "0.02em",
                }}
              >
                &ldquo;{verse.text.slice(0, 160)}{verse.text.length > 160 ? "…" : ""}&rdquo;
              </p>
              <p
                style={{
                  ...serif,
                  fontSize: "0.8rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  fontWeight: 500,
                }}
              >
                — {verse.reference}
              </p>
            </div>
          )}

          {/* Download */}
          <button
            onClick={handleDownload}
            style={{
              ...serif,
              marginTop: "1.75rem",
              width: "100%",
              padding: "0.875rem",
              fontSize: "0.82rem",
              fontWeight: 400,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.3s ease",
              background: "transparent",
              color: "var(--gold)",
              border: "1px solid var(--border)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,164,90,0.4)";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(200,164,90,0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            {t.download}
          </button>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ marginTop: "5rem", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <Ornament opacity={0.5} />
        </div>
        <p
          style={{
            ...serif,
            fontSize: "0.72rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--parchment-dim)",
            fontStyle: "italic",
            opacity: 0.6,
          }}
        >
          {t.footer}
        </p>
      </footer>
    </main>
  );
}
