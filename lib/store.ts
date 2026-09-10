import { deflateSync, inflateSync } from "node:zlib";
import { cookies } from "next/headers";
import type { Store, Settings, LoungePost } from "./types";
import { PASSENGERS, LOUNGE_SEED } from "./seed";

/**
 * Cookie-backed store — one visitor, one cookie, nothing shared on the server.
 *
 * This app is a public demo: many strangers can open it at once, and each
 * one needs their own private passenger, matches and chats. A single shared
 * file (the original local-only design) would mean the second visitor's
 * check-in overwrites the first visitor's profile. A cookie makes every
 * visitor's state theirs alone.
 *
 * Browsers cap a cookie around 4KB, so only the visitor's own data is ever
 * persisted — `passengers` and the seed Lounge posts are static content from
 * seed.ts and are re-attached on every read, never written to the cookie.
 * (One consequence: the Lounge is no longer a space shared across real
 * visitors, since nothing is shared server-side any more — each visitor sees
 * the seed conversation plus their own posts. Fine for a demo; a real
 * multi-user Lounge needs a database, not a cookie.)
 */

const COOKIE = "terminal_state";
const MAX_AGE = 60 * 60 * 24 * 180; // 180 days

const DEFAULT_SETTINGS: Settings = {
  largeType: true,
  highContrast: false,
  lowSpoons: false,
  statusFilter: ["PRIVATE", "UNSURE", "ON_TIME", "DELAYED", "STANDBY", "BOARDING", "FINAL_CALL"],
  maxDistance: 60,
};

/** The slice of Store that's actually specific to this visitor. */
type Persisted = Pick<Store, "me" | "groundCrew" | "settings" | "swipes" | "matches" | "messages"> & {
  /** Only posts this visitor wrote — the seed posts are re-attached on read. */
  myLounge: LoungePost[];
};

function blankPersisted(): Persisted {
  return {
    me: null,
    groundCrew: null,
    settings: DEFAULT_SETTINGS,
    swipes: [],
    matches: [],
    messages: [],
    myLounge: [],
  };
}

function expand(p: Persisted): Store {
  return {
    me: p.me,
    groundCrew: p.groundCrew,
    settings: { ...DEFAULT_SETTINGS, ...p.settings },
    passengers: PASSENGERS,
    swipes: p.swipes,
    matches: p.matches,
    messages: p.messages,
    lounge: [...p.myLounge, ...LOUNGE_SEED],
  };
}

function narrow(store: Store): Persisted {
  return {
    me: store.me,
    groundCrew: store.groundCrew,
    settings: store.settings,
    // Keep the cookie well under the ~4KB browser limit.
    swipes: store.swipes,
    matches: store.matches,
    messages: store.messages.slice(-40),
    myLounge: store.lounge.filter((p) => p.author === "me").slice(0, 20),
  };
}

export async function read(): Promise<Store> {
  try {
    const jar = await cookies();
    const raw = jar.get(COOKIE)?.value;
    if (!raw) return expand(blankPersisted());
    const decoded = raw.startsWith("z.")
      ? inflateSync(Buffer.from(raw.slice(2), "base64url"), { maxOutputLength: 128 * 1024 })
      : Buffer.from(raw, "base64url");
    const parsed = JSON.parse(decoded.toString("utf8")) as Persisted;
    return expand(parsed);
  } catch {
    return expand(blankPersisted());
  }
}

/** Only callable from a Server Action or Route Handler — Next forbids
 *  writing cookies during render, so this must never run from a page. */
export async function write(store: Store): Promise<void> {
  const jar = await cookies();
  const payload = Buffer.from(JSON.stringify(narrow(store)), "utf8");
  if (payload.byteLength > 128 * 1024) {
    throw new Error("Demo storage is full. Shorten your entry or clear the demo on My Pass.");
  }
  const value = "z." + deflateSync(payload).toString("base64url");
  // Reserve room for the cookie name and attributes. Never silently lose a write.
  if (Buffer.byteLength(value) > 3800) {
    throw new Error("Demo storage is full. Shorten your entry or clear the demo on My Pass.");
  }
  jar.set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function mutate<T>(fn: (store: Store) => T): Promise<T> {
  const store = await read();
  const result = fn(store);
  await write(store);
  return result;
}

export async function reset(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
