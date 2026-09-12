# Telegram Scam-Flag Bot

A Telegram long-polling bot that checks URLs shared in chats. It retrieves each linked page through Exa, compares the page with the sender's claim using OpenAI, and replies in the original Telegram thread with a scam, legit, or uncertain assessment. It is designed to degrade safely when either external API is unavailable and does not use browser automation.

## Setup

1. Clone this repository and install Node.js 20 or later.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in `TELEGRAM_BOT_TOKEN`, `EXA_API_KEY`, and `OPENAI_API_KEY`.
4. Run `npm run start`.

For a production JavaScript build, run `npm run build` and then `node dist/index.js`.

## Behaviour

The bot is silent for messages without URLs. For every URL it finds (including bare `www.` links), it retrieves link text via Exa and asks OpenAI to look for message-to-page mismatches, urgency, credential or payment requests, implausible offers, and impersonation. API errors are logged and converted into an `uncertain` result so polling continues.
