import Link from "next/link";
import type { ReactNode } from "react";

export function InformationPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="texture min-h-screen px-4 py-8 sm:px-6">
      <article className="mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] border border-[color:var(--line)] bg-[color:var(--card)] card-shadow">
        <header className="bg-[color:var(--night)] p-7 text-white sm:p-10">
          <Link href="/" className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">
            Neto Rodas Online
          </Link>
          <p className="mt-10 text-xs font-black uppercase tracking-[0.24em] text-orange-200">{eyebrow}</p>
          <h1 className="display-font mt-3 text-4xl font-black leading-none sm:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-7 text-stone-200">{intro}</p>
        </header>
        <div className="legal-content p-7 sm:p-10">{children}</div>
      </article>
    </main>
  );
}
