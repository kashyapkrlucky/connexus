"use client"
import { TopBar } from "@/shared/components/layout/TopBar";
import { SideBar } from "@/shared/components/layout/SideBar";

export default function ShellLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-1 flex-col">
            <TopBar />
            <div className="mx-auto flex w-full max-w-7xl flex-1">
                <SideBar />

                <main className="min-w-0 flex-1 p-4">
                    {children}
                </main>
            </div>
        </div>
    );
}