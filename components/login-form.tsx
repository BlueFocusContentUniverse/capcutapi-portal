"use client";

import { Key, Vault } from "lucide-react";
import { useActionState, useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";

import { loginAction } from "@/app/login/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type State = {
  error: string | null;
  redirectURL: string | null;
};

export default function LoginForm() {
  const { t } = useTranslation();
  const [state, formAction, pending] = useActionState<State, FormData>(
    loginAction,
    { error: null, redirectURL: null },
  );
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [isPasskeyPending, startPasskeyTransition] = useTransition();
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [isOAuthPending, startOAuthTransition] = useTransition();

  useEffect(() => {
    if (state?.redirectURL) {
      window.location.href = state.redirectURL;
    }
  }, [state.redirectURL]);

  // Preload passkeys for conditional UI (autofill)
  useEffect(() => {
    if (
      typeof PublicKeyCredential !== "undefined" &&
      PublicKeyCredential.isConditionalMediationAvailable
    ) {
      PublicKeyCredential.isConditionalMediationAvailable().then(
        (available) => {
          if (available) {
            void authClient.signIn.passkey({ autoFill: true });
          }
        },
      );
    }
  }, []);

  const handlePasskeySignIn = () => {
    setPasskeyError(null);
    startPasskeyTransition(async () => {
      try {
        const result = await authClient.signIn.passkey({
          autoFill: false,
          fetchOptions: {
            onSuccess() {
              window.location.href = "/";
            },
            onError(context: { error?: { message?: string } }) {
              setPasskeyError(
                context.error?.message || t("login.passkey_error"),
              );
            },
          },
        });

        if (result?.error) {
          setPasskeyError(result.error.message || t("login.passkey_error"));
        }
      } catch (err) {
        console.error("Passkey sign-in error:", err);
        setPasskeyError(t("login.passkey_error"));
      }
    });
  };

  const handleGoogleSignIn = () => {
    setOauthError(null);
    startOAuthTransition(async () => {
      try {
        const result = await authClient.signIn.social({
          provider: "google",
        });

        if (result?.error) {
          setOauthError(result.error.message || t("login.google_error"));
        }
      } catch (err) {
        console.error("Google sign-in error:", err);
        setOauthError(t("login.google_error"));
      }
    });
  };

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4" autoComplete="off">
        {state?.error ? (
          <Alert variant="destructive">
            <AlertTitle>{t("login.error")}</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        {passkeyError ? (
          <Alert variant="destructive">
            <AlertTitle>{t("login.error")}</AlertTitle>
            <AlertDescription>{passkeyError}</AlertDescription>
          </Alert>
        ) : null}

        {oauthError ? (
          <Alert variant="destructive">
            <AlertTitle>{t("login.error")}</AlertTitle>
            <AlertDescription>{oauthError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">{t("login.email")}</Label>
          <Input
            id="email"
            type="text"
            name="email"
            required
            placeholder={t("login.email_placeholder")}
            autoComplete="username webauthn"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("login.password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder={t("login.password_placeholder")}
            autoComplete="current-password webauthn"
          />
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("login.submitting") : t("login.submit")}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("login.or")}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handlePasskeySignIn}
        disabled={isPasskeyPending || pending || isOAuthPending}
      >
        <Key className="mr-2 h-4 w-4" />
        {isPasskeyPending
          ? t("login.passkey_signing_in")
          : t("login.sign_in_with_passkey")}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={isOAuthPending || pending || isPasskeyPending}
      >
        <Vault className="mr-2 h-4 w-4" />
        {isOAuthPending
          ? t("login.google_signing_in")
          : t("login.sign_in_with_google")}
      </Button>
    </div>
  );
}
