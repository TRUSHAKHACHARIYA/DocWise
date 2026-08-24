import mammoth from 'mammoth';
import { logger } from '../../../utils/logger';
import { DocumentParser, DocumentSection, ParseContext, ParsedDocument } from './parser.types';

/**
 * DOCX parser: extracts raw text with mammoth and derives document
 * structure (headings) from the converted HTML representation.
 */
export class DocxParser implements DocumentParser {
  readonly name = 'docx';

  supports(mimeType: string): boolean {
    return (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    );
  }

  async parse({ buffer, fileName }: ParseContext): Promise<ParsedDocument> {
    try {
      const raw = await mammoth.extractRawText({ buffer });
      const text = raw.value;

      let structure;
      try {
        structure = await this.extractStructure(buffer);
      } catch (error: any) {
        logger.warn(`DOCX structure extraction failed for ${fileName}: ${error.message}`);
      }

      return {
        text,
        fileName,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ...(structure ? { structure } : {}),
      };
    } catch (error: any) {
      throw new Error(`DOCX parsing failed: ${error.message}`);
    }
  }

  private async extractStructure(buffer: Buffer) {
    const result = await mammoth.convertToHtml({ buffer });
    const html = result.value;

    const headings: { title: string; level: number; startIndex: number }[] = [];
    const tagRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gis;
    let match: RegExpExecArray | null;

    // Map heading titles to their offsets in the raw text.
    const rawText = (await mammoth.extractRawText({ buffer })).value;

    while ((match = tagRegex.exec(html)) !== null) {
      const level = parseInt(match[1], 10);
      const title = match[2]
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();

      if (!title) {
        continue;
      }

      headings.push({
        title,
        level,
        startIndex: rawText.indexOf(title),
      });
    }

    return this.buildSections(rawText, headings);
  }

  private buildSections(text: string, headings: { title: string; level: number; startIndex: number }[]) {
    const validHeadings = headings.filter(h => h.startIndex >= 0);

    if (validHeadings.length === 0) {
      return undefined;
    }

    const sections: DocumentSection[] = [];

    if (validHeadings[0].startIndex > 0) {
      sections.push({
        title: '',
        level: 0,
        content: text.slice(0, validHeadings[0].startIndex).trim(),
        startIndex: 0,
      });
    }

    validHeadings.forEach((heading, i) => {
      const endIndex = i + 1 < validHeadings.length ? validHeadings[i + 1].startIndex : text.length;
      sections.push({
        title: heading.title,
        level: heading.level,
        content: text.slice(heading.startIndex + heading.title.length, endIndex).trim(),
        startIndex: heading.startIndex,
      });
    });

    return { headings: validHeadings, sections };
  }
}
