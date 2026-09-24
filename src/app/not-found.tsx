import { TopBar } from "@/shared/components/layout/TopBar";
import { NotFoundContent } from "@/shared/components/layout/NotFoundContent";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <NotFoundContent />
    </div>
  );
}
