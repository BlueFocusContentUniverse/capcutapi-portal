"use client";

import {
  Archive,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Home,
  LogOut,
  Menu,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ProfileDialog } from "@/components/profile-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { useSidebar } from "./admin-layout";

const navigation = [
  { key: "nav.dashboard", href: "/", icon: Home },
  { key: "nav.drafts", href: "/drafts", icon: FolderOpen },
  { key: "nav.video_tasks", href: "/video-tasks", icon: Trophy },
  { key: "nav.draft_archives", href: "/draft-archives", icon: Archive },
];

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const handleSignOut = () => {
    signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-sidebar border-r border-sidebar-border transform transition-all duration-200 ease-in-out md:translate-x-0",
          // Mobile behavior (slide in/out)
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // Desktop collapse behavior
          isCollapsed ? "md:w-16" : "md:w-64",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center border-b border-sidebar-border">
            <div
              className={cn("flex items-center", isCollapsed ? "px-2" : "px-6")}
            >
              <Image
                src="/kox-logo-web.png"
                alt="logo"
                width={32}
                height={32}
              />
              {!isCollapsed && (
                <span className="ml-2 text-lg font-semibold text-sidebar-foreground">
                  {t("sidebar.title")}
                </span>
              )}
            </div>
            {/* Collapse button - only visible on desktop */}
            <div className="ml-auto hidden md:block">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent/50"
                onClick={toggleCollapse}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-md transition-colors",
                      isCollapsed
                        ? "px-2 py-2 justify-center"
                        : "px-3 py-2 text-sm font-medium",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    )}
                    onClick={() => setIsOpen(false)}
                    title={isCollapsed ? t(item.key) : undefined}
                  >
                    <item.icon
                      className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")}
                    />
                    {!isCollapsed && <span>{t(item.key)}</span>}
                  </Link>
                );
              })}
              {session?.user?.email === "super@admin.com" && (
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center rounded-md transition-colors",
                    isCollapsed
                      ? "px-2 py-2 justify-center"
                      : "px-3 py-2 text-sm font-medium",
                    pathname === "/admin"
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  )}
                  onClick={() => setIsOpen(false)}
                  title={isCollapsed ? t("nav.admin") : undefined}
                >
                  <Users className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
                  {!isCollapsed && <span>{t("nav.admin")}</span>}
                </Link>
              )}
            </nav>

            <div
              className={cn(
                "mt-4",
                isCollapsed ? "px-2 flex justify-center" : "px-2",
              )}
            >
              <LanguageSwitcher />
            </div>
          </ScrollArea>

          {session && (
            <div
              className={cn(
                "border-t border-sidebar-border",
                isCollapsed ? "p-2" : "p-4",
              )}
            >
              <div
                className={cn(
                  "flex items-center mb-3",
                  isCollapsed ? "flex-col space-y-2 space-x-0" : "space-x-3",
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {session.user?.name || t("sidebar.admin_fallback")}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">
                      {session.user?.email || "admin@example.com"}
                    </p>
                  </div>
                )}
                <div className={cn(isCollapsed && "flex justify-center")}>
                  <ProfileDialog />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-sidebar-foreground hover:bg-sidebar-accent/50",
                  isCollapsed
                    ? "w-full justify-center px-2"
                    : "w-full justify-start",
                )}
                onClick={handleSignOut}
                title={isCollapsed ? t("nav.logout") : undefined}
              >
                <LogOut className="h-4 w-4" />
                {!isCollapsed && (
                  <span className="ml-2">{t("nav.logout")}</span>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
