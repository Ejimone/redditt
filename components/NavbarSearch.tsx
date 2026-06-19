"use client";

import { useSearch } from "@/lib/search-context";
import { usePathname, useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent } from "react";

export default function NavbarSearch() {
  const { query, setQuery } = useSearch();
  const router = useRouter();
  const pathname = usePathname();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    // The first character typed from anywhere else jumps to /posts, where
    // the live results live. Every keystroke after that only updates the
    // shared query -- no navigation, so the input never reloads or loses
    // focus while typing.
    if (pathname !== "/posts" && query.trim() === "" && next.trim() !== "") {
      router.push("/posts");
    }
    setQuery(next);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    const next = trimmed
      ? `/posts?${new URLSearchParams({ q: trimmed }).toString()}`
      : "/posts";
    router.push(next);
  };

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
          value={query}
          onChange={onChange}
          placeholder="Find anything"
          aria-label="Search posts"
          enterKeyHint="search"
          autoComplete="off"
          className="h-10 w-full min-w-0 rounded-full border border-border bg-muted py-2 pl-3 pr-[4.25rem] text-sm text-foreground placeholder:text-muted-foreground outline-none ring-0 transition-colors focus:border-border/20"
        />
        <button
          type="submit"
          className="absolute right-1 top-1/2 flex h-8 min-w-[2.75rem] -translate-y-1/2 touch-manipulation items-center justify-center rounded-full px-2 text-[10px] font-bold text-muted-foreground hover:bg-white/10 hover:text-foreground"
        >
          Ask
        </button>
      </div>
    </form>
  );
}
