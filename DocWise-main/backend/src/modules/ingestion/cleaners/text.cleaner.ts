/**
 * Text cleaning utilities applied before chunking.
 */

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Normalize text for the ingestion pipeline:
 * - unify line endings
 * - strip control characters (keeps \n and \t)
 * - collapse excessive blank lines
 * - trim trailing whitespace on lines
 */
export function cleanText(text: string): string {
  if (!text) {
    return '';
  }

  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(CONTROL_CHARS, '')
    .split('\n')
    .map(line => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}
