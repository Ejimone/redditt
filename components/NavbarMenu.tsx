"use client";

import { logoutAction } from "@/app/auth-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useEffect, useRef } from "react";

function summaryPill() {
  return "flex min-h-10 cursor-pointer list-none items-center rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-foreground touch-manipulation outline-none hover:bg-white/10 [&::-webkit-details-marker]:hidden";
}

type NavbarMenuProps = {
  isAuthenticated: boolean;
  userImage?: string | null;
  userName?: string | null;
};

export default function NavbarMenu({
  isAuthenticated,
  userImage,
  userName,
}: NavbarMenuProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      const details = detailsRef.current;
      if (details?.open && !details.contains(e.target as Node)) {
        details.open = false;
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  return (
    <details ref={detailsRef} className="group relative block">
      <summary
        className={`${summaryPill()} flex size-10 items-center justify-center px-0 sm:w-auto sm:px-3`}
        aria-label="More menu"
      >
        {isAuthenticated ? (
          <Avatar size="sm">
            <AvatarImage src={userImage ?? undefined} alt={userName ?? "Account"} />
            <AvatarFallback>{userName?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
          </Avatar>
        ) : (
          <span className="text-lg leading-none">⋯</span>
        )}
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-white/10 bg-[#ffff] py-1 text-sm shadow-lg ring-1 ring-white/5 border-gray-500">
        {isAuthenticated ? (
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
  );
}
