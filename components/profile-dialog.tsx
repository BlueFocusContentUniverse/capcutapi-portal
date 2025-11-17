"use client";

import { Key, Lock, Settings, Trash2, User } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient, useSession } from "@/lib/auth-client";
import { nextApi } from "@/lib/service";

type Passkey = {
  id: string;
  name?: string;
  deviceType: string;
  createdAt?: Date | string;
};

export function ProfileDialog() {
  const { data: session, refetch } = useSession();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile tab state
  const [name, setName] = useState(session?.user?.name ?? "");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isProfilePending, startProfileTransition] = useTransition();

  // Password tab state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isPasswordPending, startPasswordTransition] = useTransition();

  // Passkey tab state
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [passkeySuccess, setPasskeySuccess] = useState<string | null>(null);
  const [isPasskeyPending, startPasskeyTransition] = useTransition();
  const [isLoadingPasskeys, setIsLoadingPasskeys] = useState(false);

  useEffect(() => {
    if (open && activeTab === "passkey") {
      loadPasskeys();
    }
  }, [open, activeTab]);

  const loadPasskeys = async () => {
    setIsLoadingPasskeys(true);
    setPasskeyError(null);
    try {
      const result = await authClient.passkey.listUserPasskeys();
      if (result?.error) {
        setPasskeyError(t("profile_dialog.passkey.load_error"));
      } else if (result?.data) {
        setPasskeys(result.data || []);
      }
    } catch {
      setPasskeyError(t("profile_dialog.passkey.load_error"));
    } finally {
      setIsLoadingPasskeys(false);
    }
  };

  const onOpenChange = (v: boolean) => {
    setOpen(v);
    if (v) {
      setName(session?.user?.name ?? "");
      setEmail(session?.user?.email ?? "");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setProfileError(null);
      setProfileSuccess(null);
      setPasswordError(null);
      setPasswordSuccess(null);
      setPasskeyError(null);
      setPasskeySuccess(null);
      setActiveTab("profile");
    }
  };

  const handleProfileSave = () => {
    setProfileError(null);
    setProfileSuccess(null);
    startProfileTransition(async () => {
      try {
        const payload: Record<string, string> = {};
        if (name && name !== session?.user?.name) payload.name = name;
        if (email && email !== session?.user?.email) payload.email = email;

        if (Object.keys(payload).length === 0) {
          setProfileSuccess(t("profile_dialog.no_changes"));
          return;
        }

        const res = await nextApi.patch("me", { json: payload });
        if (!res.ok) {
          const text = await res.text();
          setProfileError(text || `HTTP ${res.status}`);
          return;
        }
        refetch();
        setProfileSuccess(t("profile_dialog.save_success"));
      } catch {
        setProfileError(t("profile_dialog.request_failed"));
      }
    });
  };

  const handlePasswordSave = () => {
    setPasswordError(null);
    setPasswordSuccess(null);
    startPasswordTransition(async () => {
      try {
        if (confirmPassword && !newPassword) {
          setPasswordError(t("profile_dialog.password_required_for_confirm"));
          return;
        }
        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
          setPasswordError(t("profile_dialog.mismatch_error"));
          return;
        }
        if (newPassword && oldPassword && oldPassword === newPassword) {
          setPasswordError(t("profile_dialog.old_new_password_same"));
          return;
        }
        if (newPassword && !oldPassword) {
          setPasswordError(t("profile_dialog.old_password_required"));
          return;
        }
        if (!newPassword) {
          setPasswordSuccess(t("profile_dialog.no_changes"));
          return;
        }

        const payload = {
          oldPassword,
          password: newPassword,
        };

        const res = await nextApi.patch("me", { json: payload });
        if (!res.ok) {
          const text = await res.text();
          setPasswordError(text || `HTTP ${res.status}`);
          return;
        }
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordSuccess(t("profile_dialog.save_success"));
      } catch {
        setPasswordError(t("profile_dialog.request_failed"));
      }
    });
  };

  const handleCreatePasskey = async () => {
    setPasskeyError(null);
    setPasskeySuccess(null);
    startPasskeyTransition(async () => {
      try {
        const result = await authClient.passkey.addPasskey({
          name: session?.user?.email || session?.user?.name || undefined,
        });

        if (result?.error) {
          setPasskeyError(
            result.error.message || t("profile_dialog.passkey.create_error"),
          );
          return;
        }

        if (result?.data) {
          setPasskeySuccess(t("profile_dialog.passkey.create_success"));
          await loadPasskeys();
        }
      } catch (err) {
        console.error("Passkey creation error:", err);
        setPasskeyError(t("profile_dialog.passkey.create_error"));
      }
    });
  };

  const handleDeletePasskey = async (passkeyId: string) => {
    if (!confirm(t("profile_dialog.passkey.delete_confirm"))) {
      return;
    }

    setPasskeyError(null);
    setPasskeySuccess(null);
    startPasskeyTransition(async () => {
      try {
        const result = await authClient.passkey.deletePasskey({
          id: passkeyId,
        });

        if (result?.error) {
          setPasskeyError(
            result.error.message || t("profile_dialog.passkey.delete_error"),
          );
          return;
        }

        if (result?.data) {
          setPasskeySuccess(t("profile_dialog.passkey.delete_success"));
          await loadPasskeys();
        }
      } catch {
        setPasskeyError(t("profile_dialog.passkey.delete_error"));
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-4 w-4" /> {t("profile_dialog.title")}
          </DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              {t("profile_dialog.tabs.profile")}
            </TabsTrigger>
            <TabsTrigger value="password">
              <Lock className="h-4 w-4 mr-2" />
              {t("profile_dialog.tabs.password")}
            </TabsTrigger>
            <TabsTrigger value="passkey">
              <Key className="h-4 w-4 mr-2" />
              {t("profile_dialog.tabs.passkey")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("profile_dialog.username")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("profile_dialog.placeholder_username") || ""}
                disabled={isProfilePending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("profile_dialog.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("profile_dialog.placeholder_email") || ""}
                disabled={isProfilePending}
              />
            </div>
            {profileError && (
              <p className="text-sm text-red-600" role="alert">
                {profileError}
              </p>
            )}
            {profileSuccess && (
              <p className="text-sm text-green-600">{profileSuccess}</p>
            )}
            <DialogFooter>
              <Button onClick={handleProfileSave} disabled={isProfilePending}>
                {t("actions.save")}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="password" className="space-y-4 mt-4">
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
                disabled={isPasswordPending}
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
                disabled={isPasswordPending}
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
                disabled={isPasswordPending}
              />
            </div>
            {passwordError && (
              <p className="text-sm text-red-600" role="alert">
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-green-600">{passwordSuccess}</p>
            )}
            <DialogFooter>
              <Button onClick={handlePasswordSave} disabled={isPasswordPending}>
                {t("actions.save")}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="passkey" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t("profile_dialog.passkey.description")}
                </p>
                <Button
                  onClick={handleCreatePasskey}
                  disabled={isPasskeyPending}
                  size="sm"
                >
                  {t("profile_dialog.passkey.create")}
                </Button>
              </div>

              {isLoadingPasskeys ? (
                <p className="text-sm text-muted-foreground">
                  {t("common.loading")}
                </p>
              ) : passkeys.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("profile_dialog.passkey.no_passkeys")}
                </p>
              ) : (
                <div className="space-y-2">
                  {passkeys.map((passkey) => (
                    <div
                      key={passkey.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {passkey.name || t("profile_dialog.passkey.unnamed")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {passkey.deviceType}
                          {passkey.createdAt &&
                            ` · ${(passkey.createdAt instanceof Date ? passkey.createdAt : new Date(passkey.createdAt)).toLocaleDateString()}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePasskey(passkey.id)}
                        disabled={isPasskeyPending}
                        aria-label={t("profile_dialog.passkey.delete")}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {passkeyError && (
                <p className="text-sm text-red-600" role="alert">
                  {passkeyError}
                </p>
              )}
              {passkeySuccess && (
                <p className="text-sm text-green-600">{passkeySuccess}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
