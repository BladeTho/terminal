"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { swipe } from "@/lib/actions";

export function ProfileActions({ passengerId }: { passengerId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const choose = (direction: "TICKET" | "PASS") => start(async () => {
    setError("");
    try {
      const matched = await swipe(passengerId, direction);
      router.push(matched ? "/matches" : "/gates");
    } catch { setError("Couldn’t save your choice. Please try again."); }
  });
  return <div className="profile-actions">
    <div className="deck-actions">
      <button className="btn btn-lg" disabled={pending} onClick={() => choose("PASS")}>× Pass</button>
      <button className="btn btn-primary btn-lg" disabled={pending} onClick={() => choose("TICKET")}>♥ Like</button>
    </div>
    {error && <p role="alert">{error}</p>}
  </div>;
}
