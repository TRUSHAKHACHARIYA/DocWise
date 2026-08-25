import { createWorker } from 'tesseract.js';
import { pdf } from 'pdf-to-img';
import { logger } from '../../../utils/logger';
import { DocumentParser, ParseContext, ParsedDocument } from './parser.types';

const pdfParse = require('pdf-parse');

const SCANNED_PDF_MIN_CHARS = 50;
const SCANNED_PDF_MIN_CHARS_PER_PAGE = 30;
const MAX_OCR_PAGES = 25;

export function isLikelyScannedPdf(text: string, pageCount: number): boolean {
  const trimmed = text.trim();
  if (!pageCount) {
    return trimmed.length < SCANNED_PDF_MIN_CHARS;
  }

  const avgCharsPerPage = trimmed.length / pageCount;
  return (
    trimmed.length < SCANNED_PDF_MIN_CHARS ||
    avgCharsPerPage < SCANNED_PDF_MIN_CHARS_PER_PAGE
  );
}

export class PdfParser implements DocumentParser {
  readonly name = 'pdf';

  supports(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  async parse({ buffer, fileName }: ParseContext): Promise<ParsedDocument> {
    try {
      const pages: string[] = [];

      const options = {
        pagerender: (pageData: any) => {
          return pageData.getTextContent().then((textContent: any) => {
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            pages.push(pageText);
            return pageText;
          });
        }
      };

      const data = await pdfParse(buffer, options);
      const pageCount = data.numpages || pages.length || 1;
      const text = data.text || pages.join('\n\n');

      if (isLikelyScannedPdf(text, pageCount)) {
        logger.info(`PDF appears scanned, running OCR: ${fileName}`, { pageCount });
        return await this.parseScannedPdf(buffer, fileName, pageCount);
      }

      return {
        text,
        pageCount,
        pages,
        fileName,
        mimeType: 'application/pdf',
      };
    } catch (error: any) {
      if (error.message?.includes('OCR')) {
        throw error;
      }
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  private async parseScannedPdf(
    buffer: Buffer,
    fileName: string,
    estimatedPageCount: number
  ): Promise<ParsedDocument> {
    if (estimatedPageCount > MAX_OCR_PAGES) {
      throw new Error(
        `Scanned PDF has ${estimatedPageCount} pages. OCR supports up to ${MAX_OCR_PAGES} pages.`
      );
    }

    logger.info(`Starting scanned PDF OCR: ${fileName}`);
    const worker = await createWorker('eng');
    const pages: string[] = [];

    try {
      const document = await pdf(buffer, { scale: 2 });
      let pageIndex = 0;

      for await (const pageImage of document) {
        pageIndex += 1;
        logger.info(`OCR page ${pageIndex}/${estimatedPageCount} for ${fileName}`);

        const { data: { text } } = await worker.recognize(pageImage);
        pages.push(text.trim());
      }

      const combinedText = pages.filter(Boolean).join('\n\n');
      if (combinedText.trim().length < 10) {
        throw new Error('OCR produced no readable text from this scanned PDF.');
      }

      return {
        text: combinedText,
        pageCount: pages.length || estimatedPageCount,
        pages,
        fileName,
        mimeType: 'application/pdf',
      };
    } catch (error: any) {
      logger.error(`Scanned PDF OCR failed for ${fileName}`, { error: error.message });
      throw new Error(`Scanned PDF OCR failed: ${error.message}`);
    } finally {
      await worker.terminate();
    }
  }
}
