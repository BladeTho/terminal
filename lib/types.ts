/**
 * Terminal — domain model.
 *
 * The whole app runs on one metaphor: an airport terminal. People are
 * passengers, health honesty is boarding status, dates are layovers, and the
 * bucket list is an itinerary. The metaphor isn't decoration — it does real
 * work. "How much time do you have left" is an impossible question to put on a
 * signup form. "What's your boarding status" is not.
 */

/**
 * Self-declared runway. The single most important field in the app: it lets
 * people be honest about where they are without filling out a medical history,
 * and lets other people filter for what they can actually carry right now.
 * Nobody is required to pick a truthful one and nobody is asked to prove it.
 */
export type BoardingStatus =
  | "ON_TIME"
  | "DELAYED"
  | "STANDBY"
  | "BOARDING"
  | "FINAL_CALL";

export const BOARDING_STATUS: Record<
  BoardingStatus,
  { label: string; plain: string; blurb: string; tone: string; order: number }
> = {
  ON_TIME: {
    label: "On Time",
    plain: "No departure date on the books",
    blurb:
      "Old, not going anywhere. Knees complain, heart's fine. Here for the long haul, however long that turns out to be.",
    tone: "green",
    order: 0,
  },
  DELAYED: {
    label: "Delayed",
    plain: "Chronic, managed, slowed down",
    blurb:
      "Something long-term is running the schedule now. Not urgent, just permanent. Plans get moved, they don't get cancelled.",
    tone: "amber",
    order: 1,
  },
  STANDBY: {
    label: "Standby",
    plain: "Waiting on news",
    blurb:
      "Transplant list, trial results, next scan. Genuinely doesn't know. Living in the gate area with a bag packed.",
    tone: "violet",
    order: 2,
  },
  BOARDING: {
    label: "Boarding",
    plain: "Terminal diagnosis, time on the clock",
    blurb:
      "Has been given a number and intends to spend it well. Months to years. Wants company for the good part.",
    tone: "blue",
    order: 3,
  },
  FINAL_CALL: {
    label: "Final Call",
    plain: "Weeks, hospice, close",
    blurb:
      "Not looking for a future. Looking for a person. Visits, phone calls, someone who doesn't flinch.",
    tone: "red",
    order: 4,
  },
};

export type Mobility = "WALKING" | "CANE" | "WHEELCHAIR" | "HOMEBOUND" | "INPATIENT";

export const MOBILITY: Record<
  Mobility,
  { label: string; blurb: string; radius: number }
> = {
  WALKING: { label: "Walking fine", blurb: "Stairs, hills, long museums — all fair game.", radius: 4 },
  CANE: { label: "Cane / walker", blurb: "Happy to go out. Needs somewhere to sit every so often.", radius: 3 },
  WHEELCHAIR: { label: "Wheelchair", blurb: "Goes anywhere that's actually accessible. Ask first, don't push.", radius: 3 },
  HOMEBOUND: { label: "Mostly home", blurb: "Visitors welcome. Leaving the house is a whole production.", radius: 1 },
  INPATIENT: { label: "In a facility", blurb: "Hospital or hospice. Come to me — I've got a nice chair for guests.", radius: 0 },
};

/** What someone is actually here for. People are allowed to want more than one. */
export type Intent =
  | "ROMANCE"
  | "COMPANY"
  | "MEALS"
  | "CORRESPONDENCE"
  | "PHYSICAL"
  | "WITNESS";

export const INTENT: Record<Intent, { label: string; blurb: string }> = {
  ROMANCE: { label: "Romance", blurb: "The real thing. Butterflies at 78 are still butterflies." },
  COMPANY: { label: "Company", blurb: "Someone to sit next to. No agenda beyond that." },
  MEALS: { label: "Someone to eat with", blurb: "Eating alone is the part that gets people." },
  CORRESPONDENCE: { label: "Letters & calls", blurb: "Long phone calls. Actual mail. No pressure to show up." },
  PHYSICAL: { label: "Physical intimacy", blurb: "Touch, in whatever form still works. Named plainly on purpose." },
  WITNESS: { label: "A witness", blurb: "Someone who knows the whole story and will still be there at the end of it." },
};

/**
 * Pre-Flight Check — the honesty panel.
 *
 * People assume this crowd stopped caring about health disclosure because
 * pregnancy is off the table. That gets it exactly backwards. STIs don't check
 * your age, and half this app is immunocompromised — for them a partner's head
 * cold is a genuinely bigger threat than anything else on this list. So the
 * disclosure is right there on the boarding pass, stated flatly, no lecture.
 */
export type PreFlight = {
  /** ISO date of last STI panel, or null for "haven't / won't say". */
  lastTested: string | null;
  /** Anything they've chosen to state openly. Free text, shown verbatim. */
  disclosures: string[];
  /** Immunocompromised: visitors need to be honest about being sick. */
  immunocompromised: boolean;
  /** Vaccinations current — matters enormously to the person above. */
  vaccinesCurrent: boolean;
  /** Their own words on what safety means to them now. */
  note: string;
};

export type Passenger = {
  id: string;
  name: string;
  age: number;
  pronouns: string;
  city: string;
  /** Deterministic avatar seed — we draw a portrait, we never fake a photo. */
  seed: number;
  gate: string;
  status: BoardingStatus;
  /** Their own words about their runway. Optional, never a number we compute. */
  runway: string;
  mobility: Mobility;
  intents: Intent[];
  bio: string;
  /** Bucket list. The primary matching signal — shared wants beat shared traits. */
  itinerary: string[];
  /** When they're actually at their best. Real scheduling info, not flavor. */
  goodDays: string;
  greenFlags: string[];
  /** One thing they want a stranger to know before anything else. */
  lastWords: string;
  preflight: PreFlight;
  verified: boolean;
  joinedAt: string;
};

export type Direction = "TICKET" | "PASS";

export type Swipe = {
  from: string;
  to: string;
  direction: Direction;
  at: string;
};

export type Message = {
  id: string;
  matchId: string;
  from: string;
  body: string;
  at: string;
};

export type Match = {
  id: string;
  a: string;
  b: string;
  at: string;
  /** A layover is a planned meeting. Small, specific, energy-aware. */
  layover: { plan: string; when: string; at: string } | null;
  archived: boolean;
};

/** Emergency contact. Every passenger flies with one. */
export type GroundCrew = {
  name: string;
  relationship: string;
  phone: string;
  /** Auto-share layover plans with them. On by default, and it stays on unless changed. */
  shareLayovers: boolean;
};

export type Settings = {
  largeType: boolean;
  highContrast: boolean;
  /** Low Spoons Mode: fewer cards, no timers, no streaks, nothing that nags. */
  lowSpoons: boolean;
  /** Which boarding statuses this person can handle seeing right now. */
  statusFilter: BoardingStatus[];
  maxDistance: number;
};

export type Store = {
  me: Passenger | null;
  groundCrew: GroundCrew | null;
  settings: Settings;
  passengers: Passenger[];
  swipes: Swipe[];
  matches: Match[];
  messages: Message[];
  /** The Lounge — group threads for people in the same boat. */
  lounge: LoungePost[];
};

export type LoungePost = {
  id: string;
  room: string;
  author: string;
  body: string;
  at: string;
  hearts: number;
};

export const LOUNGE_ROOMS = [
  { id: "widowed", name: "The Widowers' Table", blurb: "Second time around, first time terrified." },
  { id: "scan", name: "Scanxiety Lounge", blurb: "For the three days before results. We know." },
  { id: "caregivers", name: "Ground Crew", blurb: "For the ones doing the carrying." },
  { id: "jokes", name: "Gallows Humour", blurb: "If you have to ask, this room isn't for you." },
];
