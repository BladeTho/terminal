import Link from "next/link";
import { redirect } from "next/navigation";
import { read } from "@/lib/store";
import { LOUNGE_ROOMS } from "@/lib/types";
import { Kicker, timeAgo } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Lounge() {
  const store = await read();
  if (!store.me) redirect("/onboarding");

  return (
    <div className="narrow stack-lg" style={{ paddingTop: 26 }}>
      <div className="stack">
        <Kicker>The Lounge</Kicker>
        <p className="mute" style={{ margin: 0 }}>
          Not everyone here wants to date. Some people just want to be in a room
          with others who already understand the situation and don&apos;t need it
          explained.
        </p>
      </div>

      <section className="stack" style={{ gap: 12 }}>
        {LOUNGE_ROOMS.map((room) => {
          const posts = store.lounge.filter((p) => p.room === room.id);
          const latest = posts[0];
          return (
            <Link key={room.id} href={`/lounge/${room.id}`} className="panel stack" style={{ gap: 8 }}>
              <div className="row-between wrap" style={{ gap: 8 }}>
                <strong style={{ fontSize: "1.08rem" }}>{room.name}</strong>
                <span className="mono small mute">
                  {posts.length} {posts.length === 1 ? "post" : "posts"}
                  {latest && ` · ${timeAgo(latest.at)}`}
                </span>
              </div>
              <div className="mute small">{room.blurb}</div>
              {latest && (
                <p
                  className="small"
                  style={{
                    margin: 0,
                    color: "var(--mute)",
                    borderLeft: "2px solid var(--line)",
                    paddingLeft: 12,
                  }}
                >
                  {latest.body.slice(0, 130)}
                  {latest.body.length > 130 && "…"}
                </p>
              )}
            </Link>
          );
        })}
      </section>
    </div>
  );
}
