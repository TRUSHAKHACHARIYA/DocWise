import { DocumentParser, ParseContext, ParsedDocument } from './parser.types';

/**
 * Plain text parser: handles text/* and application/json payloads.
 * Content is used verbatim (structure detection happens downstream).
 */
export class TextParser implements DocumentParser {
  readonly name = 'text';

  supports(mimeType: string): boolean {
    return mimeType.startsWith('text/') || mimeType === 'application/json';
  }

  async parse({ buffer, fileName, mimeType }: ParseContext): Promise<ParsedDocument> {
    const text = buffer.toString('utf-8');
    return { text, fileName, mimeType };
  }
}
