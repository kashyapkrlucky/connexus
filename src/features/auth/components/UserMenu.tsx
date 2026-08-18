"use client";

import { LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useAuthStore from "../store/useAuthStore";
import { ACCESS_TOKEN_KEY, USER_KEY } from "../constants";
import { Avatar } from "@/shared/components/ui/Avatar";

const MENU_ITEMS = [
    { label: "Profile", icon: UserIcon },
    { label: "Settings", icon: SettingsIcon, href: "/settings" },
] as const;

export function UserMenu() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        setMenuOpen(false);
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

    if (!user) return null;

    return (
        <div className="relative ml-auto flex items-center gap-2" ref={menuRef}>
            <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-gray-800"
            >
                <Avatar name={user.name} src={user.avatar} size={28} />
                <span className="hidden text-sm font-medium text-gray-200 sm:inline">{user.name}</span>
            </button>

            {menuOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-lg shadow-black/40">
                    <div className="flex items-center gap-2.5 border-b border-gray-800 px-3 py-3">
                        <Avatar name={user.name} src={user.avatar} size={36} />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-100">{user.name}</p>
                            <p className="truncate text-xs text-gray-500">u/{user.username}</p>
                        </div>
                    </div>

                    <div className="p-1.5">
                        {MENU_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const href = "href" in item ? item.href : `/u/${user.username}`;
                            return (
                                <Link
                                    key={item.label}
                                    href={href}
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-gray-100"
                                >
                                    <Icon className="size-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="border-t border-gray-800 p-1.5">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
                        >
                            <LogOutIcon className="size-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
