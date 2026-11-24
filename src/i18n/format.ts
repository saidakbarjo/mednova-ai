import { toOldUzbek, type Locale } from "./config";

const UZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const UZ_MONTHS_SHORT = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];
const UZ_DAYS = ["yakşanba", "duşanba", "seşanba", "çorşanba", "payşanba", "juma", "şanba"];
const UZ_DAYS_SHORT = ["Yak", "Duş", "Seş", "Çor", "Pay", "Jum", "Şan"];

const pad = (n: number) => String(n).padStart(2, "0");
const intlTag = (l: Locale) => (l === "ru" ? "ru-RU" : "en-GB");

export function makeFormatter(locale: Locale) {
  const uz = locale === "uz" || locale === "uz-old";
  const fix = (s: string) => (locale === "uz-old" ? toOldUzbek(s) : s);
  const d = (v: string | Date) => new Date(v);
  const time = (v: string | Date) => `${pad(d(v).getHours())}:${pad(d(v).getMinutes())}`;

  const f = {
    time,
    date: (v: string | Date) =>
      uz ? `${d(v).getDate()}-${UZ_MONTHS[d(v).getMonth()]}, ${d(v).getFullYear()}` : d(v).toLocaleDateString(intlTag(locale), { day: "numeric", month: "short", year: "numeric" }),
    dayMonth: (v: string | Date) =>
      uz ? `${d(v).getDate()}-${UZ_MONTHS_SHORT[d(v).getMonth()]}` : d(v).toLocaleDateString(intlTag(locale), { day: "numeric", month: "short" }),
    monthShort: (v: string | Date) => (uz ? UZ_MONTHS_SHORT[d(v).getMonth()] : d(v).toLocaleDateString(intlTag(locale), { month: "short" })),
    monthYear: (v: string | Date) =>
      uz ? `${UZ_MONTHS[d(v).getMonth()]} ${d(v).getFullYear()}` : d(v).toLocaleDateString(intlTag(locale), { month: "long", year: "numeric" }),
    monthChart: (v: string | Date) =>
      uz ? `${UZ_MONTHS_SHORT[d(v).getMonth()]} ${String(d(v).getFullYear()).slice(2)}` : d(v).toLocaleDateString(intlTag(locale), { month: "short", year: "2-digit" }),
    weekdayShort: (v: string | Date) => fix(uz ? UZ_DAYS_SHORT[d(v).getDay()] : d(v).toLocaleDateString(intlTag(locale), { weekday: "short" })),
    weekdayLong: (v: string | Date) => fix(uz ? UZ_DAYS[d(v).getDay()] : d(v).toLocaleDateString(intlTag(locale), { weekday: "long" })),
    dayName: (dow: number) => fix(uz ? UZ_DAYS[dow][0].toUpperCase() + UZ_DAYS[dow].slice(1) : new Date(2024, 0, 7 + dow).toLocaleDateString(intlTag(locale), { weekday: "long" })),
    dayShortName: (dow: number) => fix(uz ? UZ_DAYS_SHORT[dow] : new Date(2024, 0, 7 + dow).toLocaleDateString(intlTag(locale), { weekday: "short" })),
    dateTime: (v: string | Date) =>
      uz ? `${fix(UZ_DAYS_SHORT[d(v).getDay()])}, ${d(v).getDate()}-${UZ_MONTHS_SHORT[d(v).getMonth()]}, ${time(v)}`
        : d(v).toLocaleString(intlTag(locale), { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
    fullDate: (v: string | Date) =>
      uz ? fix(`${UZ_DAYS[d(v).getDay()][0].toUpperCase()}${UZ_DAYS[d(v).getDay()].slice(1)}, ${d(v).getDate()}-${UZ_MONTHS[d(v).getMonth()]}, ${d(v).getFullYear()}`)
        : d(v).toLocaleDateString(intlTag(locale), { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    relative: (v: string | Date) => {
      const diff = (Date.now() - d(v).getTime()) / 1000;
      const L = {
        uz: ["hozirgina", "daq. oldin", "soat oldin", "kun oldin"],
        "uz-old": ["hozirgina", "daq. oldin", "soat oldin", "kun oldin"],
        ru: ["только что", "мин назад", "ч назад", "дн назад"],
        en: ["just now", "min ago", "h ago", "d ago"],
      }[locale];
      if (diff < 60) return L[0];
      if (diff < 3600) return `${Math.floor(diff / 60)} ${L[1]}`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} ${L[2]}`;
      if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} ${L[3]}`;
      return f.date(v);
    },
    number: (n: number) => n.toLocaleString(locale === "ru" ? "ru-RU" : locale === "en" ? "en-US" : "uz-UZ").replace(/,/g, " "),
  };
  return f;
}
export type Formatter = ReturnType<typeof makeFormatter>;
