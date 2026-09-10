import Link from "next/link";
import { redirect } from "next/navigation";
import { read } from "@/lib/store";
import { Avatar } from "@/components/avatar";
import { StatusPill, Kicker, Empty, timeAgo } from "@/components/ui";
import { compat } from "@/lib/match";

export const dynamic = "force-dynamic";

export default async function Matches() {
  const store = await read();
  if (!store.me) redirect("/onboarding");
  const me = store.me;

  const rows = store.matches
    .map((m) => {
      const them = store.passengers.find((p) => p.id === m.b)!;
      const msgs = store.messages.filter((x) => x.matchId === m.id);
      const last = msgs.at(-1);
      return { m, them, last, unread: !!last && last.from !== "me", c: compat(me, them) };
    })
    .filter((r) => r.them)
    .sort((a, b) => {
      const at = a.last?.at ?? a.m.at;
      const bt = b.last?.at ?? b.m.at;
      return bt.localeCompare(at);
    });

  const active = rows.filter((r) => !r.m.archived);
  const archived = rows.filter((r) => r.m.archived);
  const layovers = active.filter((r) => r.m.layover);

  return (
    <div className="narrow stack-lg" style={{ paddingTop: 26 }}>
      <Kicker>Boarded · {active.length} {active.length === 1 ? "connection" : "connections"}</Kicker>

      {layovers.length > 0 && (
        <section className="stack">
          <div className="panel-head">Layovers booked</div>
          {layovers.map(({ m, them }) => (
            <Link key={m.id} href={`/matches/${m.id}`} className="panel panel-tight row" style={{ gap: 14 }}>
              <Avatar seed={them.seed} name={them.name} size={44} />
              <div className="grow">
                <div style={{ fontWeight: 600 }}>{m.layover!.plan}</div>
                <div className="small mute">
                  {them.name.split(" ")[0]} · {m.layover!.when}
                </div>
              </div>
              <span className="mono small" style={{ color: "var(--amber)" }}>→</span>
            </Link>
          ))}
          {store.groundCrew?.shareLayovers && (
            <p className="small mute" style={{ margin: 0 }}>
              {store.groundCrew.name} has the details for all of these.
            </p>
          )}
        </section>
      )}

      {active.length === 0 ? (
        <Empty
          title="Nobody's boarded yet."
          body="Tickets go both ways here. Head back to the gates and hand a few out — people on this app are notably bad at playing hard to get."
        >
          <Link href="/gates" className="btn btn-primary" style={{ marginTop: 8 }}>
            Back to the gates
          </Link>
        </Empty>
      ) : (
        <section className="stack" style={{ gap: 12 }}>
          {active.map(({ m, them, last, unread, c }) => (
            <Link
              key={m.id}
              href={`/matches/${m.id}`}
              className="panel row"
              style={{ gap: 14, alignItems: "flex-start" }}
            >
              <Avatar seed={them.seed} name={them.name} size={56} />
              <div className="grow" style={{ minWidth: 0 }}>
                <div className="row-between" style={{ gap: 8 }}>
                  <strong>
                    {them.name}, {them.age}
                  </strong>
                  <span className="mono small mute">{timeAgo(last?.at ?? m.at)}</span>
                </div>
                <div className="row wrap" style={{ gap: 8, margin: "6px 0" }}>
                  <StatusPill status={them.status} />
                  {c.sharedItinerary.length > 0 && (
                    <span className="tag" data-hit="true">
                      ★ {c.sharedItinerary.length} shared
                    </span>
                  )}
                </div>
                <p
                  className="small"
                  style={{
                    margin: 0,
                    color: unread ? "var(--text)" : "var(--mute)",
                    fontWeight: unread ? 600 : 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {last ? `${last.from === "me" ? "You: " : ""}${last.body}` : "No messages yet."}
                </p>
              </div>
            </Link>
          ))}
        </section>
      )}

      {archived.length > 0 && (
        <section className="stack">
          <div className="panel-head">Departed · {archived.length}</div>
          <p className="small mute" style={{ marginTop: -6 }}>
            Archived conversations. Nothing is deleted here — people come back to
            these, and sometimes these are the only copy of a voice they have left.
          </p>
          {archived.map(({ m, them }) => (
            <Link key={m.id} href={`/matches/${m.id}`} className="panel panel-tight row" style={{ gap: 12, opacity: 0.65 }}>
              <Avatar seed={them.seed} name={them.name} size={38} />
              <span className="grow">{them.name}</span>
              <span className="mono small mute">{timeAgo(m.at)}</span>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
