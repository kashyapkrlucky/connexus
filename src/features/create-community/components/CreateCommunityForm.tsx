"use client"
import { uploadImage } from "@/shared/utils/uploadImage";
import { AvatarUploader } from "@/shared/components/ui/AvatarUploader";
import { Button } from "@/shared/components/ui/Button";
import { ImageUpload } from "@/shared/components/ui/ImageUpload";
import { Input } from "@/shared/components/ui/Input";
import { Textarea } from "@/shared/components/ui/Textarea";
import { cn } from "@/shared/utils/cn";
import { GlobeIcon, LockIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreateCommunityStore } from "../store/useCreateCommunityStore";

export default function CreateCommunityForm() {
    const router = useRouter();
    const {
        name,
        description,
        visibility,
        iconUrl,
        bannerUrl,
        submitting,
        error,
        setName,
        setDescription,
        setVisibility,
        setIconUrl,
        setBannerUrl,
        submitCommunity,
    } = useCreateCommunityStore();

    const canSubmit = name.trim().length >= 3 && description.trim().length > 0;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canSubmit || submitting) return;
        const result = await submitCommunity();
        if (result) {
            router.push(`/c/${result.slug}`);
            router.refresh();
        }
    }

    return <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-200">Banner</label>
            <ImageUpload
                value={bannerUrl}
                onChange={setBannerUrl}
                onUpload={(file) => uploadImage(file, "community")}
                label="Add a banner"
                previewClassName="h-28"
            />
        </div>

        <div>
            <label className="mb-1 block text-sm font-medium text-gray-200">Icon</label>
            <AvatarUploader
                name={name || "New community"}
                value={iconUrl}
                onChange={setIconUrl}
                onUpload={(file) => uploadImage(file, "community")}
                label="Upload icon"
            />
            <p className="mt-1 text-xs text-gray-500">Optional — we&apos;ll generate one if you skip this.</p>
        </div>

        <div>
            <label className="mb-1 block text-sm font-medium text-gray-200">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Frontend Founders" maxLength={50} />
        </div>

        <div>
            <label className="mb-1 block text-sm font-medium text-gray-200">Description</label>
            <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this community about?"
                rows={4}
                maxLength={500}
            />
        </div>

        <div>
            <label className="mb-1 block text-sm font-medium text-gray-200">Visibility</label>
            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => setVisibility("PUBLIC")}
                    className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-left text-sm transition-all",
                        visibility === "PUBLIC"
                            ? "border-brand-500 bg-brand-500/10 ring-4 ring-brand-500/10"
                            : "border-gray-800 hover:bg-gray-800"
                    )}
                >
                    <GlobeIcon className="size-4 text-gray-300" />
                    <div>
                        <p className="font-medium text-gray-100">Public</p>
                        <p className="text-xs text-gray-400">Anyone can view and join</p>
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => setVisibility("PRIVATE")}
                    className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-left text-sm transition-all",
                        visibility === "PRIVATE"
                            ? "border-brand-500 bg-brand-500/10 ring-4 ring-brand-500/10"
                            : "border-gray-800 hover:bg-gray-800"
                    )}
                >
                    <LockIcon className="size-4 text-gray-300" />
                    <div>
                        <p className="font-medium text-gray-100">Private</p>
                        <p className="text-xs text-gray-400">Invite only</p>
                    </div>
                </button>
            </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" disabled={!canSubmit} loading={submitting} className="self-start">
            Create community
        </Button>
    </form>
}
