import { logoutAction } from "@/app/auth-actions";
import { auth } from "@/app/auth";
import NavbarSearch from "@/components/NavbarSearch";
import Link from "next/link";
import { Suspense } from "react";
import MobileNav from "@/components/layout/MobileBottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function summaryPill() {
  return "flex min-h-10 cursor-pointer list-none items-center rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-foreground touch-manipulation outline-none hover:bg-white/10 [&::-webkit-details-marker]:hidden";
}

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

          <details className="group relative block">
            <summary
              className={`${summaryPill()} flex size-10 items-center justify-center px-0 sm:w-auto sm:px-3`}
              aria-label="More menu"
            >
              {session?.user ? (
                <Avatar size="sm">
                  <AvatarImage
                    src={session.user.image ?? undefined}
                    alt={session.user.name ?? "Account"}
                  />
                  <AvatarFallback>
                    {session.user.name?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <span className="text-lg leading-none">⋯</span>
              )}
            </summary>
            <div className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-white/10 bg-[#ffff] py-1 text-sm shadow-lg ring-1 ring-white/5 border-gray-500">
              {session?.user ? (
                <>
                  <Link
                    href="/settings"
                    className="block min-h-11 touch-manipulation px-4 py-3 text-foreground hover:bg-white/10"
                  >
                    Settings
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="block w-full min-h-11 touch-manipulation px-4 py-3 text-left text-foreground hover:bg-white/10"
                    >
                      Log out
                    </button>
                  </form>
                  <div className="my-1 border-t border-white/10" />
                </>
              ) : null}
              <Link
                href="/help"
                className="block min-h-11 touch-manipulation px-4 py-3 text-foreground hover:bg-white/10"
              >
                Help
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
