# Telegram Scam-Flag Bot

A Telegram long-polling bot that checks URLs shared in chats and groups. It
retrieves each linked page through Exa, compares the page against the
sender's claim using OpenAI, and replies in the original thread with a scam,
legit, or uncertain assessment. It degrades safely when either external API
is unavailable and does not use browser automation.

## Why this exists

Scam links in Nigerian WhatsApp/Telegram family and community groups usually
spread through forwards — a message makes a claim ("your delivery is
delayed, click to reschedule"), and the link is trusted because the person
who forwarded it seemed trustworthy, not because anyone checked where it
actually leads. This bot sits in the group itself and does that check
automatically, comparing what the message *says* against what the link
*actually contains*, and replies in-thread before anyone clicks through. It's
built for anyone in a group where links get forwarded faster than they get
verified — family groups, community groups, or workplace channels.

## Setup

1. Clone this repository and install Node.js 20 or later.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in `TELEGRAM_BOT_TOKEN`,
   `EXA_API_KEY`, and `OPENAI_API_KEY`.
4. Run `npm run start`.

For a production JavaScript build, run `npm run build` and then
`node dist/index.js`.

## Behaviour

The bot is silent for messages without URLs. For every URL it finds
(including bare `www.` links), it retrieves the link's content via Exa and
asks OpenAI to check for:

- a mismatch between what the message claims and what the page actually shows
- urgency language
- credential or payment requests
- implausible offers
- impersonation of a known brand or service

### Example output

> **Message:** "Your package couldn't be delivered, reschedule here: [link]"
>
> **Bot reply:** ⚠️ Possible scam: message claims a delivery reschedule, but
> the link leads to an unrelated login page requesting card details.

### Failure behaviour

If the Exa fetch fails (timeout, dead link, unreachable page), the bot still
attempts classification using the message text alone, and caps the verdict
at `uncertain` with a reason noting the link couldn't be verified. If the
OpenAI call fails or returns something unparseable, the result also defaults
to `uncertain` rather than crashing. Either failure is logged to the console;
polling continues either way.

## Cost note

Hosting can be run at no cost (see deployment notes below), but the Exa and
OpenAI API calls are not free — every message containing a link triggers one
call to each. There is currently no rate-limiting, so a busy group will
generate ongoing usage on both APIs. Worth keeping in mind before pointing
this at a high-traffic group unattended.

## License

MIT

## Demo

[Add demo video link here]