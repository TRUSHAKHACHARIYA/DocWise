import { describe, expect, it } from "vitest";
import {
  looksSuspiciousTextPayload,
  validateUploadMimeType,
  validateUploadSignature,
} from "../utils/uploadSecurity";

describe("upload security", () => {
  it("accepts supported mime types", () => {
    expect(validateUploadMimeType("application/pdf")).toBe(true);
    expect(validateUploadMimeType("application/x-msdownload")).toBe(false);
  });

  it("validates known file signatures", () => {
    const validPdf = Buffer.from("%PDF-1.7 sample");
    const invalidPdf = Buffer.from("not a pdf");
    expect(validateUploadSignature(validPdf, "application/pdf")).toBe(true);
    expect(validateUploadSignature(invalidPdf, "application/pdf")).toBe(false);
  });

  it("flags suspicious script payloads in text uploads", () => {
    const clean = Buffer.from("hello world");
    const suspicious = Buffer.from("<script>alert('xss')</script>");
    expect(looksSuspiciousTextPayload(clean, "text/plain")).toBe(false);
    expect(looksSuspiciousTextPayload(suspicious, "text/plain")).toBe(true);
  });
});
