import { ParsedDocument } from '../parsers/parser.types';

const STOPWORD_SAMPLES: Record<string, string[]> = {
  en: ['the', 'and', 'of', 'to', 'is', 'in', 'that', 'it', 'for', 'with'],
  es: ['el', 'la', 'de', 'que', 'y', 'en', 'los', 'del', 'las', 'por'],
  fr: ['le', 'la', 'de', 'et', 'les', 'des', 'est', 'une', 'dans', 'pour'],
  de: ['der', 'die', 'und', 'das', 'ist', 'von', 'dem', 'mit', 'nicht', 'ein'],
};

/**
 * Derives structural metadata from a parsed document. This complements
 * (not replaces) LLM-based metadata extraction performed downstream.
 */
export function extractStructuralMetadata(parsed: ParsedDocument): Record<string, unknown> {
  const text = parsed.text;
  const words = text.split(/\s+/).filter(Boolean);

  return {
    parser: parsed.mimeType,
    charCount: text.length,
    wordCount: words.length,
    pageCount: parsed.pageCount ?? undefined,
    headingCount: parsed.structure?.headings.length ?? 0,
    sectionCount: parsed.structure?.sections.length ?? 0,
    detectedTitle: detectTitle(parsed),
    detectedLanguage: detectLanguage(text),
    readingTimeMinutes: Math.max(1, Math.ceil(words.length / 200)),
    ingestedAt: new Date().toISOString(),
  };
}

function detectTitle(parsed: ParsedDocument): string | undefined {
  const firstHeading = parsed.structure?.headings.find(h => h.title.trim().length > 0);
  if (firstHeading) {
    return firstHeading.title.slice(0, 200);
  }

  const firstLine = parsed.text
    .split('\n')
    .map(l => l.trim())
    .find(l => l.length > 3);

  if (!firstLine || firstLine.length > 150) {
    return undefined;
  }
  return firstLine;
}

function detectLanguage(text: string): string {
  const sample = text.toLowerCase().slice(0, 4000);
  if (sample.length < 40) {
    return 'unknown';
  }

  let best = 'unknown';
  let bestScore = 0;

  for (const [lang, stopwords] of Object.entries(STOPWORD_SAMPLES)) {
    const score = stopwords.reduce(
      (acc, sw) => acc + (sample.match(new RegExp(`\\b${sw}\\b`, 'g'))?.length ?? 0),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      best = lang;
    }
  }

  return bestScore >= 5 ? best : 'unknown';
}
