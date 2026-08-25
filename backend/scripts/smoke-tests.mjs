import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const supertest = require("supertest");
const { buildApp } = require("../dist/app.js");
const { prisma } = require("../dist/utils/prisma.js");
const { chunkText } = require("../dist/modules/chunking/index.js");
const {
  validateUploadMimeType,
  validateUploadSignature,
  looksSuspiciousTextPayload,
} = require("../dist/utils/uploadSecurity.js");

async function run() {
  console.log("Smoke: creating app");
  const app = buildApp();

  try {
    console.log("Smoke: app.ready");
    await app.ready();
    console.log("Smoke: root");

    const root = await supertest(app.server).get("/");
    assert.equal(root.status, 200);
    assert.match(root.body.message, /DocWise API running/i);

    const ready = await supertest(app.server).get("/readyz");
    assert.equal(ready.status, 200);
    console.log("Smoke: readyz");

    const longText = "This is a test sentence. ".repeat(100);
    const chunks = chunkText(longText);
    assert.ok(chunks.length > 1);
    console.log("Smoke: chunker");

    assert.equal(validateUploadMimeType("application/pdf"), true);
    assert.equal(validateUploadMimeType("application/x-msdownload"), false);
    assert.equal(
      validateUploadSignature(Buffer.from("%PDF-1.7 sample"), "application/pdf"),
      true
    );
    assert.equal(
      validateUploadSignature(Buffer.from("not a pdf"), "application/pdf"),
      false
    );
    assert.equal(looksSuspiciousTextPayload(Buffer.from("hello"), "text/plain"), false);
    assert.equal(
      looksSuspiciousTextPayload(Buffer.from("<script>alert(1)</script>"), "text/plain"),
      true
    );
    console.log("Smoke: uploadSecurity");

    console.log("Backend smoke tests passed.");
  } finally {
    console.log("Smoke: closing app");
    await app.close();
    console.log("Smoke: disconnect prisma");
    await prisma.$disconnect();
    console.log("Smoke: done");
  }
}

run().catch((error) => {
  console.error("Backend smoke tests failed:", error);
  process.exitCode = 1;
});
