import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const docsDir = path.join(projectRoot, "docs");
const architecturePath = path.join(docsDir, "ARCHITECTURE.md");

const requiredDocs = [
  "ARCHITECTURE.md",
  "CONTEXT.md",
  "DEPLOYMENT_GUIDE.md",
  "NOTES.md",
  "PROMPT.md",
  "TASK.md",
];

const missingDocs = requiredDocs.filter((file) => !fs.existsSync(path.join(docsDir, file)));
if (missingDocs.length > 0) {
  console.error(`Missing required docs: ${missingDocs.join(", ")}`);
  process.exit(1);
}

if (!fs.existsSync(architecturePath)) {
  console.error("docs/ARCHITECTURE.md does not exist.");
  process.exit(1);
}

const architectureText = fs.readFileSync(architecturePath, "utf8");
const workflowMatches = architectureText.match(/\.github\/workflows\/[A-Za-z0-9._-]+\.ya?ml/g) ?? [];
const missingReferencedWorkflows = workflowMatches.filter((relativePath) => {
  return !fs.existsSync(path.join(projectRoot, relativePath));
});

if (missingReferencedWorkflows.length > 0) {
  console.error("Architecture doc references workflow files that are missing:");
  for (const file of missingReferencedWorkflows) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log("Docs sync check passed.");
