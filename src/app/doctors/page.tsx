import { DoctorDirectory } from "@/components/doctors/DoctorDirectory";
import { PublicShell } from "@/components/marketing/PublicShell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Find a doctor" };

export default function DoctorsPage({ searchParams }: { searchParams: { specialization?: string } }) {
  return (
    <PublicShell>
      <section className="border-b border-line bg-white">
        <div className="container-x py-12">
          <span className="eyebrow">Doctor directory</span>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Find the right specialist</h1>
          <p className="mt-2 max-w-2xl text-ink-soft">All doctors shown are verified by a MEDNOVA administrator. Profiles are fictional demonstration data.</p>
        </div>
      </section>
      <div className="container-x py-10"><DoctorDirectory initialSpec={searchParams.specialization ?? ""} /></div>
    </PublicShell>
  );
}
