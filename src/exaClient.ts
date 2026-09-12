import { config } from "./config";

const EXA_CONTENTS_URL = "https://api.exa.ai/contents";
const REQUEST_TIMEOUT_MS = 15_000;

function toFetchableUrl(url: string): string {
  return url.startsWith("www.") ? `https://${url}` : url;
}

/** Retrieves text supplied by Exa. Failures deliberately degrade to null. */
export async function fetchLinkContent(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(EXA_CONTENTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.exaApiKey,
      },
      body: JSON.stringify({
        urls: [toFetchableUrl(url)],
        text: true,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Exa returned HTTP ${response.status}`);
    }

    const payload: unknown = await response.json();
    const text = getContentText(payload);
    if (!text) throw new Error("Exa response contained no usable text");
    return text;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`Could not fetch link content for ${url}: ${reason}`);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function getContentText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const results = (payload as { results?: unknown }).results;
  if (!Array.isArray(results) || results.length === 0) return null;
  const first = results[0];
  if (!first || typeof first !== "object") return null;
  const text = (first as { text?: unknown }).text;
  return typeof text === "string" && text.trim() ? text.trim() : null;
}
