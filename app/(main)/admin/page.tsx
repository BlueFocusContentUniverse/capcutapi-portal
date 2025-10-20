import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminUsersManagement } from "@/components/admin-users-management";

export default async function AdminUsersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isSuperadmin = session?.user?.role === "superadmin";
  if (!session?.user || !isSuperadmin) {
    redirect("/");
  }
  return <AdminUsersManagement />;
}
