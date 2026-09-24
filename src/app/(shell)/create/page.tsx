import CreatePostForm from "@/features/create/components/CreatePostForm";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export default function Create() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title="Create a post" description="Share something with one of your communities." />
      <CreatePostForm />
    </div>
  );
}
