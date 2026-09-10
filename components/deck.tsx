"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { swipe, undoLastSwipe } from "@/lib/actions";
import { PassengerCard } from "@/components/passenger-card";
import { Avatar } from "@/components/avatar";
import { Empty } from "@/components/ui";
import type { Passenger } from "@/lib/types";
import type { Compat } from "@/lib/match";

type Card = { passenger: Passenger; compat: Compat };

export function Deck({ cards }: { cards: Card[] }) {
  const [i, setI] = useState(0);
  const [matched, setMatched] = useState<Passenger | null>(null);
  const [pending, start] = useTransition();

  const card = cards[i];

  const act = (direction: "TICKET" | "PASS") => {
    if (!card || pending) return;
    const p = card.passenger;
    start(async () => {
      const isMatch = await swipe(p.id, direction);
      if (isMatch) setMatched(p);
      setI((n) => n + 1);
    });
  };

  if (matched) {
    return (
      <div className="stack-lg center" style={{ paddingTop: 40 }}>
        <div className="kicker">Both ticketed · You&apos;re on the same flight</div>
        <Avatar seed={matched.seed} name={matched.name} size={120} />
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400 }}>
          {matched.name.split(" ")[0]} ticketed you back.
        </h1>
        <p className="mute" style={{ maxWidth: 460, margin: "0 auto" }}>
          They&apos;ve already said something. On this app people tend to answer
          quickly — there&apos;s not a lot of appetite for playing it cool.
        </p>
        <div className="row wrap" style={{ justifyContent: "center" }}>
          <Link href="/matches" className="btn btn-primary btn-lg">
            Go and read it →
          </Link>
          <button className="btn btn-lg" onClick={() => setMatched(null)}>
            Keep looking
          </button>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <Empty
        title="That's everyone at this gate."
        body="You've seen every passenger who matches your filters. Widen the distance or open up your boarding-status filter in My Pass, or come back tomorrow — new people check in every day, and some of them are in a hurry."
      >
        <div className="row" style={{ justifyContent: "center", marginTop: 8 }}>
          <Link href="/profile" className="btn">
            Adjust filters
          </Link>
          <form action={undoLastSwipe}>
            <button className="btn btn-ghost">Undo my last one</button>
          </form>
        </div>
      </Empty>
    );
  }

  return (
    <div className="deck stack">
      <div className="row-between">
        <span className="kicker">
          {cards.length - i} left at this gate
        </span>
        <form action={undoLastSwipe}>
          <button className="btn btn-sm btn-ghost">↺ Undo</button>
        </form>
      </div>

      <div style={{ opacity: pending ? 0.45 : 1, transition: "opacity .15s" }}>
        <PassengerCard p={card.passenger} c={card.compat} />
      </div>

      <div className="deck-actions">
        <button className="btn btn-lg" onClick={() => act("PASS")} disabled={pending}>
          Not this one
        </button>
        <button className="btn btn-primary btn-lg" onClick={() => act("TICKET")} disabled={pending}>
          Ticket ★
        </button>
      </div>
      <p className="center small mute" style={{ margin: 0 }}>
        A ticket says you&apos;d like to talk. It doesn&apos;t say anything else.
      </p>
    </div>
  );
}
