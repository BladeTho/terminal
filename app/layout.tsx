import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { read } from "@/lib/store";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Terminal — connection for the time you have",
  description:
    "Company, romance and shared wishes, at your own pace. An interactive dating-app demo.",
};

export const viewport: Viewport = {
  themeColor: "#0e0e0c",
  width: "device-width",
  initialScale: 1,
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await read();
  const { settings, me } = store;
  const unread = store.matches.filter((m) => {
    if (m.archived) return false;
    const last = store.messages.filter((x) => x.matchId === m.id).at(-1);
    return last && last.from !== "me";
  }).length;

  return (
    <html
      lang="en"
      data-largetype={String(settings.largeType)}
      data-contrast={String(settings.highContrast)}
      data-spoons={String(settings.lowSpoons)}
    >
      <body>
        <header className="topbar">
          <div className="topbar-inner">
            <Link href={me ? "/gates" : "/"} className="brand">
              <span className="brand-dot" />
              Terminal
            </Link>
            <div className="grow" />
            {me ? (
              <span className="mono small mute hide-sm">
                GATE {me.gate} · {me.city.toUpperCase()}
              </span>
            ) : (
              <span className="mono small mute hide-sm">DEPARTURES</span>
            )}
          </div>
        </header>

        <main className="shell">
          {me ? (
            <details className="demo-disclosure">
              <summary>Demo · Fictional people, scripted chats</summary>
              <p>Use fictional personal and health details. Each visitor’s demo is separate; lounge posts are not shared. Clear your demo on My Pass.</p>
            </details>
          ) : (
          <p className="note small" style={{ marginTop: 20 }}>
            <strong>Interactive demo.</strong> All 16 passengers are fictional;
            matches are simulated and replies are scripted. Use fictional personal
            and health details. Your demo stays in this browser; lounge posts are
            not shared with other visitors. Clear it any time on My Pass.
          </p>
          )}
          {children}
        </main>

        {me && <Nav unread={unread} />}
      </body>
    </html>
  );
}
