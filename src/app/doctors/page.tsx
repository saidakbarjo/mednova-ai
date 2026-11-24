import { DoctorDirectory } from "@/components/doctors/DoctorDirectory";
import { PublicShell } from "@/components/marketing/PublicShell";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";
export async function generateMetadata() { return { title: getT().t("dir.metaTitle") }; }

export default function DoctorsPage({ searchParams }: { searchParams: { specialization?: string } }) {
  const { t } = getT();
  return (
    <PublicShell>
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <div className="dot-bg absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="container-x relative py-14">
          <span className="eyebrow">{t("dir.eyebrow")}</span>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{t("dir.title")}</h1>
          <p className="mt-2 max-w-2xl text-ink-soft">{t("dir.subtitle")}</p>
        </div>
      </section>
      <div className="container-x py-10"><DoctorDirectory initialSpec={searchParams.specialization ?? ""} /></div>
    </PublicShell>
  );
}
