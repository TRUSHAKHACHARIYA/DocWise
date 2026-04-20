import fs from "node:fs";
import path from "node:path";

const requiredFiles = [
  ".github/workflows/main.yml",
  "docs/DEPLOYMENT_GUIDE.md",
  "docs/ARCHITECTURE.md",
  "docs/RELEASE_CHECKLIST.md",
];

const missing = requiredFiles.filter((relativePath) => !fs.existsSync(path.join(process.cwd(), relativePath)));
if (missing.length > 0) {
  console.error("Release check failed. Missing required files:");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

const deploymentGuide = fs.readFileSync(path.join(process.cwd(), "docs/DEPLOYMENT_GUIDE.md"), "utf8");
if (!deploymentGuide.toLowerCase().includes("rollback")) {
  console.error("Release check failed: deployment guide must include rollback instructions.");
  process.exit(1);
}

console.log("Release check passed.");
