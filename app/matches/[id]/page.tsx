import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { read } from "@/lib/store";
import { archiveMatch } from "@/lib/actions";
import { compat, icebreakers, layoverIdeas, MEETING_COPY } from "@/lib/match";
import { PassengerCard } from "@/components/passenger-card";
import { Composer, ScrollToEnd } from "@/components/chat";
import { LayoverPlanner } from "@/components/layover";
import { Avatar } from "@/components/avatar";
import { StatusPill, clockTime, decap } from "@/components/ui";
import { MOBILITY } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Thread({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = read();
  if (!store.me) redirect("/onboarding");
  const me = store.me;

  const match = store.matches.find((m) => m.id === id);
  if (!match) notFound();
  const them = store.passengers.find((p) => p.id === match.b);
  if (!them) notFound();

  const msgs = store.messages
    .filter((m) => m.matchId === id)
    .sort((a, b) => a.at.localeCompare(b.at));
  const c = compat(me, them);
  const hasSpoken = msgs.some((m) => m.from === "me");
  const first = them.name.split(" ")[0];

  return (
    <div className="narrow stack" style={{ paddingTop: 20 }}>
      <Link href="/matches" className="mono small mute">
        ← Boarded
      </Link>

      <div className="panel row" style={{ gap: 14, alignItems: "flex-start" }}>
        <Avatar seed={them.seed} name={them.name} size={54} />
        <div className="grow">
          <div className="row-between wrap" style={{ gap: 8 }}>
            <strong style={{ fontSize: "1.1rem" }}>
              {them.name}, {them.age}
            </strong>
            <StatusPill status={them.status} />
          </div>
          <div className="small mute" style={{ marginTop: 4 }}>
            {MOBILITY[them.mobility].label} · {c.miles} miles · best {decap(them.goodDays)}
          </div>
        </div>
      </div>

      {them.preflight.immunocompromised && (
        <div className="note note-red small">
          <strong>{first} is immunocompromised.</strong> If you&apos;re unwell —
          even mildly — say so and move to the phone. This is the single most
          useful thing you can do for them.
        </div>
      )}

      {them.status === "FINAL_CALL" && (
        <div className="note small">
          <strong>Final Call.</strong> {first} may not reply quickly, or at all,
          and it very likely won&apos;t be about you. If you say you&apos;ll
          visit, visit. If you can&apos;t keep it up, say that instead — it&apos;s
          the kinder message and everyone here knows it.
        </div>
      )}

      <div className="thread">
        {msgs.map((m) => (
          <div key={m.id} className="bubble" data-mine={m.from === "me"}>
            {m.body}
            <div className="bubble-time">{clockTime(m.at)}</div>
          </div>
        ))}
        <ScrollToEnd />
      </div>

      <Composer matchId={id} openers={icebreakers(me, them)} hasSpoken={hasSpoken} />

      <LayoverPlanner
        matchId={id}
        ideas={layoverIdeas(me, them)}
        existing={match.layover}
        crewName={store.groundCrew?.shareLayovers ? store.groundCrew.name : null}
        meetingBlurb={MEETING_COPY[c.mode].blurb}
      />

      <details className="panel">
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>
          {first}&apos;s boarding pass
        </summary>
        <div style={{ marginTop: 16 }}>
          <PassengerCard p={them} c={c} />
        </div>
      </details>

      <form action={archiveMatch.bind(null, id)}>
        <button className="btn btn-sm btn-danger btn-block">
          {match.archived ? "Bring this back" : "Archive this conversation"}
        </button>
      </form>
      <p className="small mute center">
        Archiving keeps everything. Nothing on Terminal is ever deleted by us.
      </p>
    </div>
  );
}
