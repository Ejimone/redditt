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
                ? "bg-secondary text-foreground ring-1 ring-border"
                : "text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
