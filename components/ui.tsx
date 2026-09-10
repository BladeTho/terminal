import { BOARDING_STATUS, type BoardingStatus } from "@/lib/types";

export function StatusPill({
  status,
  solid = false,
  plain = false,
}: {
  status: BoardingStatus;
  solid?: boolean;
  plain?: boolean;
}) {
  const s = BOARDING_STATUS[status];
  return (
    <span
      className="pill"
      data-tone={s.tone}
      data-solid={solid}
      title={s.plain}
    >
      {s.label}
      {plain && <span style={{ opacity: 0.7, letterSpacing: 0, textTransform: "none" }}>— {s.plain}</span>}
    </span>
  );
}

/** Split-flap lettering for the hero and section headers. */
export function Flap({ text, size = "clamp(1.6rem, 8.4vw, 2.6rem)" }: { text: string; size?: string }) {
  return (
    <span className="flap" style={{ fontSize: size }} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span key={i} data-space={ch === " "} aria-hidden="true">
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return <div className="kicker">{children}</div>;
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <p className="field-hint">{hint}</p>}
    </label>
  );
}

export function Empty({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="empty stack">
      <h3 style={{ margin: 0 }}>{title}</h3>
      <p className="mute" style={{ margin: 0, maxWidth: 420, marginInline: "auto" }}>{body}</p>
      {children}
    </div>
  );
}

export function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Date-only strings ("2026-07-01") parse as UTC midnight, which lands on the
 * previous day — and sometimes the previous month — anywhere west of Greenwich.
 * Pin them to midday before formatting.
 */
export function monthYear(iso: string): string {
  const s = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00` : iso;
  return new Date(s).toLocaleDateString([], { month: "short", year: "numeric" });
}

/** Lowercase the first character only — lowercasing a whole sentence eats
 *  proper nouns, and half of these strings are weekdays. */
export function decap(s: string): string {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}
