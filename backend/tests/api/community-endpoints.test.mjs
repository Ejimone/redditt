import assert from "node:assert/strict";
import { before, test } from "node:test";

const STRAPI_URL =
  process.env.TEST_STRAPI_URL?.trim() ||
  process.env.STRAPI_URL?.trim() ||
  "http://localhost:1337";

const API_TOKEN =
  process.env.TEST_STRAPI_API_TOKEN?.trim() ||
  process.env.STRAPI_API_TOKEN?.trim() ||
  "";

let skipReason = "";

function makeActor(prefix) {
  const nonce = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    key: `${prefix}-${nonce}`,
    name: `${prefix.replace(/-/g, " ")} ${nonce}`,
  };
}

function makeCommunitySlug(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function apiRequest(
  path,
  { method = "GET", body, actor, includeAuth = true } = {},
) {
  const headers = new Headers();

  if (includeAuth && API_TOKEN) {
    headers.set("Authorization", `Bearer ${API_TOKEN}`);
  }

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (actor?.key) {
    headers.set("x-reddit-actor-key", actor.key);
  }

  if (actor?.name) {
    headers.set("x-reddit-actor-name", actor.name);
  }

  const response = await fetch(`${STRAPI_URL}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return {
    status: response.status,
    json: await parseResponse(response),
  };
}

function ensureRunnable(t) {
  if (!skipReason) {
    return true;
  }

  t.skip(skipReason);
  return false;
}

before(async () => {
  if (!API_TOKEN) {
    skipReason =
      "Set STRAPI_API_TOKEN or TEST_STRAPI_API_TOKEN to run API integration tests.";
    return;
  }

  try {
    const response = await apiRequest("/communities?pagination[pageSize]=1");
    if (response.status >= 500 || response.status === 0) {
      skipReason =
        "Strapi API is unavailable. Start backend and retry tests.";
    }
  } catch {
    skipReason = "Strapi API is unavailable. Start backend and retry tests.";
  }
});

test("join endpoint requires authentication", async (t) => {
  if (!ensureRunnable(t)) {
    return;
  }

  const response = await apiRequest("/communities/nextjs/join", {
    method: "POST",
    includeAuth: false,
  });

  assert.ok(
    response.status === 401 || response.status === 403,
    `Expected 401/403 without auth, received ${response.status}`,
  );
});

test("vote endpoints require authentication", async (t) => {
  if (!ensureRunnable(t)) {
    return;
  }

  const postVote = await apiRequest("/posts/1/vote", {
    method: "POST",
    includeAuth: false,
    body: { value: 1 },
  });

  assert.ok(
    postVote.status === 401 || postVote.status === 403,
    `Expected 401/403 for unauthenticated post vote, received ${postVote.status}`,
  );

  const commentVote = await apiRequest("/comments/1/vote", {
    method: "POST",
    includeAuth: false,
    body: { value: 1 },
  });

  assert.ok(
    commentVote.status === 401 || commentVote.status === 403,
    `Expected 401/403 for unauthenticated comment vote, received ${commentVote.status}`,
  );
});

test("creating a post requires joining first", async (t) => {
  if (!ensureRunnable(t)) {
    return;
  }

  const owner = makeActor("owner");
  const member = makeActor("member");
  const slug = makeCommunitySlug("join-required");

  const createdCommunity = await apiRequest("/communities", {
    method: "POST",
    actor: owner,
    body: {
      data: {
        name: `Join Required ${slug}`,
        slug,
        description: "Community for join-required posting tests",
      },
    },
  });

  assert.equal(
    createdCommunity.status,
    201,
    `Expected community creation 201, received ${createdCommunity.status}`,
  );

  try {
    const blockedPost = await apiRequest(`/communities/${slug}/posts`, {
      method: "POST",
      actor: member,
      body: {
        data: {
          title: "Blocked before join",
          content: "Should be rejected until member joins.",
        },
      },
    });

    assert.equal(
      blockedPost.status,
      403,
      `Expected 403 before joining, received ${blockedPost.status}`,
    );

    const joinResponse = await apiRequest(`/communities/${slug}/join`, {
      method: "POST",
      actor: member,
    });

    assert.ok(
      joinResponse.status >= 200 && joinResponse.status < 300,
      `Expected successful join, received ${joinResponse.status}`,
    );

    const allowedPost = await apiRequest(`/communities/${slug}/posts`, {
      method: "POST",
      actor: member,
      body: {
        data: {
          title: "Allowed after join",
          content: "Now posting should succeed.",
        },
      },
    });

    assert.equal(
      allowedPost.status,
      201,
      `Expected 201 after joining, received ${allowedPost.status}`,
    );
  } finally {
    await apiRequest(`/communities/${slug}`, {
      method: "DELETE",
      actor: owner,
    });
  }
});

test("post ownership is enforced", async (t) => {
  if (!ensureRunnable(t)) {
    return;
  }

  const owner = makeActor("post-owner");
  const outsider = makeActor("post-outsider");
  const slug = makeCommunitySlug("ownership");

  const createdCommunity = await apiRequest("/communities", {
    method: "POST",
    actor: owner,
    body: {
      data: {
        name: `Ownership ${slug}`,
        slug,
        description: "Community for ownership tests",
      },
    },
  });

  assert.equal(
    createdCommunity.status,
    201,
    `Expected community creation 201, received ${createdCommunity.status}`,
  );

  try {
    const createdPost = await apiRequest(`/communities/${slug}/posts`, {
      method: "POST",
      actor: owner,
      body: {
        data: {
          title: "Owner post",
          content: "Only owner should modify this post.",
        },
      },
    });

    assert.equal(
      createdPost.status,
      201,
      `Expected owner post creation 201, received ${createdPost.status}`,
    );

    const postId = createdPost.json?.data?.id;
    assert.ok(Number.isInteger(postId), "Expected created post id in response");

    const joinOutsider = await apiRequest(`/communities/${slug}/join`, {
      method: "POST",
      actor: outsider,
    });

    assert.ok(
      joinOutsider.status >= 200 && joinOutsider.status < 300,
      `Expected outsider join success, received ${joinOutsider.status}`,
    );

    const forbiddenUpdate = await apiRequest(
      `/communities/${slug}/posts/${postId}`,
      {
        method: "PUT",
        actor: outsider,
        body: {
          data: {
            content: "Outsider update should fail",
          },
        },
      },
    );

    assert.equal(
      forbiddenUpdate.status,
      403,
      `Expected 403 for outsider update, received ${forbiddenUpdate.status}`,
    );

    const allowedOwnerUpdate = await apiRequest(
      `/communities/${slug}/posts/${postId}`,
      {
        method: "PUT",
        actor: owner,
        body: {
          data: {
            content: "Owner update should pass",
          },
        },
      },
    );

    assert.equal(
      allowedOwnerUpdate.status,
      200,
      `Expected 200 for owner update, received ${allowedOwnerUpdate.status}`,
    );

    const forbiddenDelete = await apiRequest(
      `/communities/${slug}/posts/${postId}`,
      {
        method: "DELETE",
        actor: outsider,
      },
    );

    assert.equal(
      forbiddenDelete.status,
      403,
      `Expected 403 for outsider delete, received ${forbiddenDelete.status}`,
    );
  } finally {
    await apiRequest(`/communities/${slug}`, {
      method: "DELETE",
      actor: owner,
    });
  }
});
