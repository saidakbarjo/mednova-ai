import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export async function PublicShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  return (
    <>
      <SiteHeader signedIn={!!user} dark={false} />
      <main className="min-h-screen pt-16">{children}</main>
      <SiteFooter />
    </>
  );
}
