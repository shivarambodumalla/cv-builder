import { AdminSection } from "@/components/admin/admin-section";

export default function GrowthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <AdminSection
        title="Growth"
        description="Where visitors come from, what they do, where they pay and where they drop off."
        tabs={[
          { href: "/admin/growth/traffic", label: "Traffic" },
          { href: "/admin/growth/funnel", label: "Funnel" },
          { href: "/admin/growth/paywall", label: "Paywall & popups" },
        ]}
      />
      {children}
    </div>
  );
}
