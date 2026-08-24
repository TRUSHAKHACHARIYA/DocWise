/**
 * Parser contracts shared across the ingestion pipeline.
 */

export interface DocumentHeading {
  title: string;
  level: number;
  startIndex: number;
}

export interface DocumentSection {
  title: string;
  level: number;
  content: string;
  startIndex: number;
}

export interface DocumentStructure {
  headings: DocumentHeading[];
  sections: DocumentSection[];
}

export interface ParsedDocument {
  text: string;
  pageCount?: number;
  pages?: string[];
  fileName: string;
  mimeType: string;
  structure?: DocumentStructure;
}

export interface ParseContext {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

export interface DocumentParser {
  readonly name: string;
  supports(mimeType: string, fileName?: string): boolean;
  parse(context: ParseContext): Promise<ParsedDocument>;
}
