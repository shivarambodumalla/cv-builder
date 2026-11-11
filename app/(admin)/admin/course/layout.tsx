import { AdminSection } from "@/components/admin/admin-section";

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <AdminSection
        title="AI Product Design Course"
        description="Course page visitors, search performance, and leads."
        tabs={[
          { href: "/admin/course", label: "Funnel" },
          { href: "/admin/course/leads", label: "Leads" },
        ]}
      />
      {children}
    </div>
  );
}
