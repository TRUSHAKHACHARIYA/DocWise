import fs from "node:fs";
import path from "node:path";

const maxResponseMs = Number(process.env.MAX_RESPONSE_MS ?? "6000");
const maxFirstTokenMs = Number(process.env.MAX_FIRST_TOKEN_MS ?? "2500");
const maxErrorRate = Number(process.env.MAX_ERROR_RATE ?? "0.05");

const candidatePaths = [
  path.join(process.cwd(), "backend", "evals", "results", "latest_run.json"),
  path.join(process.cwd(), "evals", "results", "latest_run.json"),
];

const resultPath = candidatePaths.find((filePath) => fs.existsSync(filePath));
if (!resultPath) {
  console.error("No eval result file found for perf budget checks.");
  process.exit(1);
}

const rows = JSON.parse(fs.readFileSync(resultPath, "utf8"));
if (!Array.isArray(rows) || rows.length === 0) {
  console.error("Perf budget check failed: empty eval result set.");
  process.exit(1);
}

const withLatency = rows.filter((row) => Number.isFinite(row.latencyMs));
const withFirstToken = rows.filter((row) => Number.isFinite(row.firstTokenMs));
const failures = rows.filter((row) => row.status !== "PASS").length;

const p95 = (values) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(0.95 * sorted.length) - 1);
  return sorted[index];
};

const p95Latency = p95(withLatency.map((row) => row.latencyMs));
const p95FirstToken = p95(withFirstToken.map((row) => row.firstTokenMs));
const errorRate = failures / rows.length;

if (p95Latency !== null) {
  console.log(`p95 latency: ${p95Latency}ms (budget ${maxResponseMs}ms)`);
  if (p95Latency > maxResponseMs) {
    console.error("Perf budget failed: p95 latency exceeded.");
    process.exit(1);
  }
} else {
  console.log("No latencyMs values found in eval output. Skipping latency budget.");
}

if (p95FirstToken !== null) {
  console.log(`p95 first token: ${p95FirstToken}ms (budget ${maxFirstTokenMs}ms)`);
  if (p95FirstToken > maxFirstTokenMs) {
    console.error("Perf budget failed: p95 first token latency exceeded.");
    process.exit(1);
  }
} else {
  console.log("No firstTokenMs values found in eval output. Skipping first token budget.");
}

console.log(`error rate: ${(errorRate * 100).toFixed(2)}% (budget ${(maxErrorRate * 100).toFixed(2)}%)`);
if (errorRate > maxErrorRate) {
  console.error("Perf budget failed: error rate exceeded.");
  process.exit(1);
}

console.log("Perf budget check passed.");
