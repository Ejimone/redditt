"use client";

import {
  Cards,
  Compass,
  Fire,
  House,
  Newspaper,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const linkClass =
  "flex min-h-11 touch-manipulation items-center gap-3 rounded-full px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10 active:bg-white/15";

type NavItem = {
  href: string;
  label: string;
  icon: typeof House;
  match?: "exact" | "prefix";
};

const mainNav: NavItem[] = [
  { href: "/", label: "Home", icon: House, match: "exact" },
  { href: "/trending", label: "Popular", icon: Fire, match: "prefix" },
  { href: "/news", label: "News", icon: Newspaper, match: "prefix" },
  { href: "/explore", label: "Explore", icon: Compass, match: "prefix" },
  { href: "/posts", label: "All posts", icon: Cards, match: "prefix" },
];

function navActive(pathname: string, item: NavItem): boolean {
  if (item.match === "exact") {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function LeftSidebar() {
  const pathname = usePathname() || "/";

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[min(240px,28vw)] min-w-[200px] max-w-[260px] shrink-0 flex-col border-r border-white/10 py-4 pl-2 pr-2 sm:pr-3 md:flex">
      <nav aria-label="Main" className="flex flex-col gap-0.5">
        {mainNav.map((item) => {
          const { href, label, icon: Icon } = item;
          const on = navActive(pathname, item);
          return (
            <Link
              key={href}
              href={href}
              className={`${linkClass} ${
                on
                  ? "bg-white/10 text-foreground"
                  : "text-foreground/90"
              }`}
            >
              <Icon className="size-6 shrink-0 text-foreground" weight="regular" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-white/10 pt-4">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Resources
        </p>
        <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
          <li>
            <Link
              href="/help#about"
              className="block min-h-10 touch-manipulation rounded-full px-3 py-2 hover:bg-white/10 hover:text-foreground"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/help#faq"
              className="block min-h-10 touch-manipulation rounded-full px-3 py-2 hover:bg-white/10 hover:text-foreground"
            >
              Help
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}
