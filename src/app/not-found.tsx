import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-6 text-center">
      <div>
        <div className="flex justify-center"><LogoMark size={56} /></div>
        <p className="mt-6 font-display text-6xl font-extrabold text-navy-900">404</p>
        <h1 className="mt-2 text-xl font-semibold">This page could not be found</h1>
        <p className="mt-2 text-ink-soft">The link may be broken or the page may have been removed.</p>
        <div className="mt-6 flex justify-center gap-2"><Link href="/" className="btn-primary">Go home</Link><Link href="/doctors" className="btn-ghost">Find a doctor</Link></div>
      </div>
    </div>
  );
}
