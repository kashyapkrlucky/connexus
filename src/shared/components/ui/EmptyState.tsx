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
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-800 bg-gray-900/60 px-6 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-brand-500/10">
        <Icon className="size-6 text-brand-400" />
      </div>
      <div>
        <p className="font-medium text-gray-100">{title}</p>
        {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
