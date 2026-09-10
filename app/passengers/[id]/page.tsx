import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { read } from "@/lib/store";
import { compat } from "@/lib/match";
import { PassengerCard } from "@/components/passenger-card";
import { ProfileActions } from "@/components/profile-actions";

export default async function PassengerProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await read();
  if (!store.me) redirect("/onboarding");
  const passenger = store.passengers.find(p => p.id === id);
  if (!passenger) notFound();
  const match = store.matches.find(m => m.b === id);
  const choice = store.swipes.find(s => s.from === "me" && s.to === id);
  return (
    <div className="narrow stack profile-page">
      <Link href="/gates" className="btn btn-sm btn-ghost">← Discover</Link>
      <PassengerCard p={passenger} c={compat(store.me, passenger)} />
      {match ? (
        <Link href={`/matches/${match.id}`} className="btn btn-primary btn-block">Open conversation →</Link>
      ) : choice ? (
        <div className="note">{choice.direction === "TICKET" ? "You liked this passenger. No match this time." : "You passed on this passenger."} <Link href="/gates">Keep discovering →</Link></div>
      ) : <ProfileActions passengerId={id} />}
    </div>
  );
}
