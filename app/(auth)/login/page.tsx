import LoginButton from "@/components/LoginButton";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string; forcePrompt?: string }>;
};

function resolveCallbackUrl(callbackUrl?: string): string {
  if (!callbackUrl) {
    return "/";
  }

  if (!callbackUrl.startsWith("/")) {
    return "/";
  }

  return callbackUrl;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, forcePrompt } = await searchParams;
  const redirectTo = resolveCallbackUrl(callbackUrl);
  const shouldForcePrompt = forcePrompt === "1";

  return (
    <main className="mx-auto w-full max-w-md px-4 py-6 sm:p-6">
      <h1 className="mb-2 text-xl font-bold sm:text-2xl">Log in</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Sign in with GitHub to create communities, posts, and comments.
      </p>
      <LoginButton callbackUrl={redirectTo} forcePrompt={shouldForcePrompt} />
    </main>
  );
}
