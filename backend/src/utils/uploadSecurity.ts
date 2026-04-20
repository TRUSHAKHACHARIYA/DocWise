const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "application/json",
]);

const PDF_SIGNATURE = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF
const ZIP_SIGNATURE = Buffer.from([0x50, 0x4b, 0x03, 0x04]); // docx container

const SUSPICIOUS_PATTERNS = [
  "<script",
  "javascript:",
  "powershell -",
  "cmd /c",
];

function startsWith(buffer: Buffer, signature: Buffer): boolean {
  if (buffer.length < signature.length) return false;
  return signature.every((byte, index) => buffer[index] === byte);
}

export function validateUploadMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType);
}

export function validateUploadSignature(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === "application/pdf") return startsWith(buffer, PDF_SIGNATURE);
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    return startsWith(buffer, ZIP_SIGNATURE);
  }

  return true;
}

export function looksSuspiciousTextPayload(buffer: Buffer, mimeType: string): boolean {
  if (!(mimeType.startsWith("text/") || mimeType === "application/json")) return false;
  const content = buffer.toString("utf-8").toLowerCase();
  return SUSPICIOUS_PATTERNS.some((pattern) => content.includes(pattern));
}

