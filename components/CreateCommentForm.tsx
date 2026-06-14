"use client";

import {
  createCommentAction,
  type FormActionState,
} from "@/app/action";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type CreateCommentFormProps = {
  postId: number;
  postSlug: string;
  subredditSlug: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="min-h-11 w-full touch-manipulation sm:w-auto"
    >
      {pending ? "Posting…" : "Comment"}
    </Button>
  );
}

export default function CreateCommentForm({
  postId,
  postSlug,
  subredditSlug,
}: CreateCommentFormProps) {
  const [state, formAction] = useActionState<
    FormActionState | null,
    FormData
  >(createCommentAction, null);

  return (
    <Card>
      <CardContent className="p-4">
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="postId" value={postId} />
          <input type="hidden" name="postSlug" value={postSlug} />
          <input type="hidden" name="slug" value={subredditSlug} />

          {state?.error ? (
            <p className="text-sm text-red-400" role="alert">
              {state.error}
            </p>
          ) : null}

          <Textarea
            name="content"
            placeholder="Add a comment"
            required
            minLength={2}
          />

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
