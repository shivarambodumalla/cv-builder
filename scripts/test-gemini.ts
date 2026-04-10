import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  console.log("Testing Gemini API (pay-as-you-go)...\n");

  // Test 1: Simple call
  const start = Date.now();
  try {
    const result = await model.generateContent("Reply with only: OK");
    console.log("Test 1 (simple):", result.response.text().trim(), `(${Date.now() - start}ms)`);
  } catch (err) {
    console.log("Test 1 FAILED:", (err as Error).message?.slice(0, 150));
  }

  // Test 2: Rapid burst — 3 calls in parallel
  console.log("\nTest 2: 3 parallel calls...");
  const results = await Promise.allSettled([
    model.generateContent("Reply with only: A"),
    model.generateContent("Reply with only: B"),
    model.generateContent("Reply with only: C"),
  ]);
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === "fulfilled") {
      console.log(`  Call ${i + 1}: OK —`, r.value.response.text().trim());
    } else {
      console.log(`  Call ${i + 1}: FAILED —`, r.reason?.message?.slice(0, 120));
    }
  }

  // Test 3: Larger payload (simulates fix-all)
  console.log("\nTest 3: Large payload (~2k tokens)...");
  const start3 = Date.now();
  try {
    const result = await model.generateContent(
      "Summarize this in 2 sentences: " + "Lorem ipsum dolor sit amet. ".repeat(100)
    );
    const usage = result.response.usageMetadata;
    console.log(`  OK — ${usage?.promptTokenCount} in / ${usage?.candidatesTokenCount} out (${Date.now() - start3}ms)`);
  } catch (err) {
    console.log("  FAILED:", (err as Error).message?.slice(0, 150));
  }

  console.log("\nDone.");
}

run();
