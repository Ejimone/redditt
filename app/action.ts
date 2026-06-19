"use server";

import { auth } from "@/app/auth";
import { fetchStrapi } from "@/lib/api";
import { getActorHeaders } from "@/lib/actor";
import { fetchCollectionPagedSafe, toSlug } from "@/lib/strapi";
import { revalidatePath } from "next/cache";

export async function getPopularCommunities(page: number, pageSize: number = 5) {
  return fetchCollectionPagedSafe<{
    name?: string;
    slug?: string;
    description?: string;
  }>(
    `/subreddits?sort=createdAt:desc&pagination[pageSize]=${pageSize}&pagination[page]=${page}`,
    { next: { revalidate: 60 } },
    {
      fallback: {
        items: [],
        hasMore: false,
      },
    },
  );
}

const STRAPI_BASE_URL =
  process.env.STRAPI_URL?.trim() ||
  process.env.NEXT_PUBLIC_STRAPI_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim();
const UPLOAD_RETRY_DELAYS_MS = [300, 900];
const UPLOAD_RETRYABLE_STATUSES = new Set([502, 503, 504]);

export type FormActionState = {
  error?: string;
};

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

type AuthenticatedUser = {
  name?: string | null;
  email?: string | null;
};

async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Please sign in to continue.");
  }

  return session.user;
}

function getFormActionErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStrapiBaseUrl(): string {
  if (STRAPI_BASE_URL) {
    return STRAPI_BASE_URL;
  }

  throw new Error(
    "Missing Strapi base URL. Set STRAPI_URL (preferred) or NEXT_PUBLIC_STRAPI_URL.",
  );
}

function withActorHeaders(user: AuthenticatedUser, headers: HeadersInit = {}) {
  return {
    ...headers,
    ...getActorHeaders(user),
  };
}

async function uploadMedia(file: File): Promise<number | null> {
  if (!file || file.size === 0) {
    return null;
  }

  const formData = new FormData();
  formData.append("files", file);

  const token = process.env.STRAPI_API_TOKEN;
  if (!token) {
    return null;
  }

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  const strapiBaseUrl = getStrapiBaseUrl();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    let response: Response;

    try {
      response = await fetch(`${strapiBaseUrl}/api/upload`, {
        method: "POST",
        headers,
        body: formData,
        cache: "no-store",
      });
    } catch {
      if (attempt < 2) {
        await wait(UPLOAD_RETRY_DELAYS_MS[attempt] ?? 1200);
        continue;
      }

      throw new Error("Media upload failed: Unable to reach Strapi upload API");
    }

    if (response.ok) {
      const uploads = (await response.json()) as Array<{ id?: number }>;
      return uploads[0]?.id ?? null;
    }

    // Keep post creation working even if the token lacks upload permissions.
    if (response.status === 401 || response.status === 403) {
      return null;
    }

    if (UPLOAD_RETRYABLE_STATUSES.has(response.status) && attempt < 2) {
      await wait(UPLOAD_RETRY_DELAYS_MS[attempt] ?? 1200);
      continue;
    }

    throw new Error(
      `Media upload failed: ${response.status} ${response.statusText}`,
    );
  }

  return null;
}

export default async function createPost(formData: FormData) {
  const title = asString(formData.get("title"));
  const content = asString(formData.get("content"));
  const slug = asString(formData.get("slug"));
  const media = formData.get("media");

  if (!title || !content || !slug) {
    throw new Error("Title, content, and community slug are required.");
  }

  const user = await requireAuthenticatedUser();
  const headers = withActorHeaders(user, {
    "Content-Type": "application/json",
  });

  const mediaFile = media instanceof File ? media : null;
  const imageId = mediaFile ? await uploadMedia(mediaFile) : null;
  const postSlug = `${toSlug(title) || "post"}-${Date.now().toString(36)}`;

  await fetchStrapi<{ data: { id: number } }>(
    `/communities/${encodeURIComponent(slug)}/posts`,
    {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: {
        title,
        slug: postSlug,
        content,
        ...(imageId ? { image: imageId } : {}),
      },
    }),
    cache: "no-store",
    },
  );

  revalidatePath(`/r/${slug}`);
  revalidatePath(`/r/${slug}/comments/[postId]`, "page");
  revalidatePath("/trending");
}

export async function createCommunity(formData: FormData) {
  const name = asString(formData.get("name"));
  const slugInput = asString(formData.get("slug"));
  const description = asString(formData.get("description"));
  const rulesInput = asString(formData.get("rules"));
  const exploreCategoryInput = asString(formData.get("exploreCategory"));
  const weeklyVisitorsInput = asString(formData.get("weeklyVisitors"));

  if (!name || !description) {
    throw new Error("Community name and description are required.");
  }

  const allowedExploreCategories = new Set([
    "general",
    "technology",
    "games",
    "internet_culture",
    "humanities_law",
    "news_politics",
  ]);

  const exploreCategory = allowedExploreCategories.has(exploreCategoryInput)
    ? exploreCategoryInput
    : "general";

  const parsedWeeklyVisitors = Number.parseInt(weeklyVisitorsInput, 10);
  const weeklyVisitors = Number.isFinite(parsedWeeklyVisitors)
    ? Math.max(0, parsedWeeklyVisitors)
    : 0;

  const user = await requireAuthenticatedUser();

  const generatedSlug = toSlug(slugInput || name);
  const requestHeaders = withActorHeaders(user, {
    "Content-Type": "application/json",
  });

  const rules = rulesInput
    ? rulesInput
        .split("\n")
        .map((rule) => rule.trim())
        .filter(Boolean)
    : [];

  await fetchStrapi<{ data: { id: number; slug: string } }>("/communities", {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({
      data: {
        name,
        ...(generatedSlug ? { slug: generatedSlug } : {}),
        description,
        rules,
        exploreCategory,
        weeklyVisitors,
      },
    }),
    cache: "no-store",
  });

  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/explore");
  revalidatePath("/trending");
}

export async function createComment(formData: FormData) {
  const postId = Number(asString(formData.get("postId")));
  const postSlug = asString(formData.get("postSlug"));
  const subredditSlug = asString(formData.get("slug"));
  const content = asString(formData.get("content"));

  if (!Number.isInteger(postId) || !postSlug || !subredditSlug || !content) {
    throw new Error("Comment content, post id, and route slugs are required.");
  }

  const user = await requireAuthenticatedUser();
  const requestHeaders = withActorHeaders(user, {
    "Content-Type": "application/json",
  });

  await fetchStrapi<{ data: { id: number } }>(
    `/communities/${encodeURIComponent(subredditSlug)}/posts/${postId}/comments`,
    {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({
      data: {
        content,
      },
    }),
    cache: "no-store",
    },
  );

  revalidatePath(`/r/${subredditSlug}/comments/${postSlug}`);
}

export async function joinCommunity(slug: string) {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    throw new Error("Community slug is required.");
  }

  const user = await requireAuthenticatedUser();

  await fetchStrapi<{ data: { joined: boolean } }>(
    `/communities/${encodeURIComponent(normalizedSlug)}/join`,
    {
      method: "POST",
      headers: withActorHeaders(user),
      cache: "no-store",
    },
  );

  revalidatePath(`/r/${normalizedSlug}`);
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/trending");
  revalidatePath("/explore");
}

export async function leaveCommunity(slug: string) {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    throw new Error("Community slug is required.");
  }

  const user = await requireAuthenticatedUser();

  await fetchStrapi<{ data: { left: boolean } }>(
    `/communities/${encodeURIComponent(normalizedSlug)}/leave`,
    {
      method: "POST",
      headers: withActorHeaders(user),
      cache: "no-store",
    },
  );

  revalidatePath(`/r/${normalizedSlug}`);
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/trending");
  revalidatePath("/explore");
}

async function voteEntity(path: string, value: number) {
  if (value !== 1 && value !== -1) {
    throw new Error("Vote value must be 1 or -1.");
  }

  const user = await requireAuthenticatedUser();

  return fetchStrapi<{ data: { id: number; score: number } }>(path, {
    method: "POST",
    headers: withActorHeaders(user, {
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ value }),
    cache: "no-store",
  });
}

export async function votePost(postId: number, value: number) {
  if (!Number.isInteger(postId)) {
    throw new Error("Invalid post id.");
  }

  return voteEntity(`/posts/${postId}/vote`, value);
}

export async function voteComment(commentId: number, value: number) {
  if (!Number.isInteger(commentId)) {
    throw new Error("Invalid comment id.");
  }

  return voteEntity(`/comments/${commentId}/vote`, value);
}

export async function saveVote(postId: string, amount: number) {
  const parsedId = Number(postId);

  if (!Number.isInteger(parsedId)) {
    throw new Error("Invalid post id.");
  }

  return votePost(parsedId, amount);
}

export async function createPostAction(
  _prevState: FormActionState | null,
  formData: FormData,
): Promise<FormActionState | null> {
  try {
    await createPost(formData);
    return null;
  } catch (error) {
    return { error: getFormActionErrorMessage(error) };
  }
}

export async function createCommunityAction(
  _prevState: FormActionState | null,
  formData: FormData,
): Promise<FormActionState | null> {
  try {
    await createCommunity(formData);
    return null;
  } catch (error) {
    return { error: getFormActionErrorMessage(error) };
  }
}

export async function createCommentAction(
  _prevState: FormActionState | null,
  formData: FormData,
): Promise<FormActionState | null> {
  try {
    await createComment(formData);
    return null;
  } catch (error) {
    return { error: getFormActionErrorMessage(error) };
  }
}

export async function joinCommunityAction(
  _prevState: FormActionState | null,
  formData: FormData,
): Promise<FormActionState | null> {
  try {
    await joinCommunity(asString(formData.get("slug")));
    return null;
  } catch (error) {
    return { error: getFormActionErrorMessage(error) };
  }
}

export async function leaveCommunityAction(
  _prevState: FormActionState | null,
  formData: FormData,
): Promise<FormActionState | null> {
  try {
    await leaveCommunity(asString(formData.get("slug")));
    return null;
  } catch (error) {
    return { error: getFormActionErrorMessage(error) };
  }
}
