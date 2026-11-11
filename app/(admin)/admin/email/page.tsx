import { redirect } from "next/navigation";

export default function EmailIndex() {
  redirect("/admin/email/templates");
}
