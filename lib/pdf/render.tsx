import { execFileSync } from "child_process";
import path from "path";
import fs from "fs";
import type { ResumeContent, ResumeDesignSettings } from "@/lib/resume/types";

function findWorkerPath(): string {
  const candidates = [
    path.join(process.cwd(), "lib/pdf/worker.js"),
    path.join(__dirname, "worker.js"),
    path.resolve("lib/pdf/worker.js"),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }

  return candidates[0];
}

export function renderCvPdf(
  data: ResumeContent,
  design: ResumeDesignSettings,
  watermark: boolean = false,
): Buffer {
  const workerPath = findWorkerPath();
  const input = JSON.stringify({ data, design, watermark });

  const result = execFileSync("node", [workerPath], {
    input,
    maxBuffer: 10 * 1024 * 1024,
    timeout: 30000,
  });

  return Buffer.from(result);
}
