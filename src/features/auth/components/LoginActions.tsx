"use client"
import useAuthStore from "../store/useAuthStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { KeyRoundIcon, UserRoundIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

export function LoginActions() {

    const { onGuestLogin, isGuestLoading } = useAuthStore();
    const [isAtlasRedirecting, setIsAtlasRedirecting] = useState(false);
    const router = useRouter();
    const busy = isGuestLoading || isAtlasRedirecting;

    const handleGuestLogin = async () => {
        const token = await onGuestLogin();
        if (token) {
            router.push("/");
        } else {
            toast.error(
                useAuthStore.getState().error ||
                "Failed to login as guest. Please try again.",
            );
        }
    };
    const onAtlasLogin = () => {
        setIsAtlasRedirecting(true);
        window.location.href = `${process.env.NEXT_PUBLIC_AUTH_URL}/login?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}`;
    };

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-400">
                Join communities built for real connections — sign in to post, comment, and vote.
            </p>

            <div className="flex flex-col gap-2.5">
                <Button
                    type="button"
                    onClick={onAtlasLogin}
                    disabled={busy}
                    loading={isAtlasRedirecting}
                    variant="primary"
                    size="md"
                    className="w-full justify-center"
                >
                    <KeyRoundIcon className="size-4" /> Login with Atlas ID
                </Button>

                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-800" />
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-600">or</span>
                    <div className="h-px flex-1 bg-gray-800" />
                </div>

                <Button
                    type="button"
                    onClick={handleGuestLogin}
                    disabled={busy}
                    loading={isGuestLoading}
                    variant="outline"
                    size="md"
                    className="w-full justify-center"
                >
                    <UserRoundIcon className="size-4" /> Continue as guest
                </Button>
                <p className="text-center text-xs text-gray-600">
                    Guest access lets you look around — sign in with Atlas ID for the full experience.
                </p>
            </div>
        </div>
    );
}
