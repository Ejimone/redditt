"use client";
import Link from "next/link";

// Render a classic Reddit-style "Subreddit not found" message.
export default function SubredditNotFound() {
  return (
    <div className="flex flex-col items-center p-6 text-center sm:p-10 md:p-20">
      <h1 className="mb-4 text-2xl font-bold sm:text-4xl">
        404: Subreddit Not Found
      </h1>
      <p className="mb-6 text-zinc-600">
        The community you are looking for does not exist. It may have been
        banned or deleted.
      </p>
      <Link href="/" className="text-orange-600 font-bold hover:underline">
        Go back home
      </Link>
    </div>
  );
}
