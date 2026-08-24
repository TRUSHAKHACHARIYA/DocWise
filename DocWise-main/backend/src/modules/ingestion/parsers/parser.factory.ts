import { logger } from '../../../utils/logger';
import { DocumentParser, ParseContext, ParsedDocument } from './parser.types';
import { PdfParser } from './pdf.parser';
import { DocxParser } from './docx.parser';
import { HtmlParser } from './html.parser';
import { MarkdownParser } from './markdown.parser';
import { CsvParser } from './csv.parser';
import { TextParser } from './text.parser';
import { ImageParser } from './image.parser';
import { cleanText } from '../cleaners/text.cleaner';
import { detectStructure } from '../processors/structure.processor';
import { extractStructuralMetadata } from '../processors/metadata.processor';

const parsers: DocumentParser[] = [
  new PdfParser(),
  new DocxParser(),
  new MarkdownParser(),
  new CsvParser(),
  new HtmlParser(),
  new TextParser(),
  new ImageParser(),
];

/**
 * Resolve the parser for a given mime type / file name.
 * Exported for testing and custom pipeline composition.
 */
export function resolveParser(mimeType: string, fileName?: string): DocumentParser | undefined {
  return (
    parsers.find(p => p.supports(mimeType, fileName)) ??
    parsers.find(p => p.supports('application/octet-stream', fileName))
  );
}

/**
 * Full parse pipeline: parser -> cleaning -> structure detection ->
 * structural metadata. Returns a ParsedDocument ready for chunking.
 */
export async function parseDocument(
  buffer: Buffer,
  mimeType: string,
  fileName: string = 'document'
): Promise<ParsedDocument & { metadata?: Record<string, unknown> }> {
  const parser = resolveParser(mimeType, fileName);

  if (!parser) {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }

  logger.info(`Parsing ${fileName} with ${parser.name} parser`, { mimeType });

  const context: ParseContext = { buffer, fileName, mimeType };
  let parsed: ParsedDocument;

  try {
    parsed = await parser.parse(context);
  } catch (error: any) {
    logger.error(`Parser error [${fileName}]`, { error: error.message });
    throw new Error(`Failed to process ${fileName}: ${error.message}`);
  }

  parsed.text = cleanText(parsed.text);

  // Heuristic structure detection when the parser did not provide one.
  if (!parsed.structure && parsed.text.trim().length > 0 && parser.name !== 'csv') {
    parsed.structure = detectStructure(parsed.text);
  }

  const metadata = extractStructuralMetadata(parsed);

  return { ...parsed, metadata };
}
