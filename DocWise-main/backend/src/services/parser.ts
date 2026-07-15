const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';
import { pdf } from 'pdf-to-img';
import { logger } from '../utils/logger';

const SCANNED_PDF_MIN_CHARS = 50;
const SCANNED_PDF_MIN_CHARS_PER_PAGE = 30;
const MAX_OCR_PAGES = 25;

/**
 * Extract text and basic metadata from a file buffer.
 */
export async function extractText(
  buffer: Buffer,
  mimeType: string,
  fileName: string = 'document'
): Promise<{ text: string, pageCount?: number, pages?: string[] }> {
  try {
    if (mimeType === 'application/pdf') {
      return await extractTextFromPdf(buffer, fileName);
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const text = await extractTextFromDocx(buffer);
      return { text };
    }

    if (mimeType.startsWith('text/') || mimeType === 'application/json') {
      return { text: buffer.toString('utf-8') };
    }

    if (mimeType.startsWith('image/')) {
      const text = await extractTextFromImage(buffer, fileName);
      return { text };
    }

    throw new Error(`Unsupported file type: ${mimeType}`);
  } catch (error: any) {
    logger.error(`Parser error [${fileName}]`, { error: error.message });
    throw new Error(`Failed to process ${fileName}: ${error.message}`);
  }
}

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

async function extractTextFromPdf(
  buffer: Buffer,
  fileName: string
): Promise<{ text: string, pageCount: number, pages: string[] }> {
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
      return await extractTextFromScannedPdf(buffer, fileName, pageCount);
    }

    return {
      text,
      pageCount,
      pages
    };
  } catch (error: any) {
    if (error.message?.includes('OCR')) {
      throw error;
    }
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

async function extractTextFromScannedPdf(
  buffer: Buffer,
  fileName: string,
  estimatedPageCount: number
): Promise<{ text: string, pageCount: number, pages: string[] }> {
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
    };
  } catch (error: any) {
    logger.error(`Scanned PDF OCR failed for ${fileName}`, { error: error.message });
    throw new Error(`Scanned PDF OCR failed: ${error.message}`);
  } finally {
    await worker.terminate();
  }
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error: any) {
    throw new Error(`DOCX parsing failed: ${error.message}`);
  }
}

async function extractTextFromImage(buffer: Buffer, fileName: string): Promise<string> {
  logger.info(`Starting OCR for image: ${fileName}`);
  const worker = await createWorker('eng');
  try {
    const { data: { text } } = await worker.recognize(buffer);
    return text;
  } catch (error: any) {
    logger.error(`OCR failed for ${fileName}`, { error: error.message });
    throw new Error(`OCR failed: ${error.message}`);
  } finally {
    await worker.terminate();
  }
}
