import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { AdminUsersManagement } from "../../../components/admin-users-management";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "superadmin") {
    redirect("/");
  }
  return <AdminUsersManagement />;
}
