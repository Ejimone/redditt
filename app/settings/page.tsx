import { logoutAction } from "@/app/auth-actions";
import { auth } from "@/app/auth";
import FeedWithRightRail from "@/components/layout/FeedWithRightRail";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function SettingsContent() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/settings");
  }

  const user = session.user;
  const initial = (user.name?.trim() || user.email?.trim() || "?")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main>
      <PageHeader
        title="Settings"
        description="Your account on this Reddit clone. Profile data comes from your sign-in provider."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xl font-bold text-foreground">
              {initial}
            </div>
            <div className="min-w-0 space-y-1">
              <p className="truncate font-medium text-foreground">
                {user.name ?? "No display name"}
              </p>
              {user.email ? (
                <p className="truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <form action={logoutAction}>
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
            <Button asChild variant="ghost">
              <Link href="/">Back to home</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About Reddit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Reddit is a network of communities where people share stories, ask
              questions, and follow topics they care about.
            </p>
            <p>
              Join communities, vote on posts and comments, and discover new
              discussions across Popular, News, and Explore.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function SettingsPage() {
  return (
    <FeedWithRightRail>
      <Suspense
        fallback={
          <main>
            <p className="text-sm text-muted-foreground">Loading settings…</p>
          </main>
        }
      >
        <SettingsContent />
      </Suspense>
    </FeedWithRightRail>
  );
}
