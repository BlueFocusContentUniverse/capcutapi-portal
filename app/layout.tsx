import "./globals.css";

import { dir } from "i18next";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import type React from "react";

import { CookiesProviderWrapper } from "@/components/cookies-provider";
import { SessionProvider } from "@/components/session-provider";
import I18NProvider from "@/lib/i18n/client-provider";
import { cookieName } from "@/lib/i18n/settings";

export const metadata: Metadata = {
  title: "JYAPI 管理系统",
  description: "JYAPI 管理系统",
  generator: "JYAPI 管理中心",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lng = cookieStore.get(cookieName)?.value;

  return (
    <html lang={lng ?? "en"} dir={dir(lng ?? "en")}>
      <body className={`font-sans`}>
        <I18NProvider locale={lng ?? "en"}>
          <CookiesProviderWrapper>
            <SessionProvider>{children}</SessionProvider>
          </CookiesProviderWrapper>
        </I18NProvider>
      </body>
    </html>
  );
}
