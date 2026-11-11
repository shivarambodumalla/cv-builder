import { AdminSection } from "@/components/admin/admin-section";

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <AdminSection
        title="AI"
        description="What the AI features cost, the prompts they run, and the keyword lists behind the ATS score."
        tabs={[
          { href: "/admin/ai/usage", label: "Usage & spend" },
          { href: "/admin/ai/prompts", label: "Prompts" },
          { href: "/admin/ai/keywords", label: "Keywords" },
          { href: "/admin/ai/missing-roles", label: "Missing roles" },
          { href: "/admin/ai/settings", label: "Settings" },
        ]}
      />
      {children}
    </div>
  );
}
