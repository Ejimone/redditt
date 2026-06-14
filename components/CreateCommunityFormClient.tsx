"use client";

import {
  createCommunityAction,
  type FormActionState,
} from "@/app/action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

const EXPLORE_OPTIONS = [
  { value: "general", label: "General" },
  { value: "technology", label: "Technology" },
  { value: "games", label: "Games" },
  { value: "internet_culture", label: "Internet culture" },
  { value: "humanities_law", label: "Humanities & Law" },
  { value: "news_politics", label: "News & Politics" },
] as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="min-h-11 w-full touch-manipulation sm:w-auto"
    >
      {pending ? "Creating…" : "Create community"}
    </Button>
  );
}

export default function CreateCommunityFormClient() {
  const [state, formAction] = useActionState<
    FormActionState | null,
    FormData
  >(createCommunityAction, null);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Create a community</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error ? (
            <p className="text-sm text-red-400" role="alert">
              {state.error}
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="community-name">Name</Label>
            <Input
              id="community-name"
              name="name"
              placeholder="e.g. Next.js"
              minLength={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="community-slug">Slug</Label>
            <Input id="community-slug" name="slug" placeholder="e.g. nextjs" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="community-description">Description</Label>
            <Textarea
              id="community-description"
              name="description"
              placeholder="What is this community about?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="community-rules">Rules (one per line)</Label>
            <Textarea
              id="community-rules"
              name="rules"
              placeholder={"Be respectful\nNo spam"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="explore-category">Explore category</Label>
            <select
              id="explore-category"
              name="exploreCategory"
              defaultValue="general"
              className="flex h-11 w-full rounded-md border border-white/15 bg-[#1a282d] px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
            >
              {EXPLORE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weekly-visitors">Weekly visitors (for Explore)</Label>
            <Input
              id="weekly-visitors"
              name="weeklyVisitors"
              type="number"
              min={0}
              placeholder="e.g. 5200000"
            />
            <p className="text-xs text-muted-foreground">
              Optional. Used on the Explore page (display only).
            </p>
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
