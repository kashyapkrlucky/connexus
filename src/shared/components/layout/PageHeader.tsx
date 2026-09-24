import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
}

/** Standard page title; place it first in a `flex flex-col gap-6` page wrapper. */
export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header>
      <h1 className="text-2xl font-bold tracking-tight text-gray-200">{title}</h1>
      {description && <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{description}</p>}
    </header>
  );
}
