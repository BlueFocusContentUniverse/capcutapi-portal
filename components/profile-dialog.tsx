"use client";

import { Settings, User } from "lucide-react";
import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { nextApi } from "@/lib/service";

export function ProfileDialog() {
  const { data: session, refetch } = useSession();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(session?.user?.name ?? "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onOpenChange = (v: boolean) => {
    setOpen(v);
    if (v) {
      setName(session?.user?.name ?? "");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
      setSuccess(null);
    }
  };

  const handleSave = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        if (confirmPassword && !newPassword) {
          setError(t("profile_dialog.password_required_for_confirm"));
          return;
        }
        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
          setError(t("profile_dialog.mismatch_error"));
          return;
        }
        if (newPassword && oldPassword && oldPassword === newPassword) {
          setError(t("profile_dialog.old_new_password_same"));
          return;
        }
        if (newPassword && !oldPassword) {
          setError(t("profile_dialog.old_password_required"));
          return;
        }
        const payload: Record<string, string> = {};
        if (name && name !== session?.user?.name) payload.name = name;
        if (newPassword) {
          payload.oldPassword = oldPassword;
          payload.password = newPassword;
        }

        if (Object.keys(payload).length === 0) {
          setSuccess(t("profile_dialog.no_changes"));
          return;
        }

        const res = await nextApi.patch("me", { json: payload });
        if (!res.ok) {
          const text = await res.text();
          setError(text || `HTTP ${res.status}`);
          return;
        }
        const updated = (await res.json().catch(() => null)) as {
          name?: string;
        } | null;
        refetch();
        if (updated?.name) {
          setName(updated.name);
        }
        setSuccess(t("profile_dialog.save_success"));
      } catch {
        setError(t("profile_dialog.request_failed"));
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("profile_dialog.settings_aria") || "Profile settings"}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-4 w-4" /> {t("profile_dialog.title")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("profile_dialog.username")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("profile_dialog.placeholder_username") || ""}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oldPassword">
              {t("profile_dialog.old_password")}
            </Label>
            <Input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder={t("profile_dialog.placeholder_old_password") || ""}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">
              {t("profile_dialog.new_password")}
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("profile_dialog.placeholder_new_password") || ""}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t("profile_dialog.confirm_password")}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={
                t("profile_dialog.placeholder_confirm_password") || ""
              }
              disabled={isPending}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {success && <p className="text-sm text-green-600">{success}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isPending}>
            {t("actions.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
