"use client";

import {
  joinCommunityAction,
  leaveCommunityAction,
  type FormActionState,
} from "@/app/action";
import { Button } from "@/components/ui/button";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type CommunityMembershipButtonProps = {
  slug: string;
  isMember: boolean;
  memberCount?: number;
  compact?: boolean;
};

function SubmitButton({ isMember }: { isMember: boolean }) {
  const { pending } = useFormStatus();
  const idleLabel = isMember ? "Joined" : "Join";
  const pendingLabel = isMember ? "Leaving..." : "Joining...";

  return (
    <Button
      type="submit"
      disabled={pending}
      variant={isMember ? "outline" : "default"}
      className="min-h-10 rounded-full px-4 text-xs font-bold"
    >
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}

export default function CommunityMembershipButton({
  slug,
  isMember,
  memberCount,
  compact = false,
}: CommunityMembershipButtonProps) {
  const action = isMember ? leaveCommunityAction : joinCommunityAction;
  const [state, formAction] = useActionState<FormActionState | null, FormData>(
    action,
    null,
  );

  return (
    <div className={compact ? "flex items-center gap-2" : "mb-6 flex flex-wrap items-center gap-3"}>
      <form action={formAction}>
        <input type="hidden" name="slug" value={slug} />
        <SubmitButton isMember={isMember} />
      </form>
      {memberCount !== undefined ? (
        <span className="text-xs text-muted-foreground">
          {memberCount.toLocaleString()} members
        </span>
      ) : null}
      {state?.error ? (
        <p className="text-xs text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
