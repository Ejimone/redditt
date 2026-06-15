const BASE_URL =
  process.env.STRAPI_URL?.trim() ||
  process.env.NEXT_PUBLIC_STRAPI_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim();
const MAX_STRAPI_FETCH_ATTEMPTS = 3;
const STRAPI_RETRYABLE_STATUSES = new Set([502, 503, 504]);
const STRAPI_RETRY_DELAY_MS = [350, 900];

export type StrapiRequestError = Error & {
  status?: number;
  code?: string;
  url?: string;
  isNetworkError?: boolean;
};

function buildStrapiError(
  message: string,
  details: Partial<StrapiRequestError> = {},
): StrapiRequestError {
  const error = new Error(message) as StrapiRequestError;
  error.status = details.status;
  error.code = details.code;
  error.url = details.url;
  error.isNetworkError = details.isNetworkError;
  return error;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isReadOnlyMethod(method: string): boolean {
  return method === "GET" || method === "HEAD";
}

function isAuthFailureStatus(status: number): boolean {
  return status === 401 || status === 403;
}

function getStrapiBaseUrl(): string {
  if (BASE_URL) {
    return BASE_URL;
  }

  throw buildStrapiError(
    "Missing Strapi base URL. Set STRAPI_URL (preferred) or NEXT_PUBLIC_STRAPI_URL.",
    { status: 500 },
  );
}

export async function fetchStrapi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const strapiBaseUrl = getStrapiBaseUrl();
  const url = new URL(`/api${path}`, strapiBaseUrl);
  const method = (options.method ?? "GET").toUpperCase();
  const isReadOnlyRequest = isReadOnlyMethod(method);

  const hasAnyPopulate = [...url.searchParams.keys()].some(
    (k) => k === "populate" || k.startsWith("populate["),
  );
  if (!hasAnyPopulate) {
    url.searchParams.set("populate", "*");
  }

  const baseHeaders = new Headers(options.headers);
  const token = process.env.STRAPI_API_TOKEN?.trim();
  const hasConfiguredToken = Boolean(token);
  let shouldSendAuthHeader = hasConfiguredToken;
  let retriedWithoutAuthHeader = false;

  for (let attempt = 0; attempt < MAX_STRAPI_FETCH_ATTEMPTS; attempt += 1) {
    const headers = new Headers(baseHeaders);
    if (shouldSendAuthHeader && token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      headers.delete("Authorization");
    }

    let response: Response;

    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (error) {
      const cause = error as { code?: string; cause?: { code?: string } };
      const networkCode = cause?.cause?.code ?? cause?.code;

      if (attempt < MAX_STRAPI_FETCH_ATTEMPTS - 1) {
        await wait(STRAPI_RETRY_DELAY_MS[attempt] ?? 1200);
        continue;
      }

      throw buildStrapiError(
        `Unable to reach Strapi at ${strapiBaseUrl}. Ensure backend is running and reachable.`,
        {
          status: 503,
          code: networkCode,
          url: url.toString(),
          isNetworkError: true,
        },
      );
    }

    if (response.ok) {
      return response.json() as Promise<T>;
    }

    let responseDetails = "";
    try {
      responseDetails = await response.text();
    } catch {
      responseDetails = "";
    }

    const authFailure = isAuthFailureStatus(response.status);
    if (authFailure && shouldSendAuthHeader && !retriedWithoutAuthHeader) {
      shouldSendAuthHeader = false;
      retriedWithoutAuthHeader = true;
      attempt -= 1;
      continue;
    }

    if (
      STRAPI_RETRYABLE_STATUSES.has(response.status) &&
      attempt < MAX_STRAPI_FETCH_ATTEMPTS - 1
    ) {
      await wait(STRAPI_RETRY_DELAY_MS[attempt] ?? 1200);
      continue;
    }

    const suffix = responseDetails ? ` - ${responseDetails.slice(0, 300)}` : "";

    if (authFailure && !isReadOnlyRequest) {
      const guidance = hasConfiguredToken
        ? "Strapi denied a write request. Verify STRAPI_API_TOKEN is valid and has write permissions"
        : "Strapi denied a write request. Set STRAPI_API_TOKEN with write permissions";

      throw buildStrapiError(
        `${guidance}: ${response.status} ${response.statusText}${suffix}`,
        {
          status: response.status,
          url: url.toString(),
        },
      );
    }

    if (authFailure && isReadOnlyRequest) {
      throw buildStrapiError(
        `Strapi denied read access for ${url}. Check public read permissions or your API token${suffix}`,
        {
          status: response.status,
          url: url.toString(),
        },
      );
    }

    throw buildStrapiError(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}${suffix}`,
      {
        status: response.status,
        url: url.toString(),
      },
    );
  }

  throw buildStrapiError("Unexpected Strapi fetch retry failure.", {
    status: 503,
    url: url.toString(),
    isNetworkError: true,
  });
}

export const fetchAPI = fetchStrapi;
