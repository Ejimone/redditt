import LoginButton from "@/components/LoginButton";

export default function SignupPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-6 sm:p-6">
      <h1 className="mb-2 text-xl font-bold sm:text-2xl">Create account</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Continue with GitHub to get started.
      </p>
      <LoginButton />
    </main>
  );
}
