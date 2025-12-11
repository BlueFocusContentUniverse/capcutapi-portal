import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminUsersManagement } from "@/components/admin-users-management";
import { serverTranslation } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverTranslation();
  return {
    title: t("page_titles.admin"),
  };
}

export default async function AdminUsersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAdmin = session?.user?.role === "admin";
  if (!session?.user || !isAdmin) {
    redirect("/");
  }
  return <AdminUsersManagement />;
}
