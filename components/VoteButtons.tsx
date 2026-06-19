"use client";

import { voteComment, votePost } from "@/app/action";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

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
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(0);

  const handleVote = (value: number) => {
    if (!isAuthenticated) {
      const callbackPath = `${window.location.pathname}${window.location.search}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
      return;
    }

    const previousScore = score;
    const previousUserVote = userVote;
    const nextUserVote = previousUserVote === value ? 0 : value;

    setScore((current) => current + (nextUserVote - previousUserVote));
    setUserVote(nextUserVote);

    startTransition(async () => {
      try {
        const result =
          entityType === "post"
            ? await votePost(entityId, value)
            : await voteComment(entityId, value);

        if (typeof result?.data?.score === "number") {
          setScore(result.data.score);
        }
        if (typeof result?.data?.userVote === "number") {
          setUserVote(result.data.userVote);
        }
      } catch {
        setScore(previousScore);
        setUserVote(previousUserVote);
      }
    });
  };

  return (
    <div className="inline-flex min-h-11 touch-manipulation items-center gap-0.5 rounded-full border border-border bg-muted/30 px-0.5 py-0.5 text-xs font-bold sm:min-h-10 sm:text-sm">
      <button
        type="button"
        className={`flex min-h-10 min-w-10 touch-manipulation items-center justify-center rounded-full active:bg-orange-500/20 ${
          userVote === 1
            ? "bg-orange-500/15 text-orange-500"
            : "text-muted-foreground hover:bg-orange-500/10 hover:text-orange-500"
        }`}
        onClick={() => handleVote(1)}
        aria-label="Upvote"
        aria-pressed={userVote === 1}
      >
        <CaretUp className="size-5" weight="bold" />
      </button>
      <span className="min-w-[2.25rem] px-1 text-center text-foreground tabular-nums">
        {formatScore(score)}
      </span>
      <button
        type="button"
        className={`flex min-h-10 min-w-10 touch-manipulation items-center justify-center rounded-full active:bg-blue-500/20 ${
          userVote === -1
            ? "bg-blue-500/15 text-blue-500"
            : "text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500"
        }`}
        onClick={() => handleVote(-1)}
        aria-label="Downvote"
        aria-pressed={userVote === -1}
      >
        <CaretDown className="size-5" weight="bold" />
      </button>
      <span className="hidden pr-2 text-[10px] font-semibold text-muted-foreground sm:inline">
        {label}
      </span>
    </div>
  );
}
