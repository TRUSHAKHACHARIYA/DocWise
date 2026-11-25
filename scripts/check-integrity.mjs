// Repository integrity check.
//
// In Nov 2026 a stolen GitHub token was used to force-push rewritten commits
// onto several branches. The rewritten commits kept the original author, date
// and message but added an obfuscated JavaScript payload, hidden by:
//   - appending it after a long run of spaces at the end of postcss.config.mjs
//     and of new extension-less `init` files,
//   - prefixing package.json scripts with `node init`,
//   - a hidden .vscode/tasks.json task with `runOn: folderOpen` that ran a
//     fake font file (`fa-solid-600.ttf`) with node.
// This check fails CI if any of those patterns reappear.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const problems = [];
const codeExt = /\.(m?js|cjs|ts|tsx|jsx|json|ya?ml)$/;
const MAX_CODE_LINE = 1000;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const base = file.split("/").pop();

  if (base === "init") problems.push(`${file}: unexpected extension-less 'init' script`);
  if (file.startsWith(".vscode/") && base === "tasks.json") {
    const text = fs.readFileSync(file, "utf8");
    if (/folderOpen/.test(text)) problems.push(`${file}: task runs automatically on folder open`);
  }
  if (/\.(ttf|woff2?|eot|otf)$/.test(file)) {
    const head = fs.readFileSync(file).subarray(0, 64).toString("latin1");
    if (/^\s*(\(function|var |const |let |function|!function)/.test(head)) {
      problems.push(`${file}: font file contains JavaScript`);
    }
  }
  if (base === "package.json") {
    const scripts = JSON.parse(fs.readFileSync(file, "utf8")).scripts ?? {};
    for (const [name, cmd] of Object.entries(scripts)) {
      if (/\bnode\s+(\.\/)?init\b/.test(cmd)) problems.push(`${file}: script '${name}' runs 'node init'`);
    }
  }
  if (codeExt.test(file) && base !== "package-lock.json") {
    const lines = fs.readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (line.length > MAX_CODE_LINE) problems.push(`${file}:${i + 1}: line is ${line.length} chars (possible hidden payload)`);
      else if (/\S {200,}\S/.test(line)) problems.push(`${file}:${i + 1}: long run of spaces hides trailing code`);
    });
  }
}

if (problems.length) {
  console.error("Integrity check FAILED:");
  for (const p of problems) console.error(`- ${p}`);
  process.exit(1);
}
console.log(`Integrity check passed (${files.length} files).`);
