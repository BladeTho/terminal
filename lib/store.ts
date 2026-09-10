import fs from "node:fs";
import path from "node:path";
import type { Store, Settings } from "./types";
import { PASSENGERS, LOUNGE_SEED } from "./seed";

/**
 * File-backed store. No database to install, no migrations, survives restarts.
 * Every read/write goes through here, so swapping in Prisma later means
 * rewriting this one file and nothing else.
 */

const FILE = path.join(process.cwd(), "data", "store.json");

const DEFAULT_SETTINGS: Settings = {
  largeType: true,
  highContrast: false,
  lowSpoons: false,
  statusFilter: ["ON_TIME", "DELAYED", "STANDBY", "BOARDING", "FINAL_CALL"],
  maxDistance: 60,
};

function blank(): Store {
  return {
    me: null,
    groundCrew: null,
    settings: DEFAULT_SETTINGS,
    passengers: PASSENGERS,
    swipes: [],
    matches: [],
    messages: [],
    lounge: LOUNGE_SEED,
  };
}

export function read(): Store {
  try {
    const raw = fs.readFileSync(FILE, "utf8");
    const parsed = JSON.parse(raw) as Store;
    // Seed data is code, not data — always take the latest cast from seed.ts
    // so editing a passenger's bio doesn't require wiping the store.
    parsed.passengers = PASSENGERS;
    parsed.settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
    return parsed;
  } catch {
    const fresh = blank();
    write(fresh);
    return fresh;
  }
}

export function write(store: Store): void {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(store, null, 2), "utf8");
}

export function mutate<T>(fn: (store: Store) => T): T {
  const store = read();
  const result = fn(store);
  write(store);
  return result;
}

export function reset(): void {
  write(blank());
}

export const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
