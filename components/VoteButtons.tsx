"use client";

import { voteComment, votePost } from "@/app/action";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { startTransition, useOptimistic } from "react";

type VoteButtonsProps = {
  entityId: number;
  entityType: "post" | "comment";
  initialScore: number;
  isAuthenticated: boolean;
  label?: string;
};

function formatScore(n: number): string {
  const a = Math.abs(n);
  if (a >= 1000) {
    return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(n);
}

export default function VoteButtons({
  entityId,
  entityType,
  initialScore,
  isAuthenticated,
  label = "votes",
}: VoteButtonsProps) {
  const router = useRouter();
  const [optimisticScore, applyVote] = useOptimistic(
    initialScore,
    (current, value: number) => current + value,
  );

  const handleVote = (value: number) => {
    if (!isAuthenticated) {
      const callbackPath = `${window.location.pathname}${window.location.search}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
      return;
    }

    startTransition(async () => {
      applyVote(value);

      try {
        if (entityType === "post") {
          await votePost(entityId, value);
        } else {
          await voteComment(entityId, value);
        }
      } catch {
        applyVote(-value);
      }
    });
  };

  return (
    <div className="inline-flex min-h-11 touch-manipulation items-center gap-0.5 rounded-full border border-white/10 bg-[#1a282d] px-0.5 py-0.5 text-xs font-bold sm:min-h-10 sm:text-sm">
      <button
        type="button"
        className="flex min-h-10 min-w-10 touch-manipulation items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-[#ff4500] active:bg-white/15"
        onClick={() => handleVote(1)}
        aria-label="Upvote"
      >
        <CaretUp className="size-5" weight="bold" />
      </button>
      <span className="min-w-[2.25rem] px-1 text-center text-foreground tabular-nums">
        {formatScore(optimisticScore)}
      </span>
      <button
        type="button"
        className="flex min-h-10 min-w-10 touch-manipulation items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-[#7193ff] active:bg-white/15"
        onClick={() => handleVote(-1)}
        aria-label="Downvote"
      >
        <CaretDown className="size-5" weight="bold" />
      </button>
      <span className="hidden pr-2 text-[10px] font-semibold text-muted-foreground sm:inline">
        {label}
      </span>
    </div>
  );
}
