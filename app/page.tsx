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
    title: "GodSpeaks",
    subtitle: "Divine verses, beautifully rendered",
    bible: "Bible",
    quran: "Quran",
    generate: "Generate",
    generating: "Creating your image…",
    download: "Download PNG",
    error: "Something went wrong. Try again.",
    footer: "Each image is uniquely generated with AI",
  },
  fr: {
    title: "GodSpeaks",
    subtitle: "Versets divins, magnifiquement illustrés",
    bible: "Bible",
    quran: "Coran",
    generate: "Générer",
    generating: "Création de votre image…",
    download: "Télécharger PNG",
    error: "Une erreur est survenue. Réessayez.",
    footer: "Chaque image est générée de manière unique par l'IA",
  },
};

export default function Home() {
  const [source, setSource] = useState<Source>("bible");
  const [language, setLanguage] = useState<Language>("en");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verse, setVerse] = useState<VerseMetadata | null>(null);

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

      const verseText = decodeURIComponent(res.headers.get("X-Verse-Text") || "");
      const verseRef = decodeURIComponent(res.headers.get("X-Verse-Reference") || "");
      const verseSource = (res.headers.get("X-Verse-Source") || source) as Source;
      const verseLang = (res.headers.get("X-Verse-Language") || language) as Language;

      setVerse({
        text: verseText,
        reference: verseRef,
        source: verseSource,
        language: verseLang,
      });

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div
        className="absolute top-[-30%] left-[-15%] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute bottom-[-25%] right-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 65%)",
        }}
      />

      {/* Header */}
      <header className="text-center mb-12 relative z-10 animate-fade-in">
        <h1
          className="text-6xl md:text-7xl font-bold tracking-tight mb-4"
          style={{
            fontFamily: "'Playfair Display', serif",
            background: "linear-gradient(135deg, #F5D76E 0%, #D4AF37 40%, #B8941F 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t.title}
        </h1>
        <p
          className="text-base md:text-lg tracking-wide"
          style={{ color: "var(--text-secondary)", letterSpacing: "0.05em" }}
        >
          {t.subtitle}
        </p>
      </header>

      {/* Control Card */}
      <div
        className="w-full max-w-[420px] p-8 rounded-3xl border relative z-10 animate-fade-in"
        style={{
          background: "linear-gradient(145deg, rgba(26,26,26,0.9) 0%, rgba(17,17,17,0.95) 100%)",
          backdropFilter: "blur(24px)",
          borderColor: "rgba(212, 175, 55, 0.12)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* Language Toggle */}
        <div className="flex items-center justify-center mb-8">
          <div
            className="flex rounded-full p-1 gap-1"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {(["en", "fr"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className="px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer"
                style={{
                  background: language === lang
                    ? "linear-gradient(135deg, #D4AF37, #B8941F)"
                    : "transparent",
                  color: language === lang ? "#0A0A0A" : "var(--text-muted)",
                  fontWeight: language === lang ? 600 : 400,
                }}
              >
                {lang === "en" ? "English" : "Français"}
              </button>
            ))}
          </div>
        </div>

        {/* Source Selector */}
        <div className="flex gap-3 mb-8">
          {(["bible", "quran"] as Source[]).map((s) => (
            <button
              key={s}
              onClick={() => setSource(s)}
              className="flex-1 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 border cursor-pointer"
              style={{
                background: source === s ? "rgba(212, 175, 55, 0.08)" : "rgba(255,255,255,0.02)",
                borderColor: source === s ? "rgba(212, 175, 55, 0.5)" : "rgba(255, 255, 255, 0.06)",
                color: source === s ? "#F5D76E" : "var(--text-secondary)",
                fontWeight: source === s ? 500 : 400,
              }}
            >
              {s === "bible" ? t.bible : t.quran}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div
          className="mb-8"
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.15) 50%, transparent 100%)",
          }}
        />

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-4 rounded-xl text-base font-semibold transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
          style={{
            background: loading
              ? "var(--surface-lighter)"
              : "linear-gradient(135deg, #B8941F 0%, #D4AF37 40%, #F5D76E 100%)",
            color: loading ? "var(--text-muted)" : "#0A0A0A",
            boxShadow: loading
              ? "none"
              : "0 4px 24px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
            letterSpacing: "0.03em",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t.generating}
            </span>
          ) : (
            t.generate
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mt-8 px-6 py-4 rounded-2xl text-sm max-w-[420px] text-center animate-fade-in"
          style={{
            background: "rgba(220, 50, 50, 0.08)",
            border: "1px solid rgba(220, 50, 50, 0.2)",
            color: "#FF6B6B",
          }}
        >
          {error}
        </div>
      )}

      {/* Loading Shimmer */}
      {loading && (
        <div className="mt-10 w-full max-w-[512px] aspect-square rounded-2xl shimmer" />
      )}

      {/* Image Result */}
      {imageUrl && !loading && (
        <div className="mt-10 w-full max-w-[512px] animate-fade-in">
          {/* Image */}
          <div
            className="rounded-2xl overflow-hidden border"
            style={{
              borderColor: "rgba(212, 175, 55, 0.15)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(212,175,55,0.08)",
            }}
          >
            <img
              src={imageUrl}
              alt={verse?.reference || "Generated spiritual image"}
              className="w-full h-auto block"
            />
          </div>

          {/* Verse Info */}
          {verse && (
            <div className="mt-5 text-center px-4">
              <p
                className="text-sm leading-relaxed mb-2"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                }}
              >
                &ldquo;{verse.text.slice(0, 150)}
                {verse.text.length > 150 ? "…" : ""}&rdquo;
              </p>
              <p
                className="text-xs font-medium tracking-wide"
                style={{ color: "var(--gold)" }}
              >
                — {verse.reference}
              </p>
            </div>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="mt-6 w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-300 border cursor-pointer hover:bg-[rgba(212,175,55,0.08)]"
            style={{
              background: "transparent",
              borderColor: "rgba(212, 175, 55, 0.4)",
              color: "#F5D76E",
              letterSpacing: "0.03em",
            }}
          >
            {t.download}
          </button>
        </div>
      )}

      {/* Footer */}
      <p
        className="mt-16 text-xs tracking-wide relative z-10"
        style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
      >
        {t.footer}
      </p>
    </main>
  );
}
