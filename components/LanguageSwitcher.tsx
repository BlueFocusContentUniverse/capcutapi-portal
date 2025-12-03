"use client";

import { Check, Globe } from "lucide-react";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cookieName } from "@/lib/i18n/settings";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  collapsed?: boolean;
}

export function LanguageSwitcher({ collapsed = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [, setCookie] = useCookies([cookieName]);

  const languages = [
    { code: "en", label: "English" },
    { code: "zh-Hans", label: "简体中文" },
    { code: "zh-Hant", label: "繁體中文" },
    { code: "jp", label: "日本語" },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);

    setCookie(cookieName, languageCode, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center text-sidebar-foreground hover:bg-sidebar-accent/50 text-sm",
            collapsed ? "justify-center px-2" : "space-x-2",
          )}
          title={collapsed ? currentLanguage.label : undefined}
        >
          <Globe className="w-4 h-4" />
          {!collapsed && <span>{currentLanguage.label}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" sideOffset={8}>
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className="cursor-pointer"
          >
            <span className="flex-1">{language.label}</span>
            {i18n.language === language.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
