"use client";

import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import PostCard from "@/components/PostCard";
import type { FeedPost } from "@/lib/feed-post";
import { useSearch } from "@/lib/search-context";
import { useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 300;

export default function LivePostsResults({
  initialPosts,
  initialQuery,
  isAuthenticated,
}: {
  initialPosts: FeedPost[];
  initialQuery: string;
  isAuthenticated: boolean;
}) {
  const { query, setQuery } = useSearch();

  // On first render, defer to a query already in the shared search box (the
  // user started typing before navigating here); otherwise adopt this
  // page's own URL query. Done during render, not an effect, since it only
  // ever needs to run once per mount -- see "you might not need an effect".
  const [hasSeeded, setHasSeeded] = useState(false);
  if (!hasSeeded) {
    setHasSeeded(true);
    if (!query && initialQuery) {
      setQuery(initialQuery);
    }
  }

  const [posts, setPosts] = useState(initialPosts);
  const [displayedQuery, setDisplayedQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Live search: refetch a short delay after each keystroke and swap the
  // rendered posts in place -- no navigation, so the input never reloads
  // the page or loses focus.
  useEffect(() => {
    if (query === displayedQuery) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoading(true);

      fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data: { posts?: FeedPost[] }) => {
          setPosts(data.posts ?? []);
          setDisplayedQuery(query);
        })
        .catch((error: unknown) => {
          if (!(error instanceof Error) || error.name !== "AbortError") {
            setPosts([]);
            setDisplayedQuery(query);
          }
        })
        .finally(() => setIsLoading(false));
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      abortRef.current?.abort();
    };
  }, [query, displayedQuery]);

  return (
    <>
      {displayedQuery ? (
        <PageHeader
          title={`Results for “${displayedQuery}”`}
          description="The latest submissions across communities, newest first."
        />
      ) : null}

      <div className="flex flex-col gap-4">
        {posts.length === 0 && !isLoading ? (
          <EmptyState message="No posts match. Try another search or create the first post in a community." />
        ) : null}

        {posts.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            subredditSlug={post.subredditSlug!}
            isAuthenticated={isAuthenticated}
            priority={index === 0}
            showSubredditLink
          />
        ))}
      </div>
    </>
  );
}
