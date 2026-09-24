import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface StatusPageProps {
  icon: LucideIcon;
  code?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

/** Centered full-page message for 404s and errors. */
export function StatusPage({ icon: Icon, code, title, description, actions }: StatusPageProps) {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-400">
        <Icon className="size-7" />
      </div>
      {code && <p className="text-sm font-semibold tracking-widest text-brand-400">{code}</p>}
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-100">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-400">{description}</p>
      {actions && <div className="mt-6 flex flex-wrap items-center justify-center gap-2">{actions}</div>}
    </div>
  );
}

export const statusLinkClass =
  "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors";
