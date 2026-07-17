-- AlterTable: Add tsvector column for full-text search
ALTER TABLE "Chunk" ADD COLUMN "textSearch" tsvector;

-- Populate the tsvector column from existing text data
UPDATE "Chunk" SET "textSearch" = to_tsvector('english', "text");

-- CreateIndex: GIN index for full-text search queries
CREATE INDEX "Chunk_textSearch_idx" ON "Chunk" USING GIN ("textSearch");
