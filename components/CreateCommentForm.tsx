"use client";

import {
  createCommentAction,
  type FormActionState,
} from "@/app/action";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

type CreateCommentFormProps = {
  postId: number;
  postSlug: string;
  subredditSlug: string;
  parentId?: number;
  placeholder?: string;
  onSuccess?: () => void;
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
  parentId,
  placeholder = "Add a comment",
  onSuccess,
}: CreateCommentFormProps) {
  const [state, formAction] = useActionState<
    FormActionState | null,
    FormData
  >(createCommentAction, null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current && state === null) {
      submittedRef.current = false;
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <Card>
      <CardContent className="p-4">
        <form
          action={formAction}
          onSubmit={() => {
            submittedRef.current = true;
          }}
          className="space-y-3"
        >
          <input type="hidden" name="postId" value={postId} />
          <input type="hidden" name="postSlug" value={postSlug} />
          <input type="hidden" name="slug" value={subredditSlug} />
          {parentId ? (
            <input type="hidden" name="parentId" value={parentId} />
          ) : null}

          {state?.error ? (
            <p className="text-sm text-red-400" role="alert">
              {state.error}
            </p>
          ) : null}

          <Textarea
            name="content"
            placeholder={placeholder}
            required
            minLength={2}
          />

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
