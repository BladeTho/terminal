import type { Passenger, Mobility, Intent } from "./types";
import { MOBILITY, BOARDING_STATUS, INTENT } from "./types";

/** Rough driving miles between the cities in the seed set. Good enough. */
const MILES: Record<string, Record<string, number>> = {
  "Ann Arbor, MI": { "Ann Arbor, MI": 0, "Ypsilanti, MI": 8, "Detroit, MI": 43, "Toledo, OH": 55 },
  "Ypsilanti, MI": { "Ann Arbor, MI": 8, "Ypsilanti, MI": 0, "Detroit, MI": 36, "Toledo, OH": 48 },
  "Detroit, MI": { "Ann Arbor, MI": 43, "Ypsilanti, MI": 36, "Detroit, MI": 0, "Toledo, OH": 60 },
  "Toledo, OH": { "Ann Arbor, MI": 55, "Ypsilanti, MI": 48, "Detroit, MI": 60, "Toledo, OH": 0 },
};

export function milesBetween(a: string, b: string): number {
  return MILES[a]?.[b] ?? 75;
}

/** How two people can realistically meet, given the less mobile of the pair. */
export type MeetingMode = "OUT" | "VISIT" | "REMOTE";

export function meetingMode(a: Mobility, b: Mobility): MeetingMode {
  const r = Math.min(MOBILITY[a].radius, MOBILITY[b].radius);
  if (r >= 3) return "OUT";
  if (r >= 1) return "VISIT";
  return "REMOTE";
}

export const MEETING_COPY: Record<MeetingMode, { label: string; blurb: string }> = {
  OUT: { label: "Can go out", blurb: "Both of you can leave the house. Pick somewhere with chairs." },
  VISIT: { label: "One of you travels", blurb: "One of you is mostly home. The other one shows up — that's the deal, and it should be said out loud." },
  REMOTE: { label: "Phone, letters, visits in", blurb: "Meeting out isn't on the table. That doesn't make it less real." },
};

export type Compat = {
  score: number;
  sharedItinerary: string[];
  sharedIntents: Intent[];
  miles: number;
  mode: MeetingMode;
  /** Plain-language reasons, shown on the card. No black-box percentages. */
  reasons: string[];
  /** The honest caution, if there is one. Shown with equal weight to the reasons. */
  caveats: string[];
};

export function compat(me: Passenger, them: Passenger): Compat {
  const sharedItinerary = me.itinerary.filter((i) => them.itinerary.includes(i));
  const sharedIntents = me.intents.filter((i) => them.intents.includes(i));
  const miles = milesBetween(me.city, them.city);
  const mode = meetingMode(me.mobility, them.mobility);

  // Shared wants are weighted hardest on purpose. Two people who both want to
  // see the northern lights have more to go on than two people who both like dogs.
  let score = 0;
  score += sharedItinerary.length * 18;
  score += sharedIntents.length * 9;
  score += Math.max(0, 24 - miles / 3);
  if (mode === "OUT") score += 10;
  if (mode === "VISIT") score += 4;

  const reasons: string[] = [];
  if (sharedItinerary.length)
    reasons.push(
      sharedItinerary.length === 1
        ? `You both want to ${lower(sharedItinerary[0])}`
        : `${sharedItinerary.length} things on both your itineraries`
    );
  if (sharedIntents.length)
    reasons.push(
      `You're both here for ${sharedIntents.map((i) => INTENT[i].label.toLowerCase()).slice(0, 2).join(" and ")}`
    );
  if (miles <= 12) reasons.push(`${miles} miles apart`);
  if (them.verified) reasons.push("Verified by a video call with our team");

  const caveats: string[] = [];
  if (mode === "REMOTE")
    caveats.push("Neither of you can easily get to the other. This one lives on the phone.");
  else if (mode === "VISIT")
    caveats.push(
      `${MOBILITY[them.mobility].radius < MOBILITY[me.mobility].radius ? them.name.split(" ")[0] : "You"} can't easily travel — someone has to do the showing up.`
    );
  if (them.status === "FINAL_CALL")
    caveats.push("Final Call. Be honest with yourself about whether you can start something here.");
  if (them.preflight.immunocompromised)
    caveats.push("Immunocompromised — a cold you'd shrug off is a hospital stay for them.");
  if (miles > 45) caveats.push(`${miles} miles is a real drive for both of you.`);

  return { score: Math.round(score), sharedItinerary, sharedIntents, miles, mode, reasons, caveats };
}

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/**
 * Layover ideas — date suggestions that account for what both people can
 * actually do. Generic dating apps suggest hiking. This one doesn't.
 */
export function layoverIdeas(me: Passenger, them: Passenger): string[] {
  const mode = meetingMode(me.mobility, them.mobility);
  const shared = me.itinerary.filter((i) => them.itinerary.includes(i));
  const out: string[] = [];

  for (const item of shared.slice(0, 2)) out.push(`Make a start on "${item}" together`);

  if (mode === "OUT") {
    out.push(
      "Matinee film — cheaper, quieter, and you're home before the tiredness lands",
      "Botanical garden on a weekday. Benches every forty feet",
      "Split one good lunch instead of two mediocre dinners",
      "Drive somewhere with a view and don't get out of the car"
    );
  } else if (mode === "VISIT") {
    out.push(
      "Bring lunch over. Ninety minutes, then leave before either of you flags",
      "Sit in the garden. Bring nothing, do nothing, that's the plan",
      "Watch the same film in the same room and talk over it",
      "Read to each other. Sounds twee, works enormously well"
    );
  } else {
    out.push(
      "A standing phone call, same time weekly. The reliability is the romance",
      "Write an actual letter. Post it. Wait for it",
      "Watch the same film at the same time, phones on, talk after",
      "Send a photo of something small every day"
    );
  }

  const goodDays = `Their good days: ${them.goodDays}`;
  return [...out.slice(0, 5), goodDays];
}

/** Openers that reference something specific. Nobody needs another "hey". */
export function icebreakers(me: Passenger, them: Passenger): string[] {
  const first = them.name.split(" ")[0];
  const shared = me.itinerary.filter((i) => them.itinerary.includes(i));
  const lines: string[] = [];

  if (shared.length)
    lines.push(`We've both got "${shared[0]}" on our list. Have you got a plan for it or is it still a someday?`);

  lines.push(`"${clip(them.lastWords)}" — that's the bit of your profile I read twice, ${first}.`);
  lines.push(`What's the one on your itinerary you'd actually do first?`);

  if (them.status === "FINAL_CALL" || them.status === "BOARDING")
    lines.push(`I'm not going to open with anything clever. I read your profile, I'd like to talk to you, and I'm around.`);
  if (them.intents.includes("MEALS"))
    lines.push(`What's the meal you'd want if you could only have one more? I'm asking seriously.`);

  lines.push(`Tell me something ordinary about your week. I'm told that's the good stuff.`);
  return lines.slice(0, 5);
}

const clip = (s: string, n = 74) => (s.length <= n ? s : s.slice(0, n).trimEnd() + "…");

/** Rank the deck. Everyone in the filter gets shown; order is by fit. */
export function rankDeck(
  me: Passenger,
  pool: Passenger[],
  opts: { statusFilter: string[]; maxDistance: number; seen: Set<string> }
): { passenger: Passenger; compat: Compat }[] {
  return pool
    .filter((p) => p.id !== me.id)
    .filter((p) => !opts.seen.has(p.id))
    .filter((p) => opts.statusFilter.includes(p.status))
    .filter((p) => milesBetween(me.city, p.city) <= opts.maxDistance)
    .map((p) => ({ passenger: p, compat: compat(me, p) }))
    .sort((x, y) => y.compat.score - x.compat.score);
}

export function statusTone(s: keyof typeof BOARDING_STATUS): string {
  return BOARDING_STATUS[s].tone;
}
