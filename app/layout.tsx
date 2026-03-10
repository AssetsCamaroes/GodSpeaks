import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GodSpeaks — Divine Verses, Beautifully Rendered",
  description:
    "Generate stunning spiritual images with random Bible and Quran verses in English or French. AI-generated art meets sacred scripture.",
  keywords: [
    "Bible verses",
    "Quran verses",
    "spiritual images",
    "AI art",
    "scripture",
    "GodSpeaks",
  ],
  openGraph: {
    title: "GodSpeaks — Divine Verses, Beautifully Rendered",
    description:
      "Generate stunning spiritual images with random Bible and Quran verses.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
