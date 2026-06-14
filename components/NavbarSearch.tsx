"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useCallback, useState, useTransition } from "react";

function NavbarSearchForm({ defaultQuery }: { defaultQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultQuery);
  const [isPending, startTransition] = useTransition();

  const goToSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      const next = trimmed
        ? `/posts?${new URLSearchParams({ q: trimmed }).toString()}`
        : "/posts";
      startTransition(() => {
        router.push(next);
      });
    },
    [router],
  );

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      goToSearch(value);
    },
    [goToSearch, value],
  );

  return (
    <form
      onSubmit={onSubmit}
      className="mx-1 flex min-w-0 flex-1 sm:mx-2 md:mx-4"
      role="search"
    >
      <div className="relative w-full">
        <input
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Find anything"
          aria-label="Search posts"
          enterKeyHint="search"
          autoComplete="off"
          className="h-10 w-full min-w-0 rounded-full border border-white/10 bg-[#1a282d] py-2 pl-3 pr-[4.25rem] text-sm text-foreground placeholder:text-muted-foreground outline-none ring-0 transition-colors focus:border-white/20 disabled:opacity-60"
          disabled={isPending}
        />
        <button
          type="submit"
          className="absolute right-1 top-1/2 flex h-8 min-w-[2.75rem] -translate-y-1/2 touch-manipulation items-center justify-center rounded-full px-2 text-[10px] font-bold text-muted-foreground hover:bg-white/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          disabled={isPending}
        >
          Ask
        </button>
      </div>
    </form>
  );
}

export default function NavbarSearch() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q =
    pathname === "/posts" ? (searchParams.get("q") ?? "") : "";
  const remountKey =
    pathname === "/posts" ? `posts:${q}` : `other:${pathname}`;

  return <NavbarSearchForm key={remountKey} defaultQuery={q} />;
}
