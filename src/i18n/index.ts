import { en } from "./dict/en";
import { ru } from "./dict/ru";
import { uz } from "./dict/uz";
import { toOldUzbek, type Locale } from "./config";

export type Dict = Record<string, string>;
export type Params = Record<string, string | number | null | undefined>;

const cache = new Map<Locale, Dict>();

export function getDict(locale: Locale): Dict {
  const hit = cache.get(locale);
  if (hit) return hit;
  let d: Dict;
  if (locale === "en") d = en;
  else if (locale === "ru") d = { ...en, ...ru };
  else if (locale === "uz") d = { ...en, ...uz };
  else d = Object.fromEntries(Object.entries({ ...en, ...uz }).map(([k, v]) => [k, toOldUzbek(v)]));
  cache.set(locale, d);
  return d;
}

export function translate(dict: Dict, key: string, params?: Params) {
  const raw = dict[key] ?? key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, p) => (params[p] ?? "").toString());
}

export function hasKey(dict: Dict, key: string) {
  return key in dict;
}
