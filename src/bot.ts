import TelegramBot from "node-telegram-bot-api";
import { config } from "./config";
import { classifyMessage } from "./classifier";
import { fetchLinkContent } from "./exaClient";
import { extractUrls } from "./extractUrls";
import { Classification } from "./types";

export function startBot(): TelegramBot {
  const bot = new TelegramBot(config.telegramBotToken, { polling: true });

  bot.getMe()
    .then((me) => console.log(`Authenticated as @${me.username ?? me.id}.`))
    .catch((error: Error) => console.error(`Telegram authentication check failed: ${error.message}`));

  bot.on("polling_start", () => console.log("Telegram polling connection established."));

  bot.on("message", async (message) => {
    try {
      const text = message.text;
      if (!text) {
        console.log(`Received a non-text message in chat ${message.chat.id}; ignoring it.`);
        return;
      }
      const urls = extractUrls(text);
      console.log(`Received text message ${message.message_id} in chat ${message.chat.id}; found ${urls.length} URL(s).`);
      if (urls.length === 0) return;

      for (const url of urls) {
        const content = await fetchLinkContent(url);
        const classification = await classifyMessage(text, content);
        await bot.sendMessage(message.chat.id, formatReply(classification), {
          reply_to_message_id: message.message_id,
        });
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.error(`Failed to process Telegram message: ${reason}`);
    }
  });

  bot.on("polling_error", (error) => console.error(`Telegram polling error: ${error.message}`));
  return bot;
}

function formatReply({ verdict, reason }: Classification): string {
  if (verdict === "scam") return `⚠️ Possible scam: ${reason}`;
  if (verdict === "legit") return `✅ Looks legit: ${reason}`;
  return `❓ Uncertain: ${reason}`;
}
