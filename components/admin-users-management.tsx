"use client";

import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: "admin" | "superadmin";
};

export function AdminUsersManagement() {
  const { t } = useTranslation("translation");
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
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
        const msg =
          e instanceof Error ? e.message : t("admin_users.error_load_failed");
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((u) =>
      [u.name ?? "", u.email ?? "", u.role].some((v) =>
        v.toLowerCase().includes(q),
      ),
    );
  }, [items, search]);

  const onSubmit = async () => {
    setError(null);
    if (!form.name || !form.email || !form.password) {
      setError(t("admin_users.error_fill_all_fields"));
      return;
    }
    if (form.password.length < 6) {
      setError(t("admin_users.error_password_too_short"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `创建失败: ${res.status}`);
      }
      // refresh list
      const refreshed = await fetch("/api/admin/users");
      const data = await refreshed.json();
      setItems(data);
      setOpen(false);
      setForm({ name: "", email: "", password: "" });
    } catch (e: unknown) {
      console.error(e);
      const msg =
        e instanceof Error ? e.message : t("admin_users.error_create_failed");
      setError(msg);
    } finally {
      setSubmitting(false);
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
            {error && <div className="text-sm text-destructive">{error}</div>}
            <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="name">{t("admin_users.form_name")}</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("admin_users.form_email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  {t("admin_users.form_password")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, password: e.target.value }))
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  {t("admin_users.cancel")}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting
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
                        <Badge
                          variant={
                            u.role === "superadmin" ? "default" : "secondary"
                          }
                        >
                          {t(`admin_users.role_${u.role}`)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
