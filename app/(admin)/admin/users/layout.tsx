import { AdminSection } from "@/components/admin/admin-section";

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <AdminSection
        title="Users"
        tabs={[
          { href: "/admin/users", label: "All users" },
          { href: "/admin/users/deleted", label: "Deleted accounts" },
        ]}
      />
      {children}
    </div>
  );
}
