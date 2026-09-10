import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { read } from "@/lib/store";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Terminal — a dating app for the last chapter",
  description:
    "Company, romance and honest conversation for people who are old, ill, or out of time. Departures only.",
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

        <main className="shell">{children}</main>

        {me && <Nav unread={unread} />}
      </body>
    </html>
  );
}
