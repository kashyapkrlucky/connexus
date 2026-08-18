import CreateCommunityForm from "@/features/create-community/components/CreateCommunityForm";

export default function CreateCommunity() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-xl font-semibold tracking-tight text-gray-200">Create a community</h1>
      <p className="mb-6 text-sm text-gray-400">
        You&apos;ll be the owner and can add guidelines, invite members, and moderate posts.
      </p>
      <CreateCommunityForm />
    </div>
  );
}
