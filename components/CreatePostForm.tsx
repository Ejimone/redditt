"use client";

import { createPostAction, type FormActionState } from "@/app/action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type CreatePostFormProps = {
  slug: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="min-h-11 w-full touch-manipulation sm:w-auto border-radius-10"
    >
      {pending ? "Posting…" : "Post"}
    </Button>
  );
}

export default function CreatePostForm({ slug }: CreatePostFormProps) {
  const [state, formAction] = useActionState<FormActionState | null, FormData>(
    createPostAction,
    null,
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Create a post</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="slug" value={slug} />

          {state?.error ? (
            <p className="text-sm text-red-400" role="alert">
              {state.error}
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Write a title"
              required
              className="h-11 min-h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Share your thoughts"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="media">Image or video (optional)</Label>
            <Input
              id="media"
              name="media"
              type="file"
              accept="image/*,video/*"
              className="h-11 min-h-11 py-2 file:min-h-9"
            />
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
