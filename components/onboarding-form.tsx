"use client";

import { useState } from "react";
import { createProfile } from "@/lib/actions";
import {
  BOARDING_STATUS,
  MOBILITY,
  INTENT,
  type BoardingStatus,
  type Mobility,
  type Intent,
} from "@/lib/types";
import { Field, StatusPill, Kicker } from "@/components/ui";

/** Popular destinations, so a new passenger can match on day one. */
const SUGGESTED = [
  "Have coffee somewhere quiet",
  "Watch a terrible movie together",
  "See the northern lights",
  "Eat oysters somewhere they were pulled that morning",
  "Hear live music one more time, even badly played",
  "Sit outside at night when it's warm",
  "Sleep next to somebody again",
  "Swim in the ocean once more",
  "Have Sunday lunch with someone every week",
  "Dance in public without being self-conscious",
  "Drive the whole Lake Michigan loop with no schedule",
  "Have someone read me the end of a book I won't finish",
  "Say the thing to my brother",
  "Write down the family history before it goes with me",
  "Learn to swim properly, not the flailing I do now",
  "Have a genuinely stupid argument about the thermostat",
];

const STEPS = [
  "Who's flying",
  "Boarding status",
  "Getting about",
  "What you're here for",
  "Your itinerary",
  "In your words",
  "Pre-flight check",
  "Ground crew",
];

export function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<BoardingStatus>("PRIVATE");
  const [mobility, setMobility] = useState<Mobility>("WALKING");
  const [intents, setIntents] = useState<Intent[]>(["COMPANY"]);
  const [items, setItems] = useState<string[]>([]);
  const [custom, setCustom] = useState("");

  const toggleIntent = (i: Intent) =>
    setIntents((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  const toggleItem = (s: string) =>
    setItems((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const addCustom = () => {
    const v = custom.trim();
    if (v && !items.includes(v)) setItems([...items, v]);
    setCustom("");
  };

  const last = step === STEPS.length - 1;

  return (
    <form action={createProfile} className="stack-lg">
      <div>
        <div className="progress" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span key={i} className="progress-step" data-on={i <= step} />
          ))}
        </div>
        <Kicker>
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </Kicker>
      </div>

      {/* ---- 1. identity ---- */}
      <section hidden={step !== 0} className="stack">
        <h2>Let&apos;s start with the easy part.</h2>
        <Field label="Name">
          <input name="name" className="input" required={step === 0} placeholder="What people actually call you" />
        </Field>
        <div className="grid-2">
          <Field label="Age">
            <input name="age" type="number" min={18} max={110} defaultValue={72} className="input" />
          </Field>
          <Field label="Pronouns">
            <input name="pronouns" className="input" defaultValue="she/her" />
          </Field>
        </div>
        <Field label="Where you are" hint="We only show people close enough to actually reach.">
          <select name="city" className="select" defaultValue="Ann Arbor, MI">
            <option>Ann Arbor, MI</option>
            <option>Ypsilanti, MI</option>
            <option>Detroit, MI</option>
            <option>Toledo, OH</option>
          </select>
        </Field>
      </section>

      {/* ---- 2. boarding status ---- */}
      <section hidden={step !== 1} className="stack">
        <h2>What&apos;s your boarding status?</h2>
        <p className="mute">
          Optional · Describe where you are today, if you want to. You never need
          to estimate how much time you have. Choose private or uncertain, and
          change your choice any time on My Pass.
        </p>
        <div className="stack" style={{ gap: 10 }}>
          {(Object.keys(BOARDING_STATUS) as BoardingStatus[]).map((s) => (
            <label key={s} className="choice" data-on={status === s}>
              <input
                type="radio"
                name="status"
                value={s}
                checked={status === s}
                onChange={() => setStatus(s)}
              />
              <span>
                <StatusPill status={s} solid />
                <div className="choice-title" style={{ marginTop: 8 }}>{BOARDING_STATUS[s].plain}</div>
                <div className="choice-blurb">{BOARDING_STATUS[s].blurb}</div>
              </span>
            </label>
          ))}
        </div>
        <Field
          label="In your own words (optional)"
          hint="Whatever you'd want a stranger to know about your timeline. Or nothing — that's a complete answer too."
        >
          <textarea
            name="runway"
            className="textarea"
            style={{ minHeight: 88 }}
            placeholder="They said a year in March and I've decided to be difficult about it."
          />
        </Field>
      </section>

      {/* ---- 3. mobility ---- */}
      <section hidden={step !== 2} className="stack">
        <h2>How do you get about?</h2>
        <p className="mute">
          This decides what kind of plans we suggest. It&apos;s the difference
          between an app that says &ldquo;go for a hike&rdquo; and one that
          doesn&apos;t insult you.
        </p>
        <div className="stack" style={{ gap: 10 }}>
          {(Object.keys(MOBILITY) as Mobility[]).map((m) => (
            <label key={m} className="choice" data-on={mobility === m}>
              <input
                type="radio"
                name="mobility"
                value={m}
                checked={mobility === m}
                onChange={() => setMobility(m)}
              />
              <span>
                <div className="choice-title">{MOBILITY[m].label}</div>
                <div className="choice-blurb">{MOBILITY[m].blurb}</div>
              </span>
            </label>
          ))}
        </div>
        <Field
          label="When are you at your best?"
          hint="Energy, rest breaks, transport or access needs. Changing or cancelling plans is always okay."
        >
          <input
            name="goodDays"
            className="input"
            placeholder="Mornings. Chemo's Monday so I'm useless until Wednesday."
          />
        </Field>
      </section>

      {/* ---- 4. intents ---- */}
      <section hidden={step !== 3} className="stack">
        <h2>What are you actually here for?</h2>
        <p className="mute">Pick as many as are true. Nobody&apos;s judging the list.</p>
        <div className="stack" style={{ gap: 10 }}>
          {(Object.keys(INTENT) as Intent[]).map((i) => (
            <label key={i} className="choice" data-on={intents.includes(i)}>
              <input
                type="checkbox"
                name="intents"
                value={i}
                checked={intents.includes(i)}
                onChange={() => toggleIntent(i)}
              />
              <span>
                <div className="choice-title">{INTENT[i].label}</div>
                <div className="choice-blurb">{INTENT[i].blurb}</div>
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* ---- 5. itinerary ---- */}
      <section hidden={step !== 4} className="stack">
        <h2>Your itinerary.</h2>
        <p className="mute">
          The things you want to do together. Quiet coffee and an afternoon outside
          count just as much as a big adventure. Shared wishes help us suggest matches.
        </p>
        <input type="hidden" name="itinerary" value={items.join("\n")} />
        <div className="row wrap" style={{ gap: 8 }}>
          {SUGGESTED.map((s) => (
            <button
              key={s}
              type="button"
              className="tag"
              data-hit={items.includes(s)}
              onClick={() => toggleItem(s)}
              style={{ cursor: "pointer", textAlign: "left" }}
            >
              {items.includes(s) ? "✓ " : "+ "}
              {s}
            </button>
          ))}
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <input
            className="input"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="Something of your own…"
          />
          <button type="button" className="btn" onClick={addCustom}>
            Add
          </button>
        </div>
        {items.length > 0 && (
          <div className="panel panel-tight">
            <div className="panel-head">On your list · {items.length}</div>
            <ol className="stack" style={{ margin: 0, paddingLeft: 20, gap: 4 }}>
              {items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* ---- 6. words ---- */}
      <section hidden={step !== 5} className="stack">
        <h2>In your words.</h2>
        <Field label="About you" hint="Who you were, who you are. People read these properly on here — there's time.">
          <textarea
            name="bio"
            className="textarea"
            placeholder="Retired labour and delivery nurse, forty-one years…"
          />
        </Field>
        <Field
          label="The one thing you want someone to know first"
          hint="This appears at the top of your pass, above everything else."
        >
          <textarea
            name="lastWords"
            className="textarea"
            style={{ minHeight: 88 }}
            placeholder="I'm not fragile and I'm not a project."
          />
        </Field>
        <Field label="Green flags" hint="Comma separated. What makes someone right for you.">
          <input name="greenFlags" className="input" placeholder="Reads actual books, can be quiet in a car" />
        </Field>
      </section>

      {/* ---- 7. pre-flight ---- */}
      <section hidden={step !== 6} className="stack">
        <h2>Pre-flight check.</h2>
        <div className="note">
          Optional · Health &amp; boundaries. These details appear on your own
          demo pass in this browser; no other visitor can see them. Use fictional
          details, and skip anything you prefer to discuss privately. Accessibility
          and scheduling needs belong in Getting about.
        </div>
        <Field label="Last STI panel" hint="Optional. Blank reads as 'Testing not stated'.">
          <input name="lastTested" type="date" className="input" />
        </Field>
        <Field label="Anything you'd rather state up front" hint="One per line. Shown on your pass exactly as you write it.">
          <textarea
            name="disclosures"
            className="textarea"
            style={{ minHeight: 88 }}
            placeholder={"HSV-2, well managed, happy to talk about it"}
          />
        </Field>
        <div className="panel">
          <label className="switch">
            <span>
              <div className="choice-title">I&apos;m immunocompromised</div>
              <div className="choice-blurb">
                An optional detail for your demo pass.
              </div>
            </span>
            <input type="checkbox" name="immunocompromised" />
          </label>
          <label className="switch">
            <span>
              <div className="choice-title">My vaccinations are current</div>
              <div className="choice-blurb">Leave unchecked to keep this unstated.</div>
            </span>
            <input type="checkbox" name="vaccinesCurrent" />
          </label>
        </div>
        <Field label="Your note on all this">
          <textarea
            name="preflightNote"
            className="textarea"
            style={{ minHeight: 80 }}
            placeholder="If you've got a sniffle we do the phone instead. No hard feelings, ever."
          />
        </Field>
      </section>

      {/* ---- 8. ground crew ---- */}
      <section hidden={step !== 7} className="stack">
        <h2>Ground crew.</h2>
        <p className="mute">
          Optional emergency contact · Use a fictional name and number here.
          This demo stores a reminder only. It never sends messages, calls anyone,
          monitors your wellbeing or provides emergency assistance. Skip this step freely.
        </p>
        <Field label="Their name">
          <input name="crewName" className="input" placeholder="Kirsten" />
        </Field>
        <div className="grid-2">
          <Field label="Who they are to you">
            <input name="crewRelationship" className="input" placeholder="My daughter" />
          </Field>
          <Field label="Phone">
            <input name="crewPhone" type="tel" className="input" placeholder="734-555-0139" />
          </Field>
        </div>
        <div className="panel">
          <label className="switch">
            <span>
              <div className="choice-title">Remind me to share my date plans</div>
              <div className="choice-blurb">
                You choose whether and how to share a plan yourself.
              </div>
            </span>
            <input type="checkbox" name="crewShare" />
          </label>
        </div>
      </section>

      {step > 0 && !last && <button type="submit" className="btn btn-ghost btn-block">Skip remaining details and start discovering →</button>}

      <div className="row" style={{ gap: 12 }}>
        {step > 0 && (
          <button type="button" className="btn" onClick={() => setStep(step - 1)}>
            ← Back
          </button>
        )}
        <div className="grow" />
        {last ? (
          <button type="submit" className="btn btn-primary btn-lg">
            Print my boarding pass →
          </button>
        ) : (
          <button type="button" className="btn btn-primary btn-lg" onClick={(e) => {
            const section = e.currentTarget.form?.querySelector("section:not([hidden])");
            const inputs = section?.querySelectorAll<HTMLInputElement>("input");
            if (inputs && !Array.from(inputs).every(input => input.reportValidity())) return;
            setStep(step + 1);
          }}>
            Continue →
          </button>
        )}
      </div>
    </form>
  );
}
