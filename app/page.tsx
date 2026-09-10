import Link from "next/link";
import { read } from "@/lib/store";
import { BOARDING_STATUS, INTENT, type BoardingStatus } from "@/lib/types";
import { StatusPill, Flap, Kicker } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Landing() {
  const { passengers, me } = await read();
  const board = [...passengers].sort(
    (a, b) => BOARDING_STATUS[a.status].order - BOARDING_STATUS[b.status].order
  );

  return (
    <div className="stack-lg" style={{ paddingTop: 44 }}>
      <section className="center stack">
        <Kicker>Now boarding · All destinations</Kicker>
        <div style={{ margin: "10px 0 4px" }}>
          <Flap text="TERMINAL" />
        </div>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: "1.5rem", maxWidth: 620, margin: "0 auto" }}>
          Connection for the time you have.
        </h1>
        <p className="mute" style={{ maxWidth: 560, margin: "0 auto" }}>
          Company, romance and things to look forward to, through aging, illness
          and uncertainty. Start with what you want to do together.
        </p>
        <div className="row wrap" style={{ justifyContent: "center", marginTop: 18 }}>
          {me ? (
            <>
              <Link href="/gates" className="btn btn-primary btn-lg">
                Back to the gates
              </Link>
              <Link href="/profile" className="btn btn-lg">
                My boarding pass
              </Link>
            </>
          ) : (
            <Link href="/onboarding" className="btn btn-primary btn-lg">
              Check in →
            </Link>
          )}
        </div>
      </section>

      <section className="stack">
        <div className="row-between wrap">
          <Kicker>Departures · {board.length} fictional passengers</Kicker>
          <span className="mono small mute">
            {new Date().toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })}
          </span>
        </div>
        <div className="board">
          <div className="board-head">
            <span>Gate</span>
            <span>Passenger</span>
            <span>Status</span>
            <span>Seeking</span>
          </div>
          {board.map((p) => (
            <div key={p.id} className="board-row">
              <span className="board-gate">{p.gate}</span>
              <span>
                <span className="board-name">{p.name}</span>
                <br />
                <span className="board-city">
                  {p.age} · {p.city.toUpperCase()}
                </span>
              </span>
              <span>
                <StatusPill status={p.status} />
              </span>
              <span className="board-city">
                {p.intents.slice(0, 2).map((i) => INTENT[i].label).join(", ").toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="stack">
        <Kicker>Boarding status</Kicker>
        <p className="mute" style={{ maxWidth: 640 }}>
          Share where you are today, if you want to. Private and uncertain are
          welcome answers. No prognosis required; change your status any time.
        </p>
        <div className="grid-2">
          {(Object.keys(BOARDING_STATUS) as BoardingStatus[]).map((s) => (
            <div key={s} className="panel stack" style={{ gap: 10 }}>
              <StatusPill status={s} solid />
              <div style={{ fontWeight: 600 }}>{BOARDING_STATUS[s].plain}</div>
              <p className="mute small" style={{ margin: 0 }}>
                {BOARDING_STATUS[s].blurb}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid-3">
        <div className="panel stack">
          <div className="panel-head">Shared itineraries</div>
          <p className="mute small" style={{ margin: 0 }}>
            Match around shared wishes, from Sunday lunch and quiet coffee to
            adventures. Everyday moments belong on your itinerary too.
          </p>
        </div>
        <div className="panel stack">
          <div className="panel-head">Layovers · Plan a date</div>
          <p className="mute small" style={{ margin: 0 }}>
            Plans built around what two specific bodies can actually do — good
            days, bad weeks, wheelchairs, hospital wards. Nobody suggests a hike.
          </p>
        </div>
        <div className="panel stack">
          <div className="panel-head">Pre-flight check</div>
          <p className="mute small" style={{ margin: 0 }}>
            Optional health details and boundaries, in plain language. Leave any
            field blank when you would rather discuss it privately.
          </p>
        </div>
      </section>

      <section className="note">
        <strong>Terminal is a demo.</strong> The passengers are fictional and the
        conversations are scripted. The design questions underneath it — how to
        let someone state their runway without a medical form, how to plan a date
        around two people&apos;s energy, who gets called if a meeting goes wrong —
        guide the concept. No real meetings, emergency calls or contact notifications are arranged.
      </section>

      <p className="center mono small mute" style={{ paddingBottom: 40 }}>
        TERMINAL · ROOM FOR ORDINARY DAYS
      </p>
    </div>
  );
}
