import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { read } from "@/lib/store";
import { Flap, Kicker } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Landing() {
  const { passengers, me } = await read();
  if (me) redirect("/gates");
  return (
    <div className="stack-lg landing" style={{ paddingTop: 36 }}>
      <section className="center stack">
        <Kicker>A little company. A new possibility.</Kicker>
        <Flap text="TERMINAL" />
        <h1 className="landing-title">Connection for the time you have.</h1>
        <p className="mute" style={{ maxWidth: 510, marginInline: "auto" }}>Romance, quiet coffee, someone to look forward to. Meet people through aging, illness and uncertainty, at your own pace.</p>
        <Link href="/onboarding" className="btn btn-primary btn-lg">Meet someone →</Link>
      </section>
      <section className="landing-people" aria-label="A few fictional passengers">
        {passengers.slice(0, 3).map(p => (
          <Link href="/onboarding" key={p.id} className="panel landing-person">
            <Avatar seed={p.seed} name={p.name} size={110} />
            <h2>{p.name.split(" ")[0]}, {p.age}</h2>
            <p className="small mute">{p.city.split(",")[0]}</p>
            <p className="small">{p.itinerary[0]}</p>
          </Link>
        ))}
      </section>
      <section className="grid-3">
        <div className="panel"><h3>Find a spark</h3><p className="small mute">Swipe or tap to like. Open a profile when you want to know more.</p></div>
        <div className="panel"><h3>Start with a shared wish</h3><p className="small mute">Sunday lunch matters as much as a big adventure. Let your list start the conversation.</p></div>
        <div className="panel"><h3>Make a small plan</h3><p className="small mute">A date that fits both your lives, energy and access needs. Changing plans is okay.</p></div>
      </section>
      <p className="center small mute">No prognosis required. You choose what to share.</p>
    </div>
  );
}
