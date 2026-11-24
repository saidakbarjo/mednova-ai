import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { getDict, translate, type Params } from "./index";

export function getLocale(): Locale {
  try {
    const c = cookies().get(LOCALE_COOKIE)?.value;
    if (isLocale(c)) return c;
    const al = headers().get("accept-language")?.toLowerCase() ?? "";
    if (al.startsWith("ru")) return "ru";
    if (al.startsWith("en") && !al.includes("uz")) return DEFAULT_LOCALE;
  } catch {
    /* outside a request */
  }
  return DEFAULT_LOCALE;
}

export function getT(locale = getLocale()) {
  const dict = getDict(locale);
  return { locale, dict, t: (key: string, params?: Params) => translate(dict, key, params) };
}
