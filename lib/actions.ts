"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { read, write, mutate, reset, uid } from "./store";
import { compat } from "./match";

/** First character only — these strings are full of weekdays. */
const decap = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
import type {
  BoardingStatus,
  Direction,
  Intent,
  Mobility,
  Passenger,
} from "./types";

const now = () => new Date().toISOString();

/* ---------------- profile ---------------- */

export async function createProfile(form: FormData) {
  const itinerary = String(form.get("itinerary") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const me: Passenger = {
    id: "me",
    name: String(form.get("name") || "You"),
    age: Number(form.get("age") || 70),
    pronouns: String(form.get("pronouns") || "they/them"),
    city: String(form.get("city") || "Ann Arbor, MI"),
    seed: Math.floor(Math.random() * 90) + 1,
    gate: `A${Math.floor(Math.random() * 24) + 1}`,
    status: (String(form.get("status") || "PRIVATE") as BoardingStatus),
    runway: String(form.get("runway") || ""),
    mobility: (String(form.get("mobility") || "WALKING") as Mobility),
    intents: form.getAll("intents").map(String) as Intent[],
    bio: String(form.get("bio") || ""),
    itinerary,
    goodDays: String(form.get("goodDays") || ""),
    greenFlags: String(form.get("greenFlags") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    lastWords: String(form.get("lastWords") || ""),
    preflight: {
      lastTested: String(form.get("lastTested") || "") || null,
      disclosures: String(form.get("disclosures") || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      immunocompromised: form.get("immunocompromised") === "on",
      vaccinesCurrent: form.get("vaccinesCurrent") === "on",
      note: String(form.get("preflightNote") || ""),
    },
    verified: false,
    joinedAt: now(),
  };

  const store = await read();
  store.me = me;

  const crewName = String(form.get("crewName") || "").trim();
  if (crewName) {
    store.groundCrew = {
      name: crewName,
      relationship: String(form.get("crewRelationship") || ""),
      phone: String(form.get("crewPhone") || ""),
      shareLayovers: form.get("crewShare") === "on",
    };
  }

  // Seed the app with life. An empty dating app is a depressing dating app,
  // and this one is depressing enough on the way in.
  seedOpeningMatches(store);

  await write(store);
  revalidatePath("/", "layout");
  redirect("/gates");
}

/** Two people have already ticketed you before you finished signing up. */
function seedOpeningMatches(store: Awaited<ReturnType<typeof read>>) {
  const me = store.me!;
  const candidates = store.passengers
    .map((p) => ({ p, c: compat(me, p) }))
    .sort((a, b) => b.c.score - a.c.score)
    .slice(0, 2);

  for (const { p } of candidates) {
    const id = uid("m");
    store.matches.push({ id, a: "me", b: p.id, at: now(), layover: null, archived: false });
    store.swipes.push({ from: p.id, to: "me", direction: "TICKET", at: now() });
    store.swipes.push({ from: "me", to: p.id, direction: "TICKET", at: now() });
    store.messages.push({
      id: uid("msg"),
      matchId: id,
      from: p.id,
      body: openingLine(p, me),
      at: new Date(Date.now() - Math.random() * 7200_000).toISOString(),
    });
  }
}

function openingLine(them: Passenger, me: Passenger): string {
  const shared = me.itinerary.filter((i) => them.itinerary.includes(i));
  if (shared.length)
    return `You've got "${shared[0]}" on your list too. I've been carrying that one around for a while without doing anything about it. How about you?`;
  return `Read your profile twice, which I don't usually do. What's the ordinary part of your week looking like?`;
}

export async function updateProfile(form: FormData) {
  await mutate((store) => {
    if (!store.me) return;
    store.me.bio = String(form.get("bio") ?? store.me.bio);
    store.me.status = String(form.get("status") ?? store.me.status) as BoardingStatus;
    store.me.runway = String(form.get("runway") ?? store.me.runway);
    store.me.mobility = String(form.get("mobility") ?? store.me.mobility) as Mobility;
    store.me.goodDays = String(form.get("goodDays") ?? store.me.goodDays);
    store.me.lastWords = String(form.get("lastWords") ?? store.me.lastWords);
    const intents = form.getAll("intents").map(String) as Intent[];
    if (intents.length) store.me.intents = intents;
  });
  revalidatePath("/profile");
}

export async function updatePreflight(form: FormData) {
  await mutate((store) => {
    if (!store.me) return;
    store.me.preflight = {
      lastTested: String(form.get("lastTested") || "") || null,
      disclosures: String(form.get("disclosures") || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      immunocompromised: form.get("immunocompromised") === "on",
      vaccinesCurrent: form.get("vaccinesCurrent") === "on",
      note: String(form.get("preflightNote") || ""),
    };
  });
  revalidatePath("/profile");
}

export async function setGroundCrew(form: FormData) {
  await mutate((store) => {
    if (!String(form.get("crewName") || "").trim()) {
      store.groundCrew = null;
      return;
    }
    store.groundCrew = {
      name: String(form.get("crewName") || ""),
      relationship: String(form.get("crewRelationship") || ""),
      phone: String(form.get("crewPhone") || ""),
      shareLayovers: form.get("crewShare") === "on",
    };
  });
  revalidatePath("/profile");
}

export async function updateSettings(form: FormData) {
  await mutate((store) => {
    const filter = form.getAll("statusFilter").map(String) as BoardingStatus[];
    store.settings = {
      largeType: form.get("largeType") === "on",
      highContrast: form.get("highContrast") === "on",
      lowSpoons: form.get("lowSpoons") === "on",
      statusFilter: filter.length ? filter : store.settings.statusFilter,
      maxDistance: Number(form.get("maxDistance") || store.settings.maxDistance),
    };
  });
  revalidatePath("/", "layout");
}

/* ---------------- the deck ---------------- */

export async function swipe(toId: string, direction: Direction) {
  const matched = await mutate((store) => {
    if (!store.me) return false;
    if (!store.passengers.some(p => p.id === toId)) return false;
    if (store.swipes.some(s => s.from === "me" && s.to === toId)) return false;
    store.swipes.push({ from: "me", to: toId, direction, at: now() });
    if (direction === "PASS") return false;

    const them = store.passengers.find((p) => p.id === toId);
    if (!them) return false;

    // Do they ticket you back? Weighted by actual fit, with a stable
    // per-person outcome so the app doesn't feel like a slot machine. The rate
    // is deliberately generous — the premise of Terminal is that nobody here
    // has the time or the appetite to play hard to get — but a weak fit still
    // often goes nowhere, otherwise the button means nothing.
    const score = compat(store.me, them).score;
    const roll = (them.seed * 37) % 100;
    if (score * 1.1 + 18 < roll) return false;

    const id = uid("m");
    store.matches.push({ id, a: "me", b: toId, at: now(), layover: null, archived: false });
    store.swipes.push({ from: toId, to: "me", direction: "TICKET", at: now() });
    store.messages.push({
      id: uid("msg"),
      matchId: id,
      from: toId,
      body: openingLine(them, store.me),
      at: now(),
    });
    return true;
  });

  revalidatePath("/gates");
  revalidatePath("/matches");
  revalidatePath(`/passengers/${toId}`);
  return matched;
}

export async function undoLastSwipe() {
  await mutate((store) => {
    for (let i = store.swipes.length - 1; i >= 0; i--) {
      if (store.swipes[i].from === "me") {
        const [undone] = store.swipes.splice(i, 1);
        const m = store.matches.find((x) => x.b === undone.to);
        if (m) {
          store.matches = store.matches.filter((x) => x.id !== m.id);
          store.messages = store.messages.filter((x) => x.matchId !== m.id);
          store.swipes = store.swipes.filter((s) => !(s.from === undone.to && s.to === "me"));
        }
        break;
      }
    }
  });
  revalidatePath("/", "layout");
}

/* ---------------- matches & chat ---------------- */

export async function sendMessage(matchId: string, body: string) {
  const clean = body.trim();
  if (!clean) return;

  await mutate((store) => {
    store.messages.push({ id: uid("msg"), matchId, from: "me", body: clean, at: now() });

    // The other person replies. This is a demo without a second human in it —
    // the reply is drawn from their own voice, never generated as medical talk.
    const match = store.matches.find((m) => m.id === matchId);
    const them = store.passengers.find((p) => p.id === match?.b);
    if (them) {
      store.messages.push({
        id: uid("msg"),
        matchId,
        from: them.id,
        body: reply(them, clean),
        at: new Date(Date.now() + 1000).toISOString(),
      });
    }
  });
  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/matches");
}

const REPLIES = [
  (t: Passenger) => `That's a better question than I was expecting. Give me a minute — I'm at my best ${decap(t.goodDays)}`,
  () => `Ha. Right, well now I have to answer honestly, don't I.`,
  (t: Passenger) => `Honestly? The thing I keep coming back to is "${t.itinerary[0]}". Everything else is negotiable.`,
  () => `Say more. I've got nothing but time, which is either a joke or isn't depending on the day.`,
  () => `You're the first person on here who hasn't asked me how I'm feeling. Thank you for that.`,
  (t: Passenger) => `I'll tell you the whole thing if you'll come sit down. I'm in ${t.city.split(",")[0]} and the kettle works.`,
];

function reply(them: Passenger, incoming: string): string {
  const i = (incoming.length + them.seed) % REPLIES.length;
  return REPLIES[i](them);
}

export async function setLayover(matchId: string, form: FormData) {
  await mutate((store) => {
    const m = store.matches.find((x) => x.id === matchId);
    if (!m) return;
    m.layover = {
      plan: String(form.get("plan") || ""),
      when: String(form.get("when") || ""),
      at: now(),
    };
  });
  revalidatePath(`/matches/${matchId}`);
}

export async function clearLayover(matchId: string) {
  await mutate((store) => {
    const m = store.matches.find((x) => x.id === matchId);
    if (m) m.layover = null;
  });
  revalidatePath(`/matches/${matchId}`);
}

export async function archiveMatch(matchId: string) {
  await mutate((store) => {
    const m = store.matches.find((x) => x.id === matchId);
    if (m) m.archived = !m.archived;
  });
  revalidatePath("/matches");
  revalidatePath(`/matches/${matchId}`);
}

/* ---------------- itinerary ---------------- */

export async function addItineraryItem(form: FormData) {
  const item = String(form.get("item") || "").trim();
  if (!item) return;
  await mutate((store) => {
    if (store.me && !store.me.itinerary.includes(item)) store.me.itinerary.push(item);
  });
  revalidatePath("/itinerary");
  revalidatePath("/gates");
}

export async function removeItineraryItem(item: string) {
  await mutate((store) => {
    if (store.me) store.me.itinerary = store.me.itinerary.filter((i) => i !== item);
  });
  revalidatePath("/itinerary");
}

export async function adoptItineraryItem(item: string) {
  await mutate((store) => {
    if (store.me && !store.me.itinerary.includes(item)) store.me.itinerary.push(item);
  });
  revalidatePath("/itinerary");
}

/* ---------------- the lounge ---------------- */

export async function postToLounge(room: string, form: FormData) {
  const body = String(form.get("body") || "").trim();
  if (!body) return;
  await mutate((store) => {
    store.lounge.unshift({ id: uid("l"), room, author: "me", body, at: now(), hearts: 0 });
  });
  revalidatePath(`/lounge/${room}`);
}

export async function heartPost(postId: string, room: string) {
  await mutate((store) => {
    const p = store.lounge.find((x) => x.id === postId);
    if (p) p.hearts += 1;
  });
  revalidatePath(`/lounge/${room}`);
}

/* ---------------- danger zone ---------------- */

export async function resetEverything() {
  await reset();
  revalidatePath("/", "layout");
  redirect("/");
}
