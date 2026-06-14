import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

type StrapiWebhookPayload = {
  model?: string;
  entry?: {
    slug?: string;
    subreddit?: {
      slug?: string;
    };
  };
};

export async function POST(request: Request) {
  const webhookSecret = process.env.STRAPI_WEBHOOK_SECRET;
  const requestSecret = request.headers.get("x-webhook-secret");

  if (webhookSecret && requestSecret !== webhookSecret) {
    return NextResponse.json(
      { error: "Unauthorized webhook" },
      { status: 401 },
    );
  }

  let payload: StrapiWebhookPayload;
  try {
    payload = (await request.json()) as StrapiWebhookPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const subredditSlug =
    payload.entry?.subreddit?.slug ||
    (payload.model === "subreddit" ? payload.entry?.slug : undefined);

  revalidatePath("/");
  revalidatePath("/trending");

  if (subredditSlug) {
    revalidatePath(`/r/${subredditSlug}`);
    revalidatePath(`/r/${subredditSlug}/rules`);
  }

  return NextResponse.json({ revalidated: true, model: payload.model ?? null });
}
