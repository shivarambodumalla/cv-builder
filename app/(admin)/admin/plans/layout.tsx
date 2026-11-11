import { AdminSection } from "@/components/admin/admin-section";

export default function PlansLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <AdminSection
        title="Plans & Pricing"
        description="Free and Pro quotas, template access, and the Lemon Squeezy prices behind checkout."
        tabs={[
          { href: "/admin/plans", label: "Quotas & templates" },
          { href: "/admin/plans/prices", label: "Prices" },
        ]}
      />
      {children}
    </div>
  );
}
