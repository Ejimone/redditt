import {
  EXPLORE_FILTER_IDS,
  EXPLORE_PILL_LABELS,
  type ExploreFilterId,
} from "@/lib/explore-filters";
import Link from "next/link";

export default function ExploreCategoryPills({
  active,
}: {
  active: ExploreFilterId;
}) {
  return (
    <div
      className="-mx-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="list"
    >
      {EXPLORE_FILTER_IDS.map((id) => {
        const href = id === "all" ? "/explore" : `/explore?category=${id}`;
        const isOn = active === id;
        return (
          <Link
            key={id}
            href={href}
            role="listitem"
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold transition-colors ${
              isOn
                ? "bg-white/15 text-foreground"
                : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
            }`}
          >
            {EXPLORE_PILL_LABELS[id]}
          </Link>
        );
      })}
    </div>
  );
}
