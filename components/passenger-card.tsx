import { Avatar } from "@/components/avatar";
import { StatusPill, monthYear } from "@/components/ui";
import { BOARDING_STATUS, MOBILITY, INTENT, type Passenger } from "@/lib/types";
import { MEETING_COPY, type Compat } from "@/lib/match";

export function PassengerCard({
  p,
  c,
  compact = false,
}: {
  p: Passenger;
  c?: Compat;
  compact?: boolean;
}) {
  const shared = new Set(c?.sharedItinerary ?? []);
  const tested = p.preflight.lastTested ? monthYear(p.preflight.lastTested) : null;

  return (
    <article className="pass">
      <div className="pass-head">
        <span>
          Gate {p.gate} · {p.city.split(",")[0]}
        </span>
        <span>{p.id === "me" ? "Your demo pass" : "Fictional passenger"}</span>
      </div>

      <div className="pass-body stack">
        <div className="row" style={{ gap: 16, alignItems: "flex-start" }}>
          <Avatar seed={p.seed} name={p.name} size={78} />
          <div className="grow">
            <h2 style={{ marginBottom: 2 }}>
              {p.name}, {p.age}
            </h2>
            <div className="mute small" style={{ marginBottom: 9 }}>
              {p.pronouns} · {p.city}
              {c ? ` · ${c.miles} miles away` : ""}
            </div>
            <StatusPill status={p.status} solid />
          </div>
        </div>

        {p.lastWords && (
          <blockquote
            style={{
              margin: 0,
              padding: "14px 18px",
              borderLeft: "3px solid var(--on-paper)",
              background: "var(--paper-2)",
              fontFamily: "var(--serif)",
              fontSize: "1.06rem",
              lineHeight: 1.5,
            }}
          >
            “{p.lastWords}”
          </blockquote>
        )}

        {p.runway && (
          <div>
            <div className="pass-label">Runway, their words</div>
            <div>{p.runway}</div>
          </div>
        )}

        {!compact && p.bio && (
          <div>
            <div className="pass-label">About</div>
            <p style={{ margin: 0 }}>{p.bio}</p>
          </div>
        )}

        <div>
          <div className="pass-label">Itinerary {shared.size > 0 && `· ${shared.size} shared with you`}</div>
          <div className="row wrap" style={{ gap: 7 }}>
            {p.itinerary.map((i) => (
              <span
                key={i}
                className="tag tag-paper"
                style={
                  shared.has(i)
                    ? {
                        background: "var(--on-paper)",
                        color: "var(--paper)",
                        borderColor: "var(--on-paper)",
                        fontWeight: 600,
                      }
                    : undefined
                }
              >
                {shared.has(i) && "★ "}
                {i}
              </span>
            ))}
          </div>
        </div>

        <div className="grid-2" style={{ gap: 14 }}>
          <div>
            <div className="pass-label">Here for</div>
            <div className="pass-value">{p.intents.map((i) => INTENT[i].label).join(" · ")}</div>
          </div>
          <div>
            <div className="pass-label">Getting about</div>
            <div className="pass-value">{MOBILITY[p.mobility].label}</div>
          </div>
          <div>
            <div className="pass-label">Good days</div>
            <div className="pass-value">{p.goodDays}</div>
          </div>
          {p.greenFlags.length > 0 && (
            <div>
              <div className="pass-label">Green flags</div>
              <div className="pass-value">{p.greenFlags.join(" · ")}</div>
            </div>
          )}
        </div>

        {!compact && (
          <div
            style={{
              border: "1px solid var(--paper-3)",
              borderRadius: 4,
              padding: "14px 16px",
              background: "var(--paper-2)",
            }}
          >
            <div className="pass-label">Pre-flight check</div>
            <div className="row wrap" style={{ gap: 8, marginBottom: 10 }}>
              <span className="tag tag-paper">
                {tested ? `Last tested ${tested}` : "Testing not stated"}
              </span>
              {p.preflight.immunocompromised && (
                <span className="tag tag-paper" style={{ borderColor: "#a33", color: "#8a2020" }}>
                  Immunocompromised
                </span>
              )}
              <span className="tag tag-paper">
                {p.preflight.vaccinesCurrent ? "Vaccinations current" : "Vaccinations not stated"}
              </span>
              {p.preflight.disclosures.map((d) => (
                <span key={d} className="tag tag-paper">
                  {d}
                </span>
              ))}
            </div>
            {p.preflight.note && (
              <p className="small" style={{ margin: 0, color: "var(--on-paper-mute)" }}>
                “{p.preflight.note}”
              </p>
            )}
          </div>
        )}
      </div>

      {c && (
        <>
          <div className="pass-perf" />
          <div className="pass-stub stack" style={{ gap: 10 }}>
            <div className="row-between wrap">
              <div className="pass-label" style={{ margin: 0 }}>
                Why you two
              </div>
              <span className="mono small" style={{ color: "var(--on-paper-mute)" }}>
                {MEETING_COPY[c.mode].label.toUpperCase()}
              </span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {c.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
              {c.reasons.length === 0 && <li>Nothing obvious in common. Sometimes that&apos;s the good ones.</li>}
            </ul>
            {c.caveats.length > 0 && (
              <div style={{ borderTop: "1px solid var(--paper-3)", paddingTop: 10 }}>
                <div className="pass-label">Worth knowing</div>
                <ul style={{ margin: 0, paddingLeft: 18, color: "var(--on-paper-mute)" }}>
                  {c.caveats.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </article>
  );
}

export function statusBlurb(p: Passenger) {
  return BOARDING_STATUS[p.status].plain;
}
