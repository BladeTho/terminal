"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { swipe, undoLastSwipe } from "@/lib/actions";
import { Avatar } from "@/components/avatar";
import { Empty } from "@/components/ui";
import { INTENT, type Passenger } from "@/lib/types";
import type { Compat } from "@/lib/match";

type Card = { passenger: Passenger; compat: Compat };

export function Deck({ cards, canUndo }: { cards: Card[]; canUndo: boolean }) {
  const [matched, setMatched] = useState<Passenger | null>(null);
  const [pending, start] = useTransition();
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState("");
  const origin = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  // Server actions revalidate this list. A second client-side index skips people.
  const card = cards[0];

  const act = (direction: "TICKET" | "PASS") => {
    if (!card || pending) return;
    const p = card.passenger;
    setError("");
    start(async () => {
      try {
        const isMatch = await swipe(p.id, direction);
        if (isMatch) setMatched(p);
      } catch {
        setError("Couldn’t save that choice. Please try again. If demo storage is full, clear it on My Pass.");
      } finally { setOffset(0); }
    });
  };

  const undo = () => {
    setError("");
    start(async () => {
      try { await undoLastSwipe(); setMatched(null); }
      catch { setError("Couldn’t undo that choice. Please try again."); }
    });
  };

  if (matched) {
    return (
      <div className="match-celebration stack center" aria-live="polite">
        <div className="kicker">It’s a match</div>
        <Avatar seed={matched.seed} name={matched.name} size={160} />
        <h1>You and {matched.name.split(" ")[0]}.</h1>
        <p className="mute">You both liked each other. A scripted hello is waiting in your messages.</p>
        <Link href="/matches" className="btn btn-primary btn-block">Start chatting →</Link>
        <button className="btn btn-ghost btn-block" onClick={() => setMatched(null)}>Keep discovering</button>
      </div>
    );
  }

  if (!card) {
    return (
      <Empty title="You’re all caught up." body="You’ve seen the fictional passengers available with these filters. Adjust your preferences or undo your last choice.">
        <div className="row wrap" style={{ justifyContent: "center" }}>
          <Link href="/profile" className="btn">Adjust filters</Link>
          <button className="btn btn-ghost" disabled={pending || !canUndo} onClick={undo}>↶ Undo</button>
        </div>
        {error && <p role="alert">{error}</p>}
      </Empty>
    );
  }

  const { passenger: p, compat: c } = card;
  const wish = c.sharedItinerary[0] ?? p.itinerary[0];
  return (
    <div className="deck">
      <div className="row-between deck-toolbar">
        <span className="small mute">{cards.length} people to discover</span>
        <button className="btn btn-sm btn-ghost" onClick={undo} disabled={pending || !canUndo}>↶ Undo</button>
      </div>
      <div className="swipe-stage">
        <Link
          key={p.id}
          href={`/passengers/${p.id}`}
          className="discovery-card"
          aria-label={`View ${p.name}’s profile`}
          draggable={false}
          style={{ transform: `translateX(${offset}px) rotate(${offset / 24}deg)`, opacity: pending ? 0.6 : 1 }}
          onDragStart={e => e.preventDefault()}
          onPointerDown={e => {
            if (pending || !e.isPrimary || e.button !== 0) return;
            origin.current = { x: e.clientX, y: e.clientY };
            dragged.current = false;
          }}
          onPointerMove={e => {
            if (!origin.current || pending) return;
            const dx = e.clientX - origin.current.x;
            const dy = e.clientY - origin.current.y;
            if (!dragged.current && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
              origin.current = null;
              return;
            }
            if (Math.abs(dx) > 10) {
              dragged.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              setOffset(Math.max(-140, Math.min(140, dx)));
            }
          }}
          onPointerUp={e => {
            if (!origin.current) return;
            const dx = e.clientX - origin.current.x;
            origin.current = null;
            if (Math.abs(dx) >= 80 && dragged.current) act(dx > 0 ? "TICKET" : "PASS");
            else setOffset(0);
          }}
          onPointerCancel={() => { origin.current = null; setOffset(0); }}
          onClick={e => {
            if (dragged.current || pending) e.preventDefault();
            dragged.current = false;
          }}
        >
          <div className="discovery-portrait" style={{ background: `radial-gradient(ellipse at 50% 35%, hsl(${p.seed * 47 % 360} 25% 30%), var(--ink-1))` }}>
            <span className="portrait-caption mono">Gate {p.gate} · Fictional passenger</span>
            <Avatar seed={p.seed} name={p.name} size={230} />
            {Math.abs(offset) > 25 && <span className="swipe-stamp" data-like={offset > 0}>{offset > 0 ? "LIKE ♥" : "PASS"}</span>}
            <div className="discovery-identity">
              <h2>{p.name}, <span>{p.age}</span></h2>
              <p>{p.city.split(",")[0]} · {c.miles} miles away</p>
            </div>
          </div>
          <div className="discovery-copy">
            <p className="discovery-intent">{p.intents.slice(0, 2).map(i => INTENT[i].label).join(" · ")}</p>
            <p className="discovery-bio">{p.bio || p.lastWords}</p>
            {wish && <div className="discovery-wish"><span>{c.sharedItinerary.length ? "On both your lists" : "Let’s do this"}</span><p>{wish}</p></div>}
            <span className="profile-invitation">View full profile <span aria-hidden="true">↗</span></span>
          </div>
        </Link>
      </div>
      <div className="deck-actions">
        <button className="btn btn-lg pass-action" onClick={() => act("PASS")} disabled={pending}><span aria-hidden="true">×</span> Pass</button>
        <button className="btn btn-primary btn-lg" onClick={() => act("TICKET")} disabled={pending}><span aria-hidden="true">♥</span> Like</button>
      </div>
      <p className="center small mute swipe-hint">Swipe left to pass, right to like. Tap the card to meet them.</p>
      {error && <p className="note small" role="alert">{error}</p>}
    </div>
  );
}
