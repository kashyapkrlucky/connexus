
"use client";
import { useHomeStore } from "@/features/home/store/useHomeStore";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Textarea } from "@/shared/components/ui/Textarea";
import { useEffect, useState } from "react";

export default function CreatePostForm() {
  const { memberships, getMemberships } = useHomeStore();

  const [communityId, setCommunityId] = useState(memberships[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = Boolean(communityId) && title.trim().length > 0 && (content.trim().length > 0 || imageUrl);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Implement post creation logic
  }

  useEffect(() => {
    getMemberships();
  }, [getMemberships]);


  return <form onSubmit={handleSubmit} className="flex flex-col gap-4">


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
            <option key={c.community.id} value={c.community.id}>
              c/{c.community.slug}
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
    <Button type="submit" variant="primary" size="md" disabled={!canSubmit} loading={submitting} className="self-start">
      Submit
    </Button>
  </form>;
}