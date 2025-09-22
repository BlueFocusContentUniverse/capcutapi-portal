"use client";

import { I18nextProvider } from "react-i18next";

import { initI18n } from "@/lib/i18n/client";

type Props = {
  children: React.ReactNode;
  locale?: string;
};

const i18n = initI18n();

export default function I18NProvider({ children, locale }: Props) {
  // make sure the language is set at server side rendering
  i18n.changeLanguage(locale);
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
