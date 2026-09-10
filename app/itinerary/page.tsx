import { redirect } from "next/navigation";
import Link from "next/link";
import { read } from "@/lib/store";
import { addItineraryItem, removeItineraryItem, adoptItineraryItem } from "@/lib/actions";
import { Avatar } from "@/components/avatar";
import { Kicker, StatusPill, Empty } from "@/components/ui";
import { milesBetween } from "@/lib/match";

export const dynamic = "force-dynamic";

export default async function Itinerary() {
  const store = await read();
  if (!store.me) redirect("/onboarding");
  const me = store.me;

  const inRange = store.passengers.filter(
    (p) => milesBetween(me.city, p.city) <= store.settings.maxDistance
  );

  // Who else wants each thing on your list.
  const companions = me.itinerary.map((item) => ({
    item,
    people: inRange.filter((p) => p.itinerary.includes(item)),
  }));

  // Things other people want that you haven't claimed. Ranked by how many.
  const counts = new Map<string, number>();
  for (const p of inRange)
    for (const i of p.itinerary)
      if (!me.itinerary.includes(i)) counts.set(i, (counts.get(i) ?? 0) + 1);
  const popular = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  const matchedIds = new Set(store.matches.map((m) => m.b));

  return (
    <div className="narrow stack-lg" style={{ paddingTop: 26 }}>
      <div className="stack">
        <Kicker>Your itinerary · {me.itinerary.length} destinations</Kicker>
        <p className="mute" style={{ margin: 0 }}>
          What you still want to do. It&apos;s the main thing we match on, and
          it&apos;s the only part of a profile on here that has ever made anyone
          cry in a good way.
        </p>
      </div>

      <form action={addItineraryItem} className="row">
        <input
          name="item"
          className="input"
          placeholder="Add something you still want to do…"
          aria-label="New itinerary item"
          required
        />
        <button className="btn btn-primary">Add</button>
      </form>

      {me.itinerary.length === 0 ? (
        <Empty
          title="Nothing on the list yet."
          body="Even one thing helps. It doesn't have to be skydiving — the most-matched item on Terminal this month is 'sit outside at night when it's warm'."
        />
      ) : (
        <section className="stack" style={{ gap: 12 }}>
          {companions.map(({ item, people }) => (
            <div key={item} className="panel stack" style={{ gap: 12 }}>
              <div className="row-between wrap" style={{ gap: 10 }}>
                <strong style={{ fontSize: "1.05rem" }}>{item}</strong>
                <form action={removeItineraryItem.bind(null, item)}>
                  <button className="btn btn-sm btn-ghost mute" aria-label={`Remove ${item}`}>
                    Remove
                  </button>
                </form>
              </div>

              {people.length === 0 ? (
                <p className="small mute" style={{ margin: 0 }}>
                  Nobody nearby has this one. That&apos;s not nothing — it means
                  whoever you tell about it will be hearing it for the first time.
                </p>
              ) : (
                <>
                  <div className="small mute">
                    {people.length} {people.length === 1 ? "person wants" : "people want"} this too
                  </div>
                  <div className="stack" style={{ gap: 8 }}>
                    {people.map((p) => (
                      <div key={p.id} className="row wrap" style={{ gap: 12 }}>
                        <Avatar seed={p.seed} name={p.name} size={36} />
                        <Link href={`/passengers/${p.id}`} className="grow profile-name">
                          {p.name} ↗
                          <span className="mute small"> · {p.city.split(",")[0]}</span>
                        </Link>
                        {matchedIds.has(p.id) && (
                          <Link href="/matches" className="mono small" style={{ color: "var(--amber)" }}>
                            boarded ↗
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </section>
      )}

      {popular.length > 0 && (
        <section className="stack">
          <div className="panel-head">Popular departures nearby</div>
          <p className="small mute" style={{ marginTop: -8 }}>
            Things other people near you are still hoping to do. Tap to put one on your list.
          </p>
          <div className="row wrap" style={{ gap: 8 }}>
            {popular.map(([item, n]) => (
              <form key={item} action={adoptItineraryItem.bind(null, item)}>
                <button className="tag" style={{ cursor: "pointer" }}>
                  + {item} <span className="mono" style={{ opacity: 0.6 }}>({n})</span>
                </button>
              </form>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
