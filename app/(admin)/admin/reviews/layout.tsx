import { AdminSection } from "@/components/admin/admin-section";

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <AdminSection
        title="Expert Reviews"
        description="Paid CV reviews: the queue to work through, and how the service sells."
        tabs={[
          { href: "/admin/reviews", label: "Queue" },
          { href: "/admin/reviews/sales", label: "Sales" },
        ]}
      />
      {children}
    </div>
  );
}
