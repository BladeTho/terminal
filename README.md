# Terminal

**A dating app for people who are old, ill, or out of time.**

Everyone here knows roughly how the story ends. That turns out to remove most of
the nonsense from dating and almost none of the point of it.

```bash
npm install
npm run dev      # http://localhost:3210
```

No database, no API keys, no config. State lives in `data/store.json`, which is
created on first run. `npm run reset` wipes it back to a fresh departures hall.

---

## The metaphor does the work

The whole app runs on one idea — an airport terminal. It isn't decoration. Each
piece of the metaphor solves a design problem that a normal dating app can't:

| Terminal | The problem it solves |
|---|---|
| **Boarding status** | "How long have you got" is impossible to put on a signup form. "What's your boarding status" is not. |
| **Gates** | The browse deck. Ranked by fit, capped in Low Spoons Mode. |
| **Itinerary** | The bucket list, used as the primary matching signal. |
| **Layovers** | Dates, planned around what two specific bodies can actually do. |
| **Ground crew** | Emergency contact — and the person we'd want to hear from if you stopped answering. |
| **Pre-flight check** | Health honesty, stated on the pass instead of at the worst possible moment. |
| **The Lounge** | Group rooms, for the people who aren't here to date at all. |

## Boarding status

The single most important field in the app. Five options, self-declared, nobody
proves anything, change it whenever it changes.

- **On Time** — no departure date on the books
- **Delayed** — chronic, managed, slowed down
- **Standby** — waiting on a transplant, a trial, the next scan
- **Boarding** — terminal diagnosis, time on the clock
- **Final Call** — weeks, hospice, close

It exists so that neither person has to work it out over three weeks of texting,
and so the other one can filter for what they can honestly carry today. Nobody is
told they've been filtered out.

## Matching

Shared **wants** are weighted hardest — two people who both want to see the
northern lights have more to work with than two people who both like dogs.
`lib/match.ts` scores shared itinerary items (×18), shared intent (×9), distance,
and whether the two of you can physically get to each other.

The score is never shown as a percentage. Cards show plain-language reasons
(*"You both want to eat oysters somewhere they were pulled that morning"*) and,
with equal weight, the honest caveats (*"Final Call — be honest with yourself
about whether you can start something here"*).

## Layovers

Date suggestions derived from the **less mobile** of the two people, so the app
never suggests a hike to someone in a wheelchair:

- **Can go out** → matinees, botanical gardens, benches every forty feet
- **One of you travels** → bring lunch, ninety minutes, leave before either flags
- **Phone, letters, visits in** → a standing weekly call; the reliability is the romance

Booking one sends the plan, the place and the time to your ground crew.

## Pre-flight check

There's a widespread idea that none of this matters once pregnancy is off the
table. Pregnancy is the *only* risk that retires. STIs don't check anyone's age,
and a good share of the people here are immunocompromised — for them a cold you'd
shrug off is a hospital admission.

So testing date, disclosures, immune status and vaccination status sit on the
boarding pass, stated plainly, and matches with an immunocompromised person get a
banner saying the most useful thing you can do is be honest when you're unwell.

## Accessibility, and Low Spoons Mode

Large type is **on by default** — we know who's using this. High contrast is one
toggle. Every target is at least 48px.

**Low Spoons Mode** is the one we're proudest of: three profiles a day, no
animation, no badges, no streaks, nothing that nags you to come back. Built for
the weeks when the app is the last thing you have energy for. Most consumer apps
are designed to extract attention from people who have plenty. This one isn't.

Archiving keeps everything. Nothing is ever deleted — people come back to these
threads, and sometimes they're the only copy of a voice that's left.

---

## Layout

```
app/
  page.tsx              departures board / landing
  onboarding/           eight-step check-in
  gates/                the deck
  matches/[id]/         chat, layover planner, their pass
  itinerary/            bucket list + who else wants each thing
  lounge/[room]/        group rooms
  profile/              your pass, settings, pre-flight, ground crew
lib/
  types.ts              domain model + all the status/intent copy
  seed.ts               16 passengers
  match.ts              compatibility, layover ideas, icebreakers
  store.ts              JSON-file persistence (swap for Prisma here, one file)
  actions.ts            every mutation, as server actions
components/
  avatar.tsx            generative SVG portraits
  passenger-card.tsx    the boarding pass
  deck.tsx  chat.tsx  layover.tsx  nav.tsx  ui.tsx
scripts/
  measure.mjs           responsive overflow checker (npm run check:overflow)
  e2e.mjs               drives the whole flow in Chrome (npm run e2e)
  shots.mjs             screenshots at 430px (npm run shots)
```

Dev tooling uses `puppeteer-core` against your installed Chrome — nothing is
downloaded.

## Notes

The sixteen passengers are fictional and their replies are scripted from their
own voice; there is no model call anywhere in this app. Portraits are drawn from
a seed rather than photographed — faking pictures of dying people to demo a
product would be grotesque.

Everything else — the status model, the mobility-aware planning, the shared-wants
matching, the ground crew, the pre-flight check, Low Spoons Mode — is real and
implemented.
