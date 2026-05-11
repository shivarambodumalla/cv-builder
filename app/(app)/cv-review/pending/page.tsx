"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CvReviewPendingPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Processing your payment...");

  useEffect(() => {
    async function run() {
      await new Promise((r) => setTimeout(r, 3000));
      const { getPendingCV, clearPendingCV } = await import("@/lib/cv-review/storage");
      const file = await getPendingCV();
      
      if (!file) {
        router.push("/cv-review/history");
        return;
      }
      setStatus("Uploading your CV...");
      const reviewsRes = await fetch("/api/cv-review/my-reviews");
      if (!reviewsRes.ok) {
        router.push("/cv-review/history");
        return;
      }
      const { reviews } = (await reviewsRes.json()) as {
        reviews: Array<{ id: string; status: string }>;
      };
      const pending = reviews.find(
        (r) => r.status === "pending" || r.status === "in_progress"
      );
      if (!pending) {
        router.push("/cv-review/history");
        return;
      }
      
      const form = new FormData();
      form.append("review_id", pending.id);
      form.append("file", file);
      await fetch("/api/cv-review/upload", { method: "POST", body: form });
      await clearPendingCV();
      router.push(`/cv-review/${pending.id}`);
    }
    run().catch(() => router.push("/cv-review/history"));
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="text-4xl mb-4">⏳</div>
      <h1 className="text-xl font-semibold mb-2">{status}</h1>
      <p className="text-muted-foreground text-sm">Please wait, do not close this page.</p>
    </div>
  );
}
