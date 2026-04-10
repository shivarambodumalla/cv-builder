import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Email Logs | CVEdge Admin" };
export const dynamic = "force-dynamic";

export default async function EmailLogsPage() {
  const supabase = createAdminClient();
  const { data: logs } = await supabase
    .from("email_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Email Logs</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2">To</th>
              <th className="pb-2">Template</th>
              <th className="pb-2">Subject</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Sent</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map((log) => (
              <tr key={log.id} className="border-b">
                <td className="py-2 font-medium max-w-[150px] truncate">{log.to_email}</td>
                <td className="py-2">{log.template_name}</td>
                <td className="py-2 text-muted-foreground max-w-[200px] truncate">{log.subject}</td>
                <td className="py-2">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${log.status === "sent" ? "bg-success/15 text-success" : "bg-error/15 text-error"}`}
                    title={log.error || undefined}
                  >
                    {log.status}
                  </span>
                </td>
                <td className="py-2 text-muted-foreground whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr><td colSpan={5} className="py-4 text-center text-muted-foreground">No emails sent yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
