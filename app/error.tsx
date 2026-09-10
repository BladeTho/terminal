"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="narrow panel stack" style={{ marginTop: 24 }}>
      <h1>That change could not be saved.</h1>
      <p>Your previous saved demo is still available. Browser cookie space is limited; try a shorter entry. If your demo is full, clear it on My Pass to start again.</p>
      <button className="btn btn-primary" onClick={reset}>Try again</button>
      <Link className="btn" href="/profile">Go to My Pass</Link>
    </section>
  );
}
