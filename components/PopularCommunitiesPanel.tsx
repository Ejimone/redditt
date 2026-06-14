import Link from "next/link";

export type PopularCommunityItem = {
  id?: number;
  name?: string;
  slug?: string;
  description?: string;
};

function CommunityIcon({ slug }: { slug: string }) {
  const letter = (slug || "?").slice(0, 1).toUpperCase();
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-xs font-bold text-white">
      {letter}
    </span>
  );
}

type PopularCommunitiesPanelProps = {
  communities: PopularCommunityItem[];
  /** Top strip with uppercase label (sidebar widget style). */
  showPanelTitle?: boolean;
  panelTitle?: string;
  /** When set, footer link is shown (e.g. only if Strapi reports more pages). */
  seeMoreHref?: string;
  seeMoreLabel?: string;
  /** Staggered fade-up (matches loading “reveal” feel). */
  animateRows?: boolean;
};

export default function PopularCommunitiesPanel({
  communities,
  showPanelTitle = false,
  panelTitle = "Popular communities",
  seeMoreHref,
  seeMoreLabel = "See more",
  animateRows = true,
}: PopularCommunitiesPanelProps) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-card ring-1 ring-white/5">
      {showPanelTitle ? (
        <div className="border-b border-white/10 px-4 py-3">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {panelTitle}
          </h2>
        </div>
      ) : null}
      <ul className="divide-y divide-white/5">
        {communities.map((c, i) => {
          const slug = c.slug ?? `community-${i}`;
          return (
            <li
              key={c.id ?? i}
              className={animateRows ? "popular-communities-row" : undefined}
              style={
                animateRows ? { animationDelay: `${i * 70}ms` } : undefined
              }
            >
              <Link
                href={`/r/${slug}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5"
              >
                <CommunityIcon slug={slug} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    r/{slug}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.description?.slice(0, 72) ||
                      "Community on this clone"}
                    {c.description && c.description.length > 72 ? "…" : ""}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {seeMoreHref ? (
        <div className="border-t border-white/10 px-4 py-2">
          <Link
            href={seeMoreHref}
            className="text-xs font-semibold text-reddit-blue hover:underline"
          >
            {seeMoreLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function PopularCommunitiesPanelSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-card ring-1 ring-white/5">
      <div className="border-b border-white/10 px-4 py-3">
        <div className="h-3 w-36 animate-pulse rounded bg-white/10" />
      </div>
      <ul className="divide-y divide-white/5">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="size-8 shrink-0 animate-pulse rounded-full bg-white/10" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
              <div className="h-2.5 w-full max-w-[240px] animate-pulse rounded bg-white/10" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
