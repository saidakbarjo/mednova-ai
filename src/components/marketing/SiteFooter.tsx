import Link from "next/link";
import { Logo } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="bg-navy-950 text-white/70">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            An intelligent healthcare platform connecting patients, doctors and administrators — with an educational AI assistant built for safety.
          </p>
          <p className="mt-5 text-xs text-white/45">
            MEDNOVA AI is a university project. It does not provide medical diagnosis or emergency care.
            In an emergency call <span className="font-semibold text-white/80">103</span> (Uzbekistan) or <span className="font-semibold text-white/80">112</span> (EU).
          </p>
        </div>
        {[
          { title: "Platform", links: [["Find a doctor", "/doctors"], ["AI Assistant", "/assistant"], ["Patient dashboard", "/dashboard/patient"], ["Create account", "/register"]] },
          { title: "Project", links: [["Overview", "/presentation"], ["Architecture", "/presentation#architecture"], ["Database ERD", "/presentation#database"], ["API reference", "/presentation#api"]] },
          { title: "Demo", links: [["Demo accounts", "/presentation#demo"], ["Sign in", "/login"], ["Tech stack", "/presentation#stack"], ["Credits", "/presentation#credits"]] },
        ].map((col) => (
          <div key={col.title}>
            <p className="font-display text-sm font-semibold text-white">{col.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map(([label, href]) => (
                <li key={href}><Link href={href} className="transition hover:text-brand-300">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/45 sm:flex-row">
          <p>© {new Date().getFullYear()} MEDNOVA AI · Designed & built by <span className="font-semibold text-white/80">Saidakbar & Zukhra</span></p>
          <p>All people and medical data shown are fictional demonstration content.</p>
        </div>
      </div>
    </footer>
  );
}
