export interface SampleDocumentDef {
  path: string;
  filename: string;
}

export const SAMPLE_DOCUMENTS: SampleDocumentDef[] = [
  {
    path: "/samples/sample-msa.txt",
    filename: "Sample_MSA_Agreement.txt",
  },
  {
    path: "/samples/sample-security-policy.txt",
    filename: "Sample_Security_Policy.txt",
  },
];

export const SUGGESTED_PROMPTS = [
  "What termination notice is required to exit the agreement early?",
  "What early termination fee applies under Exhibit B?",
  "Summarize vendor security obligations from the policy.",
  "How quickly must security incidents be reported?",
];

export async function fetchSampleFile(sample: SampleDocumentDef): Promise<File> {
  const response = await fetch(sample.path);

  if (!response.ok) {
    throw new Error(`Failed to load sample document: ${sample.filename}`);
  }

  const blob = await response.blob();
  return new File([blob], sample.filename, { type: "text/plain" });
}
