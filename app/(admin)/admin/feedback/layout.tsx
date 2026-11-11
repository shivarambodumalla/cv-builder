import { AdminSection } from "@/components/admin/admin-section";

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <AdminSection
        title="Feedback"
        description="Ratings after download, and the testimonials published from them."
        tabs={[
          { href: "/admin/feedback", label: "Ratings" },
          { href: "/admin/feedback/testimonials", label: "Testimonials" },
        ]}
      />
      {children}
    </div>
  );
}
