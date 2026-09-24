"use client"
import Image from "next/image";
import { Login } from "@/features/auth/components/Login";
import { PenSquareIcon } from "lucide-react";
import Link from "next/link";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { UserMenu } from "@/features/auth/components/UserMenu";
import { MobileNav } from "./MobileNav";

export function TopBar() {

  const { user, isLoading } = useCurrentUser();
  return (
    <header className="flex h-14 w-full shrink-0 items-center border-b border-border/40 bg-surface sticky top-0 z-50">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-4">
        <MobileNav />
        <Link href="/" className="shrink-0">
          <Image
            className="h-9 w-26 sm:h-11 sm:w-32"
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
          className="hidden w-full max-w-sm rounded border md:block border-border/40 bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none"
        />

        <div className="ml-auto flex items-center gap-2">
          {isLoading ? null : user ? <>
            <Link
              href="/create"
              className="hidden items-center gap-1.5 rounded-lg bg-brand-500 px-2.5 py-1 text-sm font-medium text-white shadow-sm shadow-brand-500/20 transition-all hover:bg-brand-600 hover:shadow-brand-600/30 active:scale-[0.97] sm:inline-flex"
            >
              <PenSquareIcon className="size-4" /> Create
            </Link>
            <UserMenu />
          </> : <Login />}
        </div>
      </div>
    </header>
  );
}
