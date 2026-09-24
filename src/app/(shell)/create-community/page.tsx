import CreateCommunityForm from "@/features/create-community/components/CreateCommunityForm";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export default function CreateCommunity() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Create a community"
        description="You'll be the owner and can add guidelines, invite members, and moderate posts."
      />
      <CreateCommunityForm />
    </div>
  );
}
