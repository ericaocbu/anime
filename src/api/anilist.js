const ANILIST_URL = "https://graphql.anilist.co";

const MAX_RETRIES = 2;
const MIN_REQUEST_INTERVAL = 2200;

let lastRequestTime = 0;
let requestQueue = Promise.resolve();

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function queueRequest(request) {
  const queuedRequest = requestQueue.then(async () => {
    const elapsed = Date.now() - lastRequestTime;

    if (elapsed < MIN_REQUEST_INTERVAL) {
      await wait(MIN_REQUEST_INTERVAL - elapsed);
    }

    lastRequestTime = Date.now();

    return request();
  });

  requestQueue = queuedRequest.catch(() => {});

  return queuedRequest;
}

async function requestAniList(
  query,
  variables = {},
  attempt = 0
) {
  const response = await fetch(ANILIST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (response.ok) {
    const result = await response.json();

    if (result.errors?.length) {
      const error = new Error(
        result.errors[0]?.message ||
          "AniList request failed"
      );

      error.status = result.errors[0]?.status;

      throw error;
    }

    return result.data;
  }

  const retryable =
    response.status === 429 ||
    response.status === 500 ||
    response.status === 502 ||
    response.status === 503 ||
    response.status === 504;

  if (retryable && attempt < MAX_RETRIES) {
    const retryAfter = response.headers.get("Retry-After");

    const delay = retryAfter
      ? Number(retryAfter) * 1000
      : 3000 * (attempt + 1);

    await wait(delay);

    return requestAniList(
      query,
      variables,
      attempt + 1
    );
  }

  const errorBody = await response.text();

  let message = `AniList request failed: ${response.status}`;

  try {
    const parsed = JSON.parse(errorBody);

    if (parsed.errors?.length) {
      message = parsed.errors
        .map((error) => error.message)
        .join("\n");
    } else if (parsed.message) {
      message = parsed.message;
    }
  } catch {
    if (errorBody) {
      message = `${message} — ${errorBody}`;
    }
}

console.error("AniList GraphQL error:", {
  status: response.status,
  message,
  query,
  variables,
});

const error = new Error(message);

error.status = response.status;

throw error;
}

export function anilistRequest(
  query,
  variables = {}
) {
  return queueRequest(() =>
    requestAniList(query, variables)
  );
}