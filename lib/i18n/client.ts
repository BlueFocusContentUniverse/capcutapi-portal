import { createInstance } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ResourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";

import { cookieName, defaultNS, fallbackLng, languages } from "./settings";

const runsOnServerSide = typeof window === "undefined";

const i18n = createInstance();

export function initI18n() {
  i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(
      ResourcesToBackend(
        (language: string, namespace: string) =>
          import(`../../public/locales/${language}/${namespace}.json`),
      ),
    )
    .init({
      supportedLngs: languages,
      fallbackLng: fallbackLng,
      lng: undefined, // let detect the language on client side

      interpolation: {
        escapeValue: false, // React already escapes values
      },

      detection: {
        order: ["cookie", "localStorage", "navigator", "htmlTag"],
        caches: [cookieName],
        lookupCookie: cookieName,
        cookieOptions: {
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        },
      },

      preload: runsOnServerSide ? languages : [],

      ns: ["translation"],
      defaultNS: defaultNS,
    });

  return i18n;
}
