import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-200 bg-white/60 px-6 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-brand-50">
        <Icon className="size-6 text-brand-500" />
      </div>
      <div>
        <p className="font-medium text-neutral-900">{title}</p>
        {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
