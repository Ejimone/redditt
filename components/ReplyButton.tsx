"use client";

import CreateCommentForm from "@/components/CreateCommentForm";
import { useState } from "react";

type ReplyButtonProps = {
  postId: number;
  postSlug: string;
  subredditSlug: string;
  parentId: number;
};

export default function ReplyButton({
  postId,
  postSlug,
  subredditSlug,
  parentId,
}: ReplyButtonProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-bold text-[#0079d3] hover:underline"
      >
        Reply
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <CreateCommentForm
        postId={postId}
        postSlug={postSlug}
        subredditSlug={subredditSlug}
        parentId={parentId}
        placeholder="Reply to this comment"
        onSuccess={() => setOpen(false)}
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-xs font-bold text-muted-foreground hover:underline"
      >
        Cancel
      </button>
    </div>
  );
}
