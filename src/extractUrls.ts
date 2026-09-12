/** Extract HTTP(S) links and bare www. links from a Telegram message. */
export function extractUrls(text: string): string[] {
  const matches = text.match(/(?:https?:\/\/|www\.)[^\s<>()\[\]{}"']+/gi) ?? [];
  const seen = new Set<string>();

  return matches
    .map((url) => url.replace(/[.,!?;:]+$/g, ""))
    .filter((url) => {
      const normalized = url.toLowerCase();
      if (!url || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
}
