const BASE_URL = "https://api.jikan.moe/v4";

async function jikanRequest(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`Jikan request failed: ${response.status}`);
  }

  const result = await response.json();

  return result.data;
}

export { jikanRequest };