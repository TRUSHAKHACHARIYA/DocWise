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
): Promise<{ text: string, pageCount?: number, pages?: string[] }> {
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

async function extractTextFromPdf(buffer: Buffer): Promise<{ text: string, pageCount: number, pages: string[] }> {
  try {
    const pages: string[] = [];
    
    // Custom pagerender to collect text by individual pages
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
    
    return { 
      text: data.text || pages.join('\n\n'), 
      pageCount: data.numpages || pages.length || 1,
      pages
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
