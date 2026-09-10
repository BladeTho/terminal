"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { sendMessage } from "@/lib/actions";

export function Composer({
  matchId,
  openers,
  hasSpoken,
}: {
  matchId: string;
  openers: string[];
  hasSpoken: boolean;
}) {
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const ref = useRef<HTMLInputElement>(null);

  const send = (body: string) => {
    if (!body.trim() || pending) return;
    setText("");
    start(async () => {
      await sendMessage(matchId, body);
    });
  };

  return (
    <>
      <p className="small mute">Fictional passenger · Scripted replies. No real person receives these messages.</p>
      {!hasSpoken && (
        <div className="panel stack" style={{ gap: 10, marginBottom: 16 }}>
          <div className="panel-head">Openers</div>
          <p className="small mute" style={{ margin: 0 }}>
            Built from what&apos;s actually on their profile. Nobody on here needs another &ldquo;hey&rdquo;.
          </p>
          {openers.map((o) => (
            <button
              key={o}
              className="btn"
              style={{ textAlign: "left", justifyContent: "flex-start", height: "auto", minHeight: 52, padding: "12px 16px", lineHeight: 1.4 }}
              onClick={() => send(o)}
              disabled={pending}
            >
              {o}
            </button>
          ))}
        </div>
      )}

      <div className="composer">
        <input
          ref={ref}
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              send(text);
            }
          }}
          placeholder="Say something ordinary…"
          aria-label="Message"
          disabled={pending}
        />
        <button className="btn btn-primary" onClick={() => send(text)} disabled={pending || !text.trim()}>
          Send
        </button>
      </div>
    </>
  );
}

export function ScrollToEnd() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "end" });
  }, []);
  return <div ref={ref} />;
}
