import * as cheerio from 'cheerio';
import { DocumentParser, DocumentSection, ParseContext, ParsedDocument } from './parser.types';

/**
 * HTML parser: strips scripts/styles and extracts readable text plus
 * heading structure (h1-h6) with offsets into the extracted text.
 */
export class HtmlParser implements DocumentParser {
  readonly name = 'html';

  supports(mimeType: string): boolean {
    return (
      mimeType === 'text/html' ||
      mimeType === 'application/xhtml+xml'
    );
  }

  async parse({ buffer, fileName, mimeType }: ParseContext): Promise<ParsedDocument> {
    const html = buffer.toString('utf-8');
    const $ = cheerio.load(html);

    $('script, style, noscript, template').remove();

    const headings: { title: string; level: number; startIndex: number }[] = [];

    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const title = $(el).text().replace(/\s+/g, ' ').trim();
      if (!title) {
        return;
      }
      const level = parseInt(el.tagName.substring(1), 10);
      headings.push({ title, level, startIndex: -1 });
    });

    const text = $('body').text().replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

    // Resolve heading offsets against the normalized text.
    let cursor = 0;
    for (const heading of headings) {
      const idx = text.indexOf(heading.title, cursor);
      if (idx >= 0) {
        heading.startIndex = idx;
        cursor = idx + heading.title.length;
      }
    }

    const validHeadings = headings.filter(h => h.startIndex >= 0);

    return {
      text,
      fileName,
      mimeType,
      ...(validHeadings.length > 0 ? { structure: this.buildSections(text, validHeadings) } : {}),
    };
  }

  private buildSections(text: string, headings: { title: string; level: number; startIndex: number }[]) {
    const sections: DocumentSection[] = [];

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
}
