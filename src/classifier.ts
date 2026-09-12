import OpenAI from "openai";
import { config } from "./config";
import { Classification, Verdict } from "./types";

const client = new OpenAI({ apiKey: config.openAiApiKey });
const REQUEST_TIMEOUT_MS = 20_000;

const fallback = (linkAvailable: boolean): Classification => ({
  verdict: "uncertain",
  reason: linkAvailable
    ? "I couldn't confidently verify whether this message and link match."
    : "The link could not be verified, so this assessment is based on the message alone.",
});

export async function classifyMessage(originalMessage: string, linkContent: string | null): Promise<Classification> {
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a cautious anti-scam assistant. Do not invent facts. Return only valid JSON.",
        },
        {
          role: "user",
          content: buildPrompt(originalMessage, linkContent),
        },
      ],
    }, {
      timeout: REQUEST_TIMEOUT_MS,
    });

    const parsed = parseClassification(completion.choices[0]?.message.content);
    if (!parsed) return fallback(linkContent !== null);
    if (linkContent === null) {
      return { verdict: "uncertain", reason: appendUnverifiedNote(parsed.reason) };
    }
    return parsed;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`Could not classify message: ${reason}`);
    return fallback(linkContent !== null);
  }
}

function buildPrompt(message: string, linkContent: string | null): string {
  const source = linkContent === null ? "LINK CONTENT UNAVAILABLE" : linkContent.slice(0, 12_000);
  return `Assess this Telegram message and its linked page. Compare what the message claims with what the page actually shows. Check for urgency, requests for credentials or payment, too-good-to-be-true offers, and impersonation of a known brand or service.\n\nTelegram message:\n${message}\n\nLink content:\n${source}\n\nRespond with exactly this JSON shape: {"verdict":"scam"|"legit"|"uncertain","reason":"one short human-readable sentence suitable for a Telegram reply"}. If link content is unavailable, verdict must be uncertain.`;
}

function parseClassification(content: string | null | undefined): Classification | null {
  if (!content) return null;
  try {
    const value: unknown = JSON.parse(content);
    if (!value || typeof value !== "object") return null;
    const { verdict, reason } = value as { verdict?: unknown; reason?: unknown };
    if (!isVerdict(verdict) || typeof reason !== "string" || !reason.trim()) return null;
    return { verdict, reason: oneSentence(reason) };
  } catch {
    return null;
  }
}

function isVerdict(value: unknown): value is Verdict {
  return value === "scam" || value === "legit" || value === "uncertain";
}

function oneSentence(reason: string): string {
  return reason.trim().replace(/\s+/g, " ").split(/(?<=[.!?])\s+/)[0].slice(0, 500);
}

function appendUnverifiedNote(reason: string): string {
  const note = "The link could not be verified.";
  return reason.includes("link could not be verified") ? reason : `${oneSentence(reason)} ${note}`;
}
