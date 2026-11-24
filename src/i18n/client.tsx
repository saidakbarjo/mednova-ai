"use client";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { LOCALE_COOKIE, type Locale } from "./config";
import { makeFormatter, type Formatter } from "./format";
import { translate, type Dict, type Params } from "./index";

type Ctx = { locale: Locale; t: (key: string, params?: Params) => string; f: Formatter; setLocale: (l: Locale) => void; has: (k: string) => boolean };
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ locale, dict, children }: { locale: Locale; dict: Dict; children: ReactNode }) {
  const t = useCallback((key: string, params?: Params) => translate(dict, key, params), [dict]);
  const value = useMemo<Ctx>(() => ({
    locale, t, f: makeFormatter(locale), has: (k) => k in dict,
    setLocale: (l) => {
      document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
      window.location.reload();
    },
  }), [locale, t, dict]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const c = useContext(I18nCtx);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}
