import Link from "next/link";
import { read } from "@/lib/store";
import { BOARDING_STATUS, INTENT, type BoardingStatus } from "@/lib/types";
import { StatusPill, Flap, Kicker } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function Landing() {
  const { passengers, me } = read();
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
          A dating app for people who are old, ill, or out of time.
        </h1>
        <p className="mute" style={{ maxWidth: 560, margin: "0 auto" }}>
          Everyone here knows roughly how the story ends. That turns out to remove
          most of the nonsense from dating and almost none of the point of it.
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
          <Kicker>Departures · {board.length} passengers in your area</Kicker>
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
          Every other dating app asks you to be aspirational. This one asks you to
          be accurate. One field, five options, nobody has to prove anything —
          and everyone gets to decide for themselves what they can carry today.
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
            You match on what you both still want to do, not on whether you both
            like dogs. A bucket list is the most honest compatibility signal
            anyone has ever built a dating app on.
          </p>
        </div>
        <div className="panel stack">
          <div className="panel-head">Layovers, not dates</div>
          <p className="mute small" style={{ margin: 0 }}>
            Plans built around what two specific bodies can actually do — good
            days, bad weeks, wheelchairs, hospital wards. Nobody suggests a hike.
          </p>
        </div>
        <div className="panel stack">
          <div className="panel-head">Pre-flight check</div>
          <p className="mute small" style={{ margin: 0 }}>
            Testing status and immune risk stated plainly on the pass. There is a
            widespread idea that this stops mattering at seventy. The only thing
            that stops mattering is pregnancy.
          </p>
        </div>
      </section>

      <section className="note">
        <strong>Terminal is a demo.</strong> The passengers are fictional and the
        conversations are scripted. The design questions underneath it — how to
        let someone state their runway without a medical form, how to plan a date
        around two people&apos;s energy, who gets called if a meeting goes wrong —
        are the real work, and those are all implemented.
      </section>

      <p className="center mono small mute" style={{ paddingBottom: 40 }}>
        TERMINAL · EVERY FLIGHT HAS A DEPARTURE TIME · WE JUST PUT IT ON THE BOARD
      </p>
    </div>
  );
}
