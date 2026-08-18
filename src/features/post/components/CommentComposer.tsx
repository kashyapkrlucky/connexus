"use client";

import { useState } from "react";
import { Textarea } from "@/shared/components/ui/Textarea";
import { Button } from "@/shared/components/ui/Button";

interface CommentComposerProps {
  onSubmit: (content: string) => Promise<boolean>;
  onCancel?: () => void;
  placeholder?: string;
  submitting?: boolean;
  autoFocus?: boolean;
}

export function CommentComposer({
  onSubmit,
  onCancel,
  placeholder = "What are your thoughts?",
  submitting,
  autoFocus,
}: CommentComposerProps) {
  const [content, setContent] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    const ok = await onSubmit(content.trim());
    if (ok) setContent("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={2000}
        autoFocus={autoFocus}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" disabled={!content.trim()} loading={submitting}>
          Comment
        </Button>
      </div>
    </form>
  );
}
