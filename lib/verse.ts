/**
 * Verse fetching — abstracts 4 API endpoints into one unified interface.
 * Bible EN (KJV) → bible-api.com
 * Bible FR (Louis Segond) → api.scripture.api.bible
 * Quran EN (Asad) → api.alquran.cloud
 * Quran FR (Hamidullah) → api.alquran.cloud
 */

export interface Verse {
    text: string;
    reference: string;
    source: "bible" | "quran";
    language: "en" | "fr";
}

// ─── Bible EN (KJV) ─────────────────────────────────────────────────────────

async function fetchBibleEN(): Promise<Verse> {
    const res = await fetch("https://bible-api.com/data/kjv/random", {
        cache: "no-store",
    });

    if (!res.ok) throw new Error(`bible-api.com failed: ${res.status}`);

    const data = await res.json();
    const v = data.random_verse;

    return {
        text: v.text.trim(),
        reference: `${v.book} ${v.chapter}:${v.verse}`,
        source: "bible",
        language: "en",
    };
}

// ─── Bible FR (Louis Segond via api.scripture.api.bible) ─────────────────────

async function fetchBibleFR(): Promise<Verse> {
    const apiKey = process.env.SCRIPTURE_API_KEY;
    if (!apiKey) throw new Error("SCRIPTURE_API_KEY not set in .env");

    // Louis Segond 1910 Bible ID
    const bibleId = "90799bb5b996fddc-01";

    // Get list of books
    const booksRes = await fetch(
        `https://api.scripture.api.bible/v1/bibles/${bibleId}/books`,
        { headers: { "api-key": apiKey }, cache: "no-store" }
    );
    if (!booksRes.ok) throw new Error(`scripture.api.bible books failed: ${booksRes.status}`);
    const booksData = await booksRes.json();
    const books: { id: string; name: string }[] = booksData.data;

    // Pick random book
    const randomBook = books[Math.floor(Math.random() * books.length)];

    // Get chapters for that book
    const chaptersRes = await fetch(
        `https://api.scripture.api.bible/v1/bibles/${bibleId}/books/${randomBook.id}/chapters`,
        { headers: { "api-key": apiKey }, cache: "no-store" }
    );
    if (!chaptersRes.ok) throw new Error(`scripture.api.bible chapters failed: ${chaptersRes.status}`);
    const chaptersData = await chaptersRes.json();
    const chapters: { id: string; number: string }[] = chaptersData.data.filter(
        (c: { number: string }) => c.number !== "intro"
    );

    // Pick random chapter
    const randomChapter = chapters[Math.floor(Math.random() * chapters.length)];

    // Get verses for that chapter
    const versesRes = await fetch(
        `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${randomChapter.id}/verses`,
        { headers: { "api-key": apiKey }, cache: "no-store" }
    );
    if (!versesRes.ok) throw new Error(`scripture.api.bible verses failed: ${versesRes.status}`);
    const versesData = await versesRes.json();
    const verses: { id: string; reference: string }[] = versesData.data;

    // Pick random verse
    const randomVerse = verses[Math.floor(Math.random() * verses.length)];

    // Fetch verse content
    const verseRes = await fetch(
        `https://api.scripture.api.bible/v1/bibles/${bibleId}/verses/${randomVerse.id}?content-type=text`,
        { headers: { "api-key": apiKey }, cache: "no-store" }
    );
    if (!verseRes.ok) throw new Error(`scripture.api.bible verse failed: ${verseRes.status}`);
    const verseData = await verseRes.json();

    // Strip any leftover HTML tags from content
    const cleanText = verseData.data.content
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();

    return {
        text: cleanText,
        reference: verseData.data.reference,
        source: "bible",
        language: "fr",
    };
}

// ─── Quran EN (Muhammad Asad) ────────────────────────────────────────────────

async function fetchQuranEN(): Promise<Verse> {
    const res = await fetch(
        "https://api.alquran.cloud/v1/ayah/random/en.asad",
        { cache: "no-store" }
    );

    if (!res.ok) throw new Error(`alquran.cloud EN failed: ${res.status}`);

    const data = await res.json();
    const ayah = data.data;

    // Clean brackets from Asad translation
    const cleanText = ayah.text
        .replace(/\[.*?\]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    return {
        text: cleanText,
        reference: `${ayah.surah.englishName} ${ayah.surah.number}:${ayah.numberInSurah}`,
        source: "quran",
        language: "en",
    };
}

// ─── Quran FR (Hamidullah) ───────────────────────────────────────────────────

async function fetchQuranFR(): Promise<Verse> {
    const res = await fetch(
        "https://api.alquran.cloud/v1/ayah/random/fr.hamidullah",
        { cache: "no-store" }
    );

    if (!res.ok) throw new Error(`alquran.cloud FR failed: ${res.status}`);

    const data = await res.json();
    const ayah = data.data;

    return {
        text: ayah.text.trim(),
        reference: `${ayah.surah.englishName} ${ayah.surah.number}:${ayah.numberInSurah}`,
        source: "quran",
        language: "fr",
    };
}

// ─── Router ──────────────────────────────────────────────────────────────────

const FETCHERS: Record<string, () => Promise<Verse>> = {
    "bible:en": fetchBibleEN,
    "bible:fr": fetchBibleFR,
    "quran:en": fetchQuranEN,
    "quran:fr": fetchQuranFR,
};

export async function fetchRandomVerse(
    source: "bible" | "quran",
    language: "en" | "fr"
): Promise<Verse> {
    const key = `${source}:${language}`;
    const fetcher = FETCHERS[key];
    if (!fetcher) throw new Error(`No fetcher for ${key}`);
    return fetcher();
}
