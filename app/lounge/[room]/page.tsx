import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { read } from "@/lib/store";
import { LOUNGE_ROOMS } from "@/lib/types";
import { postToLounge, heartPost } from "@/lib/actions";
import { Avatar } from "@/components/avatar";
import { StatusPill, Kicker, timeAgo } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Room({ params }: { params: Promise<{ room: string }> }) {
  const { room: roomId } = await params;
  const room = LOUNGE_ROOMS.find((r) => r.id === roomId);
  if (!room) notFound();

  const store = await read();
  if (!store.me) redirect("/onboarding");
  const me = store.me;

  const posts = store.lounge
    .filter((p) => p.room === roomId)
    .sort((a, b) => b.at.localeCompare(a.at));

  const author = (id: string) =>
    id === "me" ? me : store.passengers.find((p) => p.id === id);

  return (
    <div className="narrow stack-lg" style={{ paddingTop: 20 }}>
      <Link href="/lounge" className="mono small mute">
        ← The Lounge
      </Link>

      <div className="stack">
        <Kicker>{room.name}</Kicker>
        <p className="mute" style={{ margin: 0 }}>{room.blurb}</p>
      </div>

      <form action={postToLounge.bind(null, roomId)} className="stack">
        <textarea
          name="body"
          className="textarea"
          style={{ minHeight: 92 }}
          placeholder="Say your piece…"
          aria-label="New post"
          required
        />
        <button className="btn btn-primary">Post to {room.name}</button>
      </form>

      <section className="stack" style={{ gap: 14 }}>
        {posts.map((post) => {
          const a = author(post.author);
          if (!a) return null;
          return (
            <article key={post.id} className="panel stack" style={{ gap: 10 }}>
              <div className="row" style={{ gap: 12 }}>
                <Avatar seed={a.seed} name={a.name} size={40} />
                <div className="grow">
                  <div className="row wrap" style={{ gap: 8 }}>
                    <strong>{post.author === "me" ? "You" : a.name}</strong>
                    <StatusPill status={a.status} />
                  </div>
                  <div className="mono small mute">
                    {a.age} · {a.city.split(",")[0]} · {timeAgo(post.at)}
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, lineHeight: 1.55 }}>{post.body}</p>
              <form action={heartPost.bind(null, post.id, roomId)}>
                <button className="btn btn-sm btn-ghost">♡ {post.hearts}</button>
              </form>
            </article>
          );
        })}
      </section>
    </div>
  );
}
