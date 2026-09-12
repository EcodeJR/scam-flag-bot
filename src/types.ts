export type Verdict = "scam" | "legit" | "uncertain";

export interface Classification {
  verdict: Verdict;
  reason: string;
}

export interface AppConfig {
  telegramBotToken: string;
  exaApiKey: string;
  openAiApiKey: string;
}
