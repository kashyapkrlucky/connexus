"use client"
import useAuthStore from "../store/useAuthStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function LoginActions() {

    const { onGuestLogin, isGuestLoading } = useAuthStore();
    const [isAtlasRedirecting, setIsAtlasRedirecting] = useState(false);
    const router = useRouter();
    const handleGuestLogin = async () => {
        const token = await onGuestLogin();
        if (token) {
            router.push("/dashboard");
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
        <div>
            <button
                type="button"
                onClick={onAtlasLogin}
                className="rounded bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
            >
                Login with Atlas ID
            </button>
            <button
                type="button"
                onClick={handleGuestLogin}
                className="rounded border border-accent/40 px-3 py-2 text-sm text-accent"
            >
                Continue as guest
            </button>
        </div>
    );
}