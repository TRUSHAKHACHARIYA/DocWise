import { DocumentHeading, DocumentStructure, ParsedDocument } from '../parsers/parser.types';

const NUMBERED_HEADING = /^(\d+(\.\d+){0,4})\.?\s+(\S.{2,120})$/;
const CAPS_HEADING = /^[A-Z][A-Z0-9 \-/&,()']{3,80}$/;
const SENTENCE_END = /[.!?,;:]$/;

/**
 * Heuristic structure detection for text formats that carry no explicit
 * headings (PDF extractions, plain text): numbered and ALL-CAPS lines
 * are treated as section boundaries.
 */
export function detectStructure(text: string): DocumentStructure {
  const lines = text.split('\n');
  const headings: DocumentHeading[] = [];

  let cursor = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length > 0 && line.length <= 121 && !SENTENCE_END.test(line)) {
      const wordCount = line.split(/\s+/).length;

      let level = 0;
      const numbered = line.match(NUMBERED_HEADING);
      if (numbered && wordCount <= 15) {
        level = Math.min(numbered[1].split('.').length, 6);
      } else if (CAPS_HEADING.test(line) && wordCount <= 12) {
        level = 1;
      }

      if (level > 0) {
        headings.push({ title: line, level, startIndex: cursor });
      }
    }
    cursor += lines[i].length + 1;
  }

  if (headings.length === 0) {
    return { headings: [], sections: [{ title: '', level: 0, content: text, startIndex: 0 }] };
  }

  const sections = [];
  if (headings[0].startIndex > 0) {
    sections.push({
      title: '',
      level: 0,
      content: text.slice(0, headings[0].startIndex).trim(),
      startIndex: 0,
    });
  }

  headings.forEach((heading, i) => {
    const endIndex = i + 1 < headings.length ? headings[i + 1].startIndex : text.length;
    sections.push({
      title: heading.title,
      level: heading.level,
      content: text.slice(heading.startIndex + heading.title.length, endIndex).trim(),
      startIndex: heading.startIndex,
    });
  });

  return { headings, sections };
}

/**
 * Convenience helper: returns detected sections or a single pseudo-section.
 */
export function getSections(parsed: ParsedDocument): DocumentStructure['sections'] {
  return parsed.structure?.sections ?? [
    { title: '', level: 0, content: parsed.text, startIndex: 0 },
  ];
}
