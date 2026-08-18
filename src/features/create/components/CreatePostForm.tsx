"use client";
import { useHomeStore } from "@/features/home/store/useHomeStore";
import { useCreatePostStore } from "../store/useCreatePostStore";
import { uploadImage } from "@/shared/utils/uploadImage";
import { Button } from "@/shared/components/ui/Button";
import { ImageUpload } from "@/shared/components/ui/ImageUpload";
import { Input } from "@/shared/components/ui/Input";
import { Textarea } from "@/shared/components/ui/Textarea";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreatePostForm() {
  const { memberships, getMemberships } = useHomeStore();
  const {
    communityId,
    title,
    content,
    imageUrl,
    submitting,
    error,
    setCommunityId,
    setTitle,
    setContent,
    setImageUrl,
    submitPost,
  } = useCreatePostStore();
  const router = useRouter();

  const canSubmit = Boolean(communityId) && title.trim().length > 0 && (content.trim().length > 0 || Boolean(imageUrl));

  useEffect(() => {
    getMemberships();
  }, [getMemberships]);

  useEffect(() => {
    if (!communityId && memberships.length > 0) {
      setCommunityId(memberships[0].id);
    }
  }, [memberships, communityId, setCommunityId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    const post = await submitPost();
    if (post) {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-200">Community</label>
        {memberships.length === 0 ? (
          <p className="text-sm text-gray-200">
            You haven&apos;t joined any communities yet. Join one first to post.
          </p>
        ) : (
          <select
            value={communityId}
            onChange={(e) => setCommunityId(e.target.value)}
            className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-sm text-gray-200 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500/10"
          >
            {memberships.map((c) => (
              <option key={c.id} value={c.id}>
                c/{c.slug}
              </option>
            ))}
          </select>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-200">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's your post about?"
          maxLength={300}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-200">Text (optional if you add an image)</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share the details..."
          rows={5}
        />
      </div>
      <ImageUpload
        value={imageUrl}
        onChange={setImageUrl}
        onUpload={(file) => uploadImage(file, "post")}
        label="Add an image"
        previewClassName="w-full h-48"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" variant="primary" size="md" disabled={!canSubmit} loading={submitting} className="self-start">
        Submit
      </Button>
    </form>
  );
}
