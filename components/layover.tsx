"use client";

import { useState, useTransition } from "react";
import { setLayover, clearLayover } from "@/lib/actions";

export function LayoverPlanner({
  matchId,
  ideas,
  existing,
  crewName,
  meetingBlurb,
}: {
  matchId: string;
  ideas: string[];
  existing: { plan: string; when: string } | null;
  crewName: string | null;
  meetingBlurb: string;
}) {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState("");
  const [pending, start] = useTransition();

  if (existing) {
    return (
      <div className="panel stack" style={{ gap: 10 }}>
        <div className="panel-head">Demo date plan saved</div>
        <div style={{ fontWeight: 600, fontSize: "1.05rem" }}>{existing.plan}</div>
        <div className="mute">{existing.when}</div>
        {crewName && (
          <p className="small mute" style={{ margin: 0 }}>
            Reminder: share this plan with {crewName} yourself if you choose. Nothing has been sent.
          </p>
        )}
        <form action={() => start(async () => { await clearLayover(matchId); })}>
          <button className="btn btn-sm btn-danger" disabled={pending}>
            Cancel this layover
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="panel stack" style={{ gap: 12 }}>
      <div className="row-between">
        <div className="panel-head" style={{ margin: 0 }}>Layover · Plan a date</div>
        <button className="btn btn-sm btn-ghost" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Open"}
        </button>
      </div>
      <p className="small mute" style={{ margin: 0 }}>{meetingBlurb}</p>

      {open && (
        <form
          className="stack"
          action={(fd) => start(async () => { await setLayover(matchId, fd); })}
        >
          <div className="stack" style={{ gap: 8 }}>
            {ideas.map((idea) => (
              <button
                key={idea}
                type="button"
                className="btn"
                data-on={plan === idea}
                style={{
                  textAlign: "left",
                  justifyContent: "flex-start",
                  height: "auto",
                  minHeight: 48,
                  padding: "11px 15px",
                  lineHeight: 1.4,
                  borderColor: plan === idea ? "var(--amber)" : undefined,
                  background: plan === idea ? "rgba(247,183,51,.08)" : undefined,
                }}
                onClick={() => setPlan(idea)}
              >
                {idea}
              </button>
            ))}
          </div>
          <input
            name="plan"
            className="input"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder="Or write your own"
            required
          />
          <p className="small mute">Agree on transport, step-free access, rest breaks and a comfortable length. A phone call or cancellation is always okay.</p>
          <input name="when" className="input" placeholder="Thursday, 2pm — their good day" required />
          {crewName && (
            <p className="small mute" style={{ margin: 0 }}>
              Saving shows a reminder to share with {crewName}. Nothing is sent automatically.
            </p>
          )}
          <button className="btn btn-primary" disabled={pending}>
            Save demo plan
          </button>
        </form>
      )}
    </div>
  );
}
