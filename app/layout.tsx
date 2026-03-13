import type { Metadata, Viewport } from "next";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL || "https://godspeaks.com";
const SITE_NAME = "GodSpeaks";
const TITLE     = "GodSpeaks — Divine Verses, Beautifully Rendered";
const DESCRIPTION =
  "Generate stunning AI spiritual images from random Bible and Quran verses in English or French. Sacred scripture meets generative art.";

// ─── Viewport (theme-color lives here in Next.js 14+) ────────────────────────

export const viewport: Viewport = {
  themeColor: "#C8A45A",
  width: "device-width",
  initialScale: 1,
};

// ─── Page Metadata ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  keywords: [
    "Bible verses", "Quran verses", "spiritual images", "AI art",
    "scripture", "GodSpeaks", "sacred art", "divine inspiration",
    "versets bibliques", "art spirituel",
  ],

  // ── Canonical + alternate languages ───────────────────────────────────────
  alternates: {
    canonical: "/",
    languages: { "en": "/", "fr": "/" },
  },

  // ── Robots ────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },

  // ── Open Graph ────────────────────────────────────────────────────────────
  openGraph: {
    type:            "website",
    url:             SITE_URL,
    siteName:        SITE_NAME,
    title:           TITLE,
    description:     DESCRIPTION,
    locale:          "en_US",
    alternateLocale: ["fr_FR"],
    images: [
      {
        url:    "/opengraph-image.png",
        width:  1200,
        height: 630,
        alt:    "GodSpeaks — Divine Verses, Beautifully Rendered",
      },
    ],
  },

  // ── Twitter / X ───────────────────────────────────────────────────────────
  twitter: {
    card:        "summary_large_image",
    title:       TITLE,
    description: DESCRIPTION,
    images:      ["/opengraph-image.png"],
  },

  // ── Icons & manifest ──────────────────────────────────────────────────────
  manifest: "/manifest.webmanifest",
  icons: {
    icon:  "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
