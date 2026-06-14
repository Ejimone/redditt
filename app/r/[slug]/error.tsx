"use client";

// It should accept two props: error (the error object) and reset (a function to try re-rendering the page).
// Render a message: "Something went wrong in r/[slug]" and a "Try Again" button that calls reset().
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Something went wrong in r/[slug]</h1>
      {error.message ? (
        <p className="mt-2 text-sm text-zinc-600">{error.message}</p>
      ) : null}
      <button type="button" className="mt-4 underline" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
