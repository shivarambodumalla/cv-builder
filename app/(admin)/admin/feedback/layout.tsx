import { AdminSection } from "@/components/admin/admin-section";

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <AdminSection
        title="Feedback"
        description="Ratings after download. Published comments appear on /reviews and the homepage."
        tabs={[
          { href: "/admin/feedback", label: "Ratings" },
        ]}
      />
      {children}
    </div>
  );
}
