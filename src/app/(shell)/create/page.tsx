import CreatePostForm from "@/features/create/components/CreatePostForm";

export default function Create() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-gray-200">Create a post</h1>
      <CreatePostForm />
    </div>
  );
}
