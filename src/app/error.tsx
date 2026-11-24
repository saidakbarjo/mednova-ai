"use client";
import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-ink-soft">An unexpected error occurred. Please try again.</p>
        <div className="mt-6 flex justify-center gap-2"><button className="btn-primary" onClick={reset}>Try again</button><Link href="/" className="btn-ghost">Home</Link></div>
      </div>
    </div>
  );
}
