import { formatWeeklyVisitors } from "@/lib/format-weekly-visitors";
import Link from "next/link";

type ExploreCommunityCardProps = {
  slug: string;
  name?: string;
  description?: string | null;
  weeklyVisitors?: number | null;
};

export default function ExploreCommunityCard({
  slug,
  name,
  description,
  weeklyVisitors,
}: ExploreCommunityCardProps) {
  const letter = slug.slice(0, 1).toUpperCase();
  const label = name?.trim() || slug;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1a282d] p-3 ring-1 ring-white/5 sm:p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-600 text-sm font-bold text-white">
          {letter}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/r/${slug}`}
                className="block truncate font-bold text-foreground hover:text-[#ff4500]"
              >
                r/{slug}
              </Link>
              <p className="text-xs text-muted-foreground">
                {formatWeeklyVisitors(weeklyVisitors ?? undefined)} weekly visitors
              </p>
            </div>
            <Link
              href={`/r/${slug}`}
              className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-white/15"
            >
              Join
            </Link>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {description?.trim()
              ? description
              : `Welcome to r/${label}.`}
          </p>
        </div>
      </div>
    </div>
  );
}
