import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/i18n/client";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = getT();
  return {
    title: { default: t("meta.title"), template: "%s · MEDNOVA AI" },
    description: t("meta.description"),
    icons: { icon: "/favicon.svg" },
    manifest: "/manifest.webmanifest",
  };
}
export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#F6F8FC" }, { media: "(prefers-color-scheme: dark)", color: "#050A18" }],
};

// Applies the saved theme before first paint (no flash)
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('mednova_theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, dict } = getT();
  const htmlLang = locale === "uz-old" ? "uz" : locale;
  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <I18nProvider locale={locale} dict={dict}>{children}</I18nProvider>
      </body>
    </html>
  );
}
