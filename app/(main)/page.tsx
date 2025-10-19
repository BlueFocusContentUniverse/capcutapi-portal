import { Users } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { serverTranslation } from "@/lib/i18n/server";

export default async function DashboardPage() {
  const { t } = await serverTranslation();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isSuperadmin = session?.user?.email === "admin@example.com";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("dashboard.subtitle")}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isSuperadmin && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Users className="mr-2 h-5 w-5 text-primary" />
                用户管理
              </CardTitle>
              <CardDescription>
                查看和管理用户账户、个人资料和活动
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button variant="outline" className="w-full bg-transparent">
                  管理用户
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
