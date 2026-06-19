import { auth } from "@/app/auth";
import NavbarSearch from "@/components/NavbarSearch";
import NavbarMenu from "@/components/NavbarMenu";
import Link from "next/link";
import { Suspense } from "react";
import MobileNav from "@/components/layout/MobileBottomNav";

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-2 sm:gap-3 sm:px-4 md:px-6">
        <div className="flex shrink-0 items-center gap-1">
          <MobileNav />
          <Link
            href="/"
            className="flex min-h-10 min-w-10 touch-manipulation items-center text-lg font-extrabold tracking-tight text-foreground"
          >
            <span className="text-[#ff4500]">reddit</span>
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="mx-1 h-10 min-w-0 flex-1 animate-pulse rounded-full bg-white/10 sm:mx-2 md:mx-4" />
          }
        >
          <NavbarSearch />
        </Suspense>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {!session?.user && (
            <Link
              href="/login"
              className="inline-flex h-10 min-h-10 touch-manipulation items-center rounded-full bg-[#ff4500] px-4 text-xs font-bold text-white hover:bg-[#ff5414] sm:px-5"
            >
              Log in
            </Link>
          )}

          <NavbarMenu
            isAuthenticated={Boolean(session?.user)}
            userImage={session?.user?.image}
            userName={session?.user?.name}
          />
        </div>
      </div>
    </header>
  );
}
