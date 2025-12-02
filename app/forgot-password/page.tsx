import { Mountain } from "lucide-react";

import ForgotPasswordForm from "@/components/forgot-password-form";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { serverTranslation } from "@/lib/i18n/server";

export default async function ForgotPasswordPage() {
  const { t } = await serverTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-secondary rounded-full">
              <Mountain className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {t("forgot_password.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("forgot_password.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
