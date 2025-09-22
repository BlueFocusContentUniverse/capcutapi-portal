import { Mountain } from "lucide-react";
import type React from "react";

import LoginForm from "@/components/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { serverTranslation } from "@/lib/i18n/server";

export default async function LoginPage() {
  const { t } = await serverTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-secondary rounded-full">
              <Mountain className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {t("login.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("login.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
