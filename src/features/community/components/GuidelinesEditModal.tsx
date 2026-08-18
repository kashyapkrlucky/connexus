"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Modal } from "@/shared/components/ui/Modal";
import { Input } from "@/shared/components/ui/Input";
import { Textarea } from "@/shared/components/ui/Textarea";
import { Button } from "@/shared/components/ui/Button";
import type { CommunityDetailDTO } from "@/server/types/community.types";
import { useCommunityStore } from "../store/useCommunityStore";

interface GuidelinesEditModalProps {
  onClose: () => void;
  community: CommunityDetailDTO;
}

interface DraftGuideline {
  title: string;
  body: string;
}

const MAX_GUIDELINES = 20;

// Mounted only while the edit modal is open (see CommunityGuidelines), so the useState
// initializer below always starts from the current guidelines — no reset effect needed.
export function GuidelinesEditModal({ onClose, community }: GuidelinesEditModalProps) {
  const { guidelinesSaving, saveGuidelines } = useCommunityStore();
  const [items, setItems] = useState<DraftGuideline[]>(
    community.guidelines.map((g) => ({ title: g.title, body: g.body }))
  );

  function updateItem(index: number, patch: Partial<DraftGuideline>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function moveItem(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addItem() {
    if (items.length >= MAX_GUIDELINES) return;
    setItems((prev) => [...prev, { title: "", body: "" }]);
  }

  const canSubmit = items.every((item) => item.title.trim().length > 0 && item.body.trim().length > 0);

  async function handleSubmit() {
    if (!canSubmit || guidelinesSaving) return;
    const ok = await saveGuidelines(items.map((item) => ({ title: item.title.trim(), body: item.body.trim() })));
    if (ok) onClose();
  }

  return (
    <Modal open onClose={onClose} title="Edit guidelines" className="max-w-xl">
      <div className="flex flex-col gap-4">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No guidelines yet — add your first one below.</p>
        ) : (
          <div className="flex max-h-96 flex-col gap-3 overflow-y-auto pr-1">
            {items.map((item, index) => (
              <div key={index} className="rounded-xl border border-gray-800 bg-gray-950 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-500">Rule {index + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveItem(index, -1)}
                      disabled={index === 0}
                      aria-label="Move up"
                      className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-200 disabled:opacity-30"
                    >
                      <ChevronUpIcon className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, 1)}
                      disabled={index === items.length - 1}
                      aria-label="Move down"
                      className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-200 disabled:opacity-30"
                    >
                      <ChevronDownIcon className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      aria-label="Remove"
                      className="rounded p-1 text-gray-500 hover:bg-red-500/15 hover:text-red-400"
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  </div>
                </div>
                <Input
                  value={item.title}
                  onChange={(e) => updateItem(index, { title: e.target.value })}
                  placeholder="Title"
                  maxLength={100}
                  className="mb-2"
                />
                <Textarea
                  value={item.body}
                  onChange={(e) => updateItem(index, { body: e.target.value })}
                  placeholder="Explain this rule..."
                  rows={2}
                  maxLength={1000}
                />
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          disabled={items.length >= MAX_GUIDELINES}
          className="self-start"
        >
          <PlusIcon className="size-4" /> Add rule
        </Button>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={!canSubmit} loading={guidelinesSaving} onClick={handleSubmit}>
            Save guidelines
          </Button>
        </div>
      </div>
    </Modal>
  );
}
