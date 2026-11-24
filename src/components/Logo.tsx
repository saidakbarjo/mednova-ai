import Link from "next/link";
import clsx from "clsx";

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="lg-mark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#22D3EE" /><stop offset="1" stopColor="#2563EB" /></linearGradient>
        <linearGradient id="lg-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0F1F45" /><stop offset="1" stopColor="#050B1F" /></linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#lg-bg)" />
      <rect x="1" y="1" width="62" height="62" rx="17" fill="none" stroke="#22D3EE" strokeOpacity=".25" />
      <path d="M12 34h10l4-11 7 22 5-15 3 4h11" fill="none" stroke="url(#lg-mark)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ dark = false, href = "/" }: { dark?: boolean; href?: string }) {
  return (
    <Link href={href} className="group flex items-center gap-2.5" aria-label="MEDNOVA AI">
      <span className="transition group-hover:rotate-[-6deg] group-hover:scale-105"><LogoMark /></span>
      <span className={clsx("font-display text-[17px] font-extrabold tracking-tight", dark ? "text-white" : "text-ink")}>
        MEDNOVA<span className="bg-gradient-to-r from-brand-400 to-blue-500 bg-clip-text text-transparent"> AI</span>
      </span>
    </Link>
  );
}
