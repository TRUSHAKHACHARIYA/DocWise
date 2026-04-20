/* eslint-disable @typescript-eslint/no-require-imports */
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

/**
 * Extract text and basic metadata from a file buffer.
 */
export async function extractText(
  buffer: Buffer, 
  mimeType: string,
  fileName: string = 'document'
): Promise<{ text: string, pageCount?: number }> {
  try {
    if (mimeType === 'application/pdf') {
      return await extractTextFromPdf(buffer);
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

    throw new Error(`Unsupported file type: ${mimeType}`);
  } catch (error: any) {
    console.error(`Parser error [${fileName}]:`, error);
    throw new Error(`Failed to process ${fileName}: ${error.message}`);
  }
}

async function extractTextFromPdf(buffer: Buffer): Promise<{ text: string, pageCount: number }> {
  try {
    // pdf-parse options
    const options = {
      // Custom pagerender to catch specific details if needed
      pagerender: (pageData: any) => {
        return pageData.getTextContent().then((textContent: any) => {
          return textContent.items.map((item: any) => item.str).join(' ');
        });
      }
    };

    const data = await pdfParse(buffer);
    
    // Fallback if custom pagerender fails or returns empty
    const text = data.text && data.text.trim().length > 0 ? data.text : "No extractable text found in this PDF.";
    
    return { 
      text, 
      pageCount: data.numpages || 1 
    };
  } catch (error: any) {
    throw new Error(`PDF parsing failed: ${error.message}`);
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
