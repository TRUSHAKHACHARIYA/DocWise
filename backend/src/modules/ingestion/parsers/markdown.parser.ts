import { DocumentParser, DocumentHeading, ParseContext, ParsedDocument } from './parser.types';

const MD_EXTENSION = /\.(md|markdown|mdown|mkd)$/i;

/**
 * Markdown parser: keeps the raw markdown as text and derives structure
 * from ATX (#) and setext (===/---) headings with exact offsets.
 */
export class MarkdownParser implements DocumentParser {
  readonly name = 'markdown';

  supports(mimeType: string, fileName?: string): boolean {
    if (mimeType === 'text/markdown' || mimeType === 'text/x-markdown') {
      return true;
    }
    return Boolean(fileName && MD_EXTENSION.test(fileName));
  }

  async parse({ buffer, fileName, mimeType }: ParseContext): Promise<ParsedDocument> {
    const text = buffer.toString('utf-8').replace(/\r\n/g, '\n');

    const headings = this.extractHeadings(text);
    const structure = headings.length > 0 ? this.buildStructure(text, headings) : undefined;

    return {
      text,
      fileName,
      mimeType: mimeType.startsWith('text/markdown') ? mimeType : 'text/markdown',
      ...(structure ? { structure } : {}),
    };
  }

  private extractHeadings(text: string): DocumentHeading[] {
    const headings: DocumentHeading[] = [];
    const lines = text.split('\n');
    let cursor = 0;
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/^```/.test(line)) {
        inCodeBlock = !inCodeBlock;
        cursor += line.length + 1;
        continue;
      }

      if (!inCodeBlock) {
        const atx = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
        if (atx) {
          headings.push({
            title: atx[2].trim(),
            level: atx[1].length,
            startIndex: cursor,
          });
          cursor += line.length + 1;
          continue;
        }

        // Setext headings: text line followed by === or --- underline.
        const underline = lines[i + 1] ?? '';
        const setext = line.trim().length > 0 && /^(=+|-+)\s*$/.test(underline.trim());
        if (setext && !/^[-*+]\s|^\d+\.\s/.test(line.trim())) {
          headings.push({
            title: line.trim(),
            level: underline.trim().startsWith('=') ? 1 : 2,
            startIndex: cursor,
          });
          cursor += line.length + underline.length + 2;
          i += 1;
          continue;
        }
      }

      cursor += line.length + 1;
    }

    return headings;
  }

  private buildStructure(text: string, headings: DocumentHeading[]) {
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
        content: text.slice(heading.startIndex, endIndex).replace(/^(#{1,6}\s+.+?\n)/, '').trim(),
        startIndex: heading.startIndex,
      });
    });

    return { headings, sections };
  }
}
