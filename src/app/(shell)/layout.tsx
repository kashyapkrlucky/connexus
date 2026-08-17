"use client"
import { TopBar } from "@/shared/components/layout/TopBar";
import { SideBar } from "@/shared/components/layout/SideBar";
import { Compass } from "lucide-react";
import { Avatar } from "@/shared/components/ui/Avatar";
import Link from "next/link";
import { useHomeStore } from "@/features/home/store/useHomeStore";
import { useEffect } from "react";

export default function ShellLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { memberships, getMemberships } = useHomeStore();

    useEffect(() => {
        getMemberships();
    }, [getMemberships]);

    return (
        <div className="flex flex-1 flex-col">
            <TopBar />
            <div className="mx-auto flex w-full max-w-7xl flex-1">
                <SideBar className="p-4">

                    <div className="rounded-2xl border border-gray-700 bg-gray-900 p-3">
                        <h2 className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            <Compass className="size-3.5" /> Your communities
                        </h2>
                        {memberships.length === 0 ? (
                            <p className="px-1 text-sm text-gray-500">You haven&apos;t joined any yet.</p>
                        ) : (
                            <ul className="space-y-0.5">
                                {memberships.map((m) => (
                                    <li key={m.id}>
                                        <Link
                                            href={`/c/${m.community.slug}`}
                                            className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                                        >
                                            <Avatar name={m.community.name} src={m.community.iconUrl} size={22} />
                                            <span className="truncate">c/{m.community.slug}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </SideBar>

                <main className="min-w-0 flex-1 p-4">
                    {children}
                </main>
            </div>
        </div>
    );
}