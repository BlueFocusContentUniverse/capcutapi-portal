"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "forget-password",
      });

      if (error) {
        setError(error.message || t("forgot_password.send_otp_error"));
      } else {
        setSuccess(t("forgot_password.otp_sent"));
        setStep("otp");
      }
    } catch {
      setError(t("forgot_password.send_otp_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await authClient.emailOtp.checkVerificationOtp({
        email,
        type: "forget-password",
        otp,
      });

      if (error) {
        setError(error.message || t("forgot_password.invalid_otp"));
      } else {
        setStep("reset");
      }
    } catch {
      setError(t("forgot_password.invalid_otp"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError(t("forgot_password.password_mismatch"));
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError(t("forgot_password.password_too_short"));
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await authClient.emailOtp.resetPassword({
        email,
        otp,
        password: newPassword,
      });

      if (error) {
        setError(error.message || t("forgot_password.reset_error"));
      } else {
        setSuccess(t("forgot_password.reset_success"));
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch {
      setError(t("forgot_password.reset_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "forget-password",
      });

      if (error) {
        setError(error.message || t("forgot_password.send_otp_error"));
      } else {
        setSuccess(t("forgot_password.otp_resent"));
      }
    } catch {
      setError(t("forgot_password.send_otp_error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t("forgot_password.error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertTitle>{t("forgot_password.success")}</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {step === "email" && (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("forgot_password.email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t("forgot_password.email_placeholder")}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? t("forgot_password.sending")
              : t("forgot_password.send_otp")}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">{t("forgot_password.otp")}</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder={t("forgot_password.otp_placeholder")}
              maxLength={6}
              className="text-center text-2xl tracking-[0.5em]"
            />
            <p className="text-sm text-muted-foreground">
              {t("forgot_password.otp_sent_to", { email })}
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? t("forgot_password.verifying")
              : t("forgot_password.verify_otp")}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={handleResendOTP}
            disabled={isLoading}
          >
            {t("forgot_password.resend_otp")}
          </Button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">
              {t("forgot_password.new_password")}
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder={t("forgot_password.new_password_placeholder")}
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t("forgot_password.confirm_password")}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder={t("forgot_password.confirm_password_placeholder")}
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? t("forgot_password.resetting")
              : t("forgot_password.reset_password")}
          </Button>
        </form>
      )}

      <div className="text-center text-sm text-muted-foreground">
        {t("forgot_password.remember_password")}{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline underline-offset-2"
        >
          {t("forgot_password.back_to_login")}
        </Link>
      </div>
    </div>
  );
}
