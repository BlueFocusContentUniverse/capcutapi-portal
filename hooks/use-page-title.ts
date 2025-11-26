"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * A hook that sets the document title based on the user's selected language.
 * @param titleKey - The translation key for the page title (e.g., "page_titles.dashboard")
 * @param interpolationValues - Optional values to interpolate into the title (e.g., { draftId: "123" })
 */
export function usePageTitle(
  titleKey: string,
  interpolationValues?: Record<string, string>,
) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const title = t(titleKey, interpolationValues);
    document.title = title;
  }, [t, titleKey, i18n.language, interpolationValues]);
}
