"use client"
import Image from "next/image";
import { Login } from "@/features/auth/components/Login";
import { PenSquareIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import useAuthStore from "@/features/auth/store/useAuthStore";
import { UserMenu } from "@/features/auth/components/UserMenu";

export function TopBar() {

  const { user } = useAuthStore();
  return (
    <header className="flex h-14 w-full shrink-0 items-center border-b border-border/40 bg-surface">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4">
        <Link href="/">
          <Image
            className="h-11 w-32"
            src="/logo.png"
            alt="Connexus logo"
            width={120}
            height={38}
            priority
          />
        </Link>

        <input
          type="search"
          placeholder="Search"
          className="w-full max-w-sm rounded border border-border/40 bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none"
        />

        <div className="ml-auto flex items-center gap-2">
          {user ? <>
            <Link
              href="/create"
              className="hidden items-center gap-1.5 rounded-lg bg-cyan-400 px-2.5 py-1 text-sm font-medium text-white shadow-sm shadow-cyan-500/20 transition-all hover:bg-cyan-600 hover:shadow-cyan-500/30 active:scale-[0.97] sm:inline-flex"
            >
              <PenSquareIcon className="size-4" /> Create
            </Link>

            <Link
              href="/create-community"
              className="hidden items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900 px-2.5 py-1 text-sm font-medium text-neutral-300 transition-colors hover:border-cyan-300 hover:bg-cyan-900 sm:inline-flex"
            >
              <PlusIcon className="size-4" /> Create community
            </Link>
            <UserMenu />
          </> : <Login />}
        </div>
      </div>
    </header>
  );
}
