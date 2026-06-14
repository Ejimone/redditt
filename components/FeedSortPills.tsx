import { cn } from "@/lib/utils";
import type { FeedSortMode } from "@/lib/posts-feed";
import Link from "next/link";

const pills: { key: FeedSortMode; label: string }[] = [
  { key: "best", label: "Best" },
  { key: "new", label: "New" },
  { key: "top", label: "Top" },
];

export default function FeedSortPills({
  active,
  basePath = "/",
}: {
  active: FeedSortMode;
  basePath?: string;
}) {
  const normalized =
    basePath === "/"
      ? ""
      : basePath.endsWith("/")
        ? basePath.slice(0, -1)
        : basePath;
  return (
    <div
      className="mb-4 flex flex-wrap gap-2"
      role="tablist"
      aria-label="Sort posts"
    >
      {pills.map(({ key, label }) => {
        const isActive = active === key;
        return (
          <Link
            key={key}
            href={`${normalized}?sort=${key}`}
            scroll={false}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "inline-flex min-h-11 touch-manipulation items-center justify-center rounded-full px-4 py-2 text-xs font-bold transition-colors sm:min-h-10 sm:text-sm",
              isActive
                ? "bg-[#1a282d] text-foreground ring-1 ring-white/15"
                : "text-muted-foreground hover:bg-white/10 hover:text-foreground active:bg-white/15",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
