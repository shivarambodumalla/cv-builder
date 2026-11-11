import { AdminSection } from "@/components/admin/admin-section";

export default function EmailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <AdminSection
        title="Email"
        description="Transactional templates, campaigns, and everything sent."
        tabs={[
          { href: "/admin/email/templates", label: "Templates" },
          { href: "/admin/email/campaigns", label: "Campaigns" },
          { href: "/admin/email/logs", label: "Logs" },
        ]}
      />
      {children}
    </div>
  );
}
