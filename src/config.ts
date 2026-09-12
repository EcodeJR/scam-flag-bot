import "dotenv/config";
import { AppConfig } from "./types";

function required(name: "TELEGRAM_BOT_TOKEN" | "EXA_API_KEY" | "OPENAI_API_KEY"): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Add it to your .env file.`);
  }
  return value;
}

export const config: AppConfig = {
  telegramBotToken: required("TELEGRAM_BOT_TOKEN"),
  exaApiKey: required("EXA_API_KEY"),
  openAiApiKey: required("OPENAI_API_KEY"),
};
