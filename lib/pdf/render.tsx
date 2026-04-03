import { execFileSync } from "child_process";
import path from "path";
import type { ResumeContent, ResumeDesignSettings } from "@/lib/resume/types";

export function renderCvPdf(
  data: ResumeContent,
  design: ResumeDesignSettings,
  watermark: boolean = false,
): Buffer {
  const workerPath = path.join(process.cwd(), "lib/pdf/worker.js");
  const input = JSON.stringify({ data, design, watermark });

  const result = execFileSync("node", [workerPath], {
    input,
    maxBuffer: 10 * 1024 * 1024,
    timeout: 30000,
  });

  return Buffer.from(result);
}
