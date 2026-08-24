import { createWorker } from 'tesseract.js';
import { logger } from '../../../utils/logger';
import { DocumentParser, ParseContext, ParsedDocument } from './parser.types';

/**
 * Image parser: OCR via tesseract for image/* uploads.
 */
export class ImageParser implements DocumentParser {
  readonly name = 'image';

  supports(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  async parse({ buffer, fileName }: ParseContext): Promise<ParsedDocument> {
    logger.info(`Starting OCR for image: ${fileName}`);
    const worker = await createWorker('eng');
    try {
      const { data: { text } } = await worker.recognize(buffer);
      return { text, fileName, mimeType: 'image' };
    } catch (error: any) {
      logger.error(`OCR failed for ${fileName}`, { error: error.message });
      throw new Error(`OCR failed: ${error.message}`);
    } finally {
      await worker.terminate();
    }
  }
}
