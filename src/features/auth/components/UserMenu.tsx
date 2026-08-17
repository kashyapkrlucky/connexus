"use client"
import { PenSquareIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import useAuthStore from "../store/useAuthStore";

import { toast } from "sonner";
import { ACCESS_TOKEN_KEY, USER_KEY } from "../constants";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
export function UserMenu() {
    const { user, logout } = useAuthStore();

    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        toast.success("Signed out.");
        router.push("/");
    };

    useEffect(() => {
        if (!menuOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);


    return <div className="relative ml-auto flex items-center gap-2" ref={menuRef}>
        <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded px-2.5 py-1 hover:bg-background"
        >
            {user?.avatar ? (
                <Image
                    src={user.avatar}
                    alt={user.name}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover"
                />
            ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                    {user?.name.charAt(0)}
                </div>
            )}
            <span className="text-sm text-foreground">{user?.name}</span>
        </button>

        {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-40 overflow-hidden rounded-lg border border-border/40 bg-surface shadow-lg shadow-accent/10">
                <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-background"
                >
                    Profile
                </button>
                <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-background"
                >
                    Settings
                </button>
                <div className="border-t border-border/40" />
                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-background"
                >
                    Logout
                </button>
            </div>
        )}
    </div>;
}