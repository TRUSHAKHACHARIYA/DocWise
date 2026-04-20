import fs from "node:fs";
import path from "node:path";

const minPassRate = Number(process.env.EVAL_MIN_PASS_RATE ?? "0.75");

const candidatePaths = [
  path.join(process.cwd(), "backend", "evals", "results", "latest_run.json"),
  path.join(process.cwd(), "evals", "results", "latest_run.json"),
];

const resultPath = candidatePaths.find((filePath) => fs.existsSync(filePath));

if (!resultPath) {
  console.error("No evaluation result found. Expected latest_run.json in backend/evals/results or evals/results.");
  process.exit(1);
}

const rows = JSON.parse(fs.readFileSync(resultPath, "utf8"));
if (!Array.isArray(rows) || rows.length === 0) {
  console.error(`Evaluation result at ${resultPath} is empty.`);
  process.exit(1);
}

const passed = rows.filter((row) => row.status === "PASS").length;
const passRate = passed / rows.length;

console.log(`Eval gate: ${passed}/${rows.length} (${(passRate * 100).toFixed(2)}%)`);

if (passRate < minPassRate) {
  console.error(`Eval gate failed. Required >= ${(minPassRate * 100).toFixed(2)}%.`);
  process.exit(1);
}

console.log("Eval gate passed.");
