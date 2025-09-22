import { createInstance } from "i18next";
import ResourcesToBackend from "i18next-resources-to-backend";
import { cookies } from "next/headers";

import { cookieName, defaultNS, fallbackLng, languages } from "./settings";

const i18next = createInstance();

i18next
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

    preload: languages,

    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },

    ns: ["translation"],
    defaultNS,
  });

export async function serverTranslation(
  ns: string = defaultNS,
  options: any = {},
) {
  const cookieStore = await cookies();
  const lng = cookieStore.get(cookieName)?.value;

  if (lng && i18next.resolvedLanguage !== lng) {
    await i18next.changeLanguage(lng);
  }
  if (ns && !i18next.hasLoadedNamespace(ns)) {
    await i18next.loadNamespaces(ns);
  }
  return {
    t: i18next.getFixedT(
      lng ?? i18next.resolvedLanguage ?? fallbackLng,
      Array.isArray(ns) ? ns[0] : ns,
      options?.keyPrefix,
    ),
    i18n: i18next,
  };
}
