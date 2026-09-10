import { redirect } from "next/navigation";
import Link from "next/link";
import { read } from "@/lib/store";
import { rankDeck } from "@/lib/match";
import { Deck } from "@/components/deck";
import { Kicker } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Gates() {
  const store = await read();
  if (!store.me) redirect("/onboarding");

  const seen = new Set(store.swipes.filter((s) => s.from === "me").map((s) => s.to));
  const cards = rankDeck(store.me, store.passengers, {
    statusFilter: store.settings.statusFilter,
    maxDistance: store.settings.maxDistance,
    seen,
  });

  // Low Spoons Mode: three people, then we stop. Endless decks are designed to
  // exhaust you, and this is not a population with energy to spare.
  const limited = store.settings.lowSpoons ? cards.slice(0, 3) : cards;

  return (
    <div className="narrow stack-lg discovery-page">
      <div className="row-between wrap">
        <div><Kicker>At the gates</Kicker><h1 style={{ margin: "4px 0 0" }}>Discover</h1></div>
        <Link href="/profile" className="mono small mute">
          within {store.settings.maxDistance} mi ↗
        </Link>
      </div>

      {store.settings.lowSpoons && cards.length > 3 && (
        <div className="note">
          Low Spoons Mode is on. We&apos;re showing you three people, then
          we&apos;ll stop. Nothing here is going to nag you to come back.
        </div>
      )}

      <Deck cards={limited} canUndo={store.swipes.some(s => s.from === "me")} />
    </div>
  );
}
