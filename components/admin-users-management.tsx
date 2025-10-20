"use client";

import { Plus, Search } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { nextApi } from "@/lib/service";

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: "admin" | "superadmin";
};

async function createAdminUser(
  prevState: { error: string | null },
  formData: FormData,
) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Please fill in all fields" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  try {
    const res = await nextApi.post("admin/users", {
      json: { name, email, password },
    });

    if (!res.ok) {
      const data = await res.json<{ error?: string }>().catch(() => ({}));
      return {
        error:
          (data as { error?: string }).error ||
          `Creation failed: ${res.status}`,
      };
    }

    // Return success state
    return { error: null };
  } catch (e) {
    console.error(e);
    return { error: e instanceof Error ? e.message : "Creation failed" };
  }
}

export function AdminUsersManagement() {
  const { t } = useTranslation();
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formState, formAction, isPending] = useActionState(createAdminUser, {
    error: null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error(`Load failed: ${res.status}`);
        const data: AdminUser[] = await res.json();
        setItems(data);
      } catch (e: unknown) {
        console.error(e);
        setError(t("admin_users.error_load_failed"));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // Handle successful form submission
  useEffect(() => {
    if (formState.error === null && !isPending) {
      // Form submission was successful, refresh the list and close dialog
      const refreshUsers = async () => {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        setItems(data);
      };
      refreshUsers();
      setOpen(false);
    }
  }, [formState.error, isPending]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((u) =>
      [u.name ?? "", u.email ?? "", u.role].some((v) =>
        v.toLowerCase().includes(q),
      ),
    );
  }, [items, search]);

  const doDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/users?id=${encodeURIComponent(deleteTarget.id)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Delete failed: ${res.status}`);
      }
      setItems((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Delete failed";
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("admin_users.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("admin_users.subtitle")}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t("admin_users.create_admin")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("admin_users.create_dialog_title")}</DialogTitle>
              <DialogDescription>
                {t("admin_users.create_dialog_description")}
              </DialogDescription>
            </DialogHeader>
            {formState.error && (
              <div className="text-sm text-destructive">{formState.error}</div>
            )}
            <form action={formAction} className="space-y-4" autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="name">{t("admin_users.form_name")}</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("admin_users.form_email")}</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  {t("admin_users.form_password")}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  {t("admin_users.cancel")}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? t("admin_users.creating")
                    : t("admin_users.create_button")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin_users.list_title")}</CardTitle>
          <CardDescription>{t("admin_users.list_description")}</CardDescription>
          {error && (
            <div className="text-sm text-destructive mb-4">{error}</div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={t("admin_users.search_placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin_users.form_name")}</TableHead>
                  <TableHead>{t("admin_users.form_email")}</TableHead>
                  <TableHead>{t("users.role")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground"
                    >
                      {t("admin_users.loading")}
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground"
                    >
                      {t("admin_users.no_data")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.name ?? "-"}</TableCell>
                      <TableCell>{u.email ?? "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              u.role === "superadmin" ? "default" : "secondary"
                            }
                          >
                            {t(`admin_users.role_${u.role}`)}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeleteTarget(u);
                              setDeleteOpen(true);
                            }}
                          >
                            {t("actions.delete")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("actions.delete")}</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `Are you sure you want to delete ${
                    deleteTarget.email ?? deleteTarget.name ?? deleteTarget.id
                  }? This action cannot be undone.`
                : "Are you sure?"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t("actions.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={doDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : t("actions.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
