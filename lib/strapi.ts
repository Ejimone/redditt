import { fetchStrapi, type StrapiRequestError } from "@/lib/api";

const STRAPI_MEDIA_BASE_URL =
  process.env.STRAPI_URL?.trim() ||
  process.env.NEXT_PUBLIC_STRAPI_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  "http://localhost:1337";

export type StrapiEntity<T> = {
  id?: number;
  documentId?: string;
  attributes?: T;
} & Partial<T>;

export type StrapiCollectionResponse<T> = {
  data: Array<StrapiEntity<T>>;
};

/** Strapi REST collection `meta.pagination` (v4/v5). */
export type StrapiPaginationMeta = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

export type StrapiPagedCollectionResponse<T> = StrapiCollectionResponse<T> & {
  meta?: {
    pagination?: Partial<StrapiPaginationMeta> & Record<string, unknown>;
  };
};

export type FetchCollectionPagedResult<T> = {
  items: Array<T & Partial<WithStrapiId>>;
  hasMore: boolean;
};

function inferHasMore(pagination: unknown): boolean {
  if (!pagination || typeof pagination !== "object") {
    return false;
  }
  const p = pagination as Partial<StrapiPaginationMeta>;
  if (
    typeof p.page === "number" &&
    typeof p.pageCount === "number" &&
    p.pageCount > 0
  ) {
    return p.page < p.pageCount;
  }
  if (
    typeof p.total === "number" &&
    typeof p.pageSize === "number" &&
    typeof p.page === "number"
  ) {
    return p.page * p.pageSize < p.total;
  }
  return false;
}

export type StrapiSingleResponse<T> = {
  data: StrapiEntity<T> | null;
};

export type WithStrapiId = {
  id: number;
  documentId?: string;
};

export function unwrapStrapiEntity<T>(
  entity: StrapiEntity<T>,
): T & Partial<WithStrapiId> {
  return {
    ...(entity.attributes ?? entity),
    id: entity.id,
    documentId: entity.documentId,
  } as T & Partial<WithStrapiId>;
}

export function extractRelationArray<T>(
  relation: unknown,
): Array<StrapiEntity<T>> {
  if (Array.isArray(relation)) {
    return relation as Array<StrapiEntity<T>>;
  }

  if (
    relation &&
    typeof relation === "object" &&
    "data" in relation &&
    Array.isArray((relation as { data?: unknown }).data)
  ) {
    return (relation as { data: Array<StrapiEntity<T>> }).data;
  }

  return [];
}

export function extractRelationOne<T>(
  relation: unknown,
): StrapiEntity<T> | null {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return null;
  }

  if (typeof relation === "object" && "data" in relation) {
    const wrapped = relation as { data?: StrapiEntity<T> | null };
    return wrapped.data ?? null;
  }

  return relation as StrapiEntity<T>;
}

export function extractMediaUrl(media: unknown): string | null {
  if (!media) {
    return null;
  }

  if (typeof media === "string") {
    return toAbsoluteMediaUrl(media);
  }

  const directMedia = media as { url?: string };
  if (directMedia.url) {
    return toAbsoluteMediaUrl(directMedia.url);
  }

  const mediaEntity = extractRelationOne<{ url?: string }>(media);
  if (!mediaEntity) {
    return null;
  }

  const normalized = unwrapStrapiEntity(mediaEntity);
  return toAbsoluteMediaUrl(normalized.url);
}

export function toAbsoluteMediaUrl(url?: string | null): string | null {
  if (!url) {
    return null;
  }

  return new URL(url, STRAPI_MEDIA_BASE_URL).toString();
}

export function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isStrapiRequestError(
  error: unknown,
): error is StrapiRequestError {
  return error instanceof Error;
}

export function isStrapiUnavailableError(error: unknown): boolean {
  if (!isStrapiRequestError(error)) {
    return false;
  }

  if (error.isNetworkError) {
    return true;
  }

  if (error.status === 503 || error.status === 502 || error.status === 504) {
    return true;
  }

  return (
    error.code === "ECONNREFUSED" ||
    error.code === "EAI_AGAIN" ||
    error.code === "ENOTFOUND"
  );
}

type SafeFetchOptions<T> = {
  fallback: T;
  onError?: (error: StrapiRequestError) => void;
  recoverableStatuses?: number[];
};

function shouldUseFallback(
  error: unknown,
  recoverableStatuses: number[],
): error is StrapiRequestError {
  if (!isStrapiRequestError(error)) {
    return false;
  }

  if (isStrapiUnavailableError(error)) {
    return true;
  }

  if (typeof error.status === "number") {
    return recoverableStatuses.includes(error.status);
  }

  return false;
}

export async function fetchCollection<T>(
  path: string,
  options?: RequestInit,
): Promise<Array<T & Partial<WithStrapiId>>> {
  const response = await fetchStrapi<StrapiCollectionResponse<T>>(
    path,
    options,
  );
  return response.data.map((entity) => unwrapStrapiEntity(entity));
}

export async function fetchCollectionPaged<T>(
  path: string,
  options?: RequestInit,
): Promise<FetchCollectionPagedResult<T>> {
  const response = await fetchStrapi<StrapiPagedCollectionResponse<T>>(
    path,
    options,
  );
  const items = response.data.map((entity) => unwrapStrapiEntity(entity));
  const hasMore = inferHasMore(response.meta?.pagination);
  return { items, hasMore };
}

export async function fetchSingle<T>(
  path: string,
  options?: RequestInit,
): Promise<(T & Partial<WithStrapiId>) | null> {
  const response = await fetchStrapi<StrapiSingleResponse<T>>(path, options);
  if (!response.data) {
    return null;
  }

  return unwrapStrapiEntity(response.data);
}

export async function fetchCollectionSafe<T>(
  path: string,
  options: RequestInit | undefined,
  safeOptions: SafeFetchOptions<Array<T & Partial<WithStrapiId>>>,
): Promise<Array<T & Partial<WithStrapiId>>> {
  const recoverableStatuses = safeOptions.recoverableStatuses ?? [401, 403];

  try {
    return await fetchCollection<T>(path, options);
  } catch (error) {
    if (shouldUseFallback(error, recoverableStatuses)) {
      if (safeOptions.onError) {
        safeOptions.onError(error);
      }
      return safeOptions.fallback;
    }

    throw error;
  }
}

type SafePagedFetchOptions<T> = {
  fallback: FetchCollectionPagedResult<T>;
  onError?: (error: StrapiRequestError) => void;
  recoverableStatuses?: number[];
};

export async function fetchCollectionPagedSafe<T>(
  path: string,
  options: RequestInit | undefined,
  safeOptions: SafePagedFetchOptions<T>,
): Promise<FetchCollectionPagedResult<T>> {
  const recoverableStatuses = safeOptions.recoverableStatuses ?? [401, 403];

  try {
    return await fetchCollectionPaged<T>(path, options);
  } catch (error) {
    if (shouldUseFallback(error, recoverableStatuses)) {
      if (safeOptions.onError) {
        safeOptions.onError(error);
      }
      return safeOptions.fallback;
    }

    throw error;
  }
}

export async function fetchSingleSafe<T>(
  path: string,
  options: RequestInit | undefined,
  safeOptions: SafeFetchOptions<(T & Partial<WithStrapiId>) | null>,
): Promise<(T & Partial<WithStrapiId>) | null> {
  const recoverableStatuses = safeOptions.recoverableStatuses ?? [401, 403];

  try {
    return await fetchSingle<T>(path, options);
  } catch (error) {
    if (shouldUseFallback(error, recoverableStatuses)) {
      if (safeOptions.onError) {
        safeOptions.onError(error);
      }
      return safeOptions.fallback;
    }

    throw error;
  }
}
