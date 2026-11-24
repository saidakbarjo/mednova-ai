export const LOCALES = ["uz", "uz-old", "ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "uz";
export const LOCALE_COOKIE = "mednova_lang";

export const LOCALE_META: Record<Locale, { label: string; short: string; hint: string }> = {
  uz: { label: "Özbekça", short: "UZ", hint: "Yangi lotin alifbosi" },
  "uz-old": { label: "O‘zbekcha", short: "UZ", hint: "Amaldagi lotin alifbosi" },
  ru: { label: "Русский", short: "RU", hint: "Русский язык" },
  en: { label: "English", short: "EN", hint: "English language" },
};

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

/** New Uzbek Latin alphabet (ö, ğ, ş, ç) → current alphabet (o‘, g‘, sh, ch). Mechanical and lossless. */
export function toOldUzbek(s: string) {
  return s
    .replace(/ö/g, "o‘").replace(/Ö/g, "O‘")
    .replace(/ğ/g, "g‘").replace(/Ğ/g, "G‘")
    .replace(/ş/g, "sh").replace(/Ş/g, "Sh")
    .replace(/ç/g, "ch").replace(/Ç/g, "Ch");
}

/** Normalise user text for keyword matching (any Uzbek alphabet → ASCII-ish old form). */
export function normalizeForMatch(s: string) {
  return s
    .toLowerCase()
    .replace(/[‘’ʻʼ`´]/g, "'")
    .replace(/ö/g, "o'").replace(/ğ/g, "g'").replace(/ş/g, "sh").replace(/ç/g, "ch");
}
