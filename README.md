# Terminal

**Connection for the time you have.**

A dating-app concept for company, romance and shared wishes through aging,
illness and uncertainty. Ordinary dates count as much as big adventures.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3210
npm run build
```

Next.js 15 / React 19. No database, API keys or AI calls. All 16 passengers are
fictional, matches are simulated, replies are scripted, and portraits are SVG.
The demo notice appears before onboarding and throughout the app.

## The experience

- **Boarding status · Your circumstances:** optional, self-declared and editable.
  Private is the default; Uncertain is also available alongside On Time, Delayed,
  Standby, Boarding and Final Call. Nobody needs to estimate a prognosis.
- **Gates · Browse:** profiles ranked by shared itinerary items, intentions,
  distance and meeting options. Everyday wishes receive the same weight as travel.
- **Itinerary · Shared wishes:** quiet coffee, Sunday lunch, adventures and custom items.
- **Layovers · Plan a date:** suggestions reflect both people's mobility. Two
  homebound people get remote options. Plans include reminders to discuss access,
  transport, rest breaks and cancellation. Saving a plan makes no real booking.
- **Ground crew · Emergency contact:** optional fictional contact with an opt-in
  reminder to share plans manually. No messages or calls are sent; nobody is
  monitored. Clear the contact name and save to remove it.
- **Pre-flight · Health & boundaries:** optional demo details, editable on My Pass.
  Blank testing and unchecked vaccination fields display as unstated. Mobility
  and scheduling needs are collected separately. No health data is verified.
- **Lounge:** fictional threads plus your own browser's posts, not a shared chatroom.

## Storage and privacy

Use fictional personal and health details. Each visitor has an independent
HttpOnly, SameSite=Lax cookie (Secure in production). State is sent to the server
with requests for rendering and actions; it is not shared with other visitors
or persisted in a server-side database. The cookie is compressed, not encrypted
or signed, and is unsuitable as a real account or medical-record system.

Existing uncompressed demo cookies remain readable. New writes have a 3,800-byte
value budget, leaving room under the browser cookie limit. Oversized updates are
rejected before replacing the previous cookie, with a recovery page. The demo
retains up to 40 recent messages and 20 personal lounge posts; it is not an archive.
Cookies expire after 180 days from the last successful save. Clear everything on
My Pass deletes this browser's demo cookie, including profile, matches and chats.

## Checks

```bash
npm run build
npm run e2e
npm run isolation
npm run check:overflow
```

Browser checks require a running local app and Google Chrome installed at the
standard macOS path. They use puppeteer-core without downloading a browser.

## Deployment

GitHub: https://github.com/BladeTho/terminal

Demo: https://terminal-dating-app.vercel.app

Pushing code does not currently redeploy the demo. Production updates require
`vercel deploy --prod` against the intended project. Long-term project ownership,
account billing tier and Git integration still need to be confirmed in Vercel.
