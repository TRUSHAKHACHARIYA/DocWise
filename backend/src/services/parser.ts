/* eslint-disable @typescript-eslint/no-require-imports */
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

/**
 * Extract text from a file buffer based on its MIME type.
 * Default formatting from pdf-parse and mammoth will be used.
 * @param buffer - The file buffer (PDF or DOCX or plain text)
 * @param mimeType - The MIME type of the file
 * @returns The extracted raw text
 */
export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    return extractTextFromPdf(buffer);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
    mimeType === 'application/msword'
  ) {
    return extractTextFromDocx(buffer);
  } else if (mimeType.startsWith('text/')) {
    return buffer.toString('utf-8');
  } else {
    throw new Error(`Unsupported file type for parsing: ${mimeType}`);
  }
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    throw new Error('Failed to parse PDF document.');
  }
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error('Failed to parse DOCX document.');
  }
}
