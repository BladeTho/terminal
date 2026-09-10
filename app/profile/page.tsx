import { redirect } from "next/navigation";
import { read } from "@/lib/store";
import {
  updateProfile,
  updatePreflight,
  setGroundCrew,
  updateSettings,
  resetEverything,
} from "@/lib/actions";
import { PassengerCard } from "@/components/passenger-card";
import { Field, Kicker, StatusPill } from "@/components/ui";
import {
  BOARDING_STATUS,
  MOBILITY,
  INTENT,
  type BoardingStatus,
  type Mobility,
  type Intent,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Profile() {
  const store = await read();
  if (!store.me) redirect("/onboarding");
  const me = store.me;
  const s = store.settings;

  return (
    <div className="narrow stack-lg" style={{ paddingTop: 26 }}>
      <Kicker>Your boarding pass</Kicker>
      <PassengerCard p={me} />

      {/* ---- accessibility & pacing ---- */}
      <section className="panel stack">
        <div className="panel-head">Reading & pacing</div>
        <form action={updateSettings} className="stack">
          <div>
            <label className="switch">
              <span>
                <div className="choice-title">Large type</div>
                <div className="choice-blurb">On by default for comfortable reading.</div>
              </span>
              <input type="checkbox" name="largeType" defaultChecked={s.largeType} />
            </label>
            <label className="switch">
              <span>
                <div className="choice-title">High contrast</div>
                <div className="choice-blurb">Black and white, heavier borders.</div>
              </span>
              <input type="checkbox" name="highContrast" defaultChecked={s.highContrast} />
            </label>
            <label className="switch">
              <span>
                <div className="choice-title">Low Spoons Mode</div>
                <div className="choice-blurb">
                  Three profiles a day, no animation, no badges, nothing that
                  nags you to come back. Built for the weeks when the app is the
                  last thing you have energy for.
                </div>
              </span>
              <input type="checkbox" name="lowSpoons" defaultChecked={s.lowSpoons} />
            </label>
          </div>

          <Field label="Who you'd like to see" hint="You decide what you can carry. Nobody is told they've been filtered out.">
            <div className="stack" style={{ gap: 8 }}>
              {(Object.keys(BOARDING_STATUS) as BoardingStatus[]).map((k) => (
                <label key={k} className="choice" data-on={s.statusFilter.includes(k)}>
                  <input
                    type="checkbox"
                    name="statusFilter"
                    value={k}
                    defaultChecked={s.statusFilter.includes(k)}
                  />
                  <span>
                    <StatusPill status={k} />
                    <div className="choice-blurb" style={{ marginTop: 6 }}>
                      {BOARDING_STATUS[k].plain}
                    </div>
                  </span>
                </label>
              ))}
            </div>
          </Field>

          <Field label={`Distance — ${s.maxDistance} miles`}>
            <input
              type="range"
              name="maxDistance"
              min={5}
              max={100}
              step={5}
              defaultValue={s.maxDistance}
              style={{ width: "100%", accentColor: "var(--amber)", height: 44 }}
            />
          </Field>

          <button className="btn btn-primary">Save</button>
        </form>
      </section>

      {/* ---- edit profile ---- */}
      <section className="panel stack">
        <div className="panel-head">Your details</div>
        <form action={updateProfile} className="stack">
          <Field label="Boarding status" hint="Optional. Private and uncertain are welcome; change it any time.">
            <select name="status" className="select" defaultValue={me.status}>
              {(Object.keys(BOARDING_STATUS) as BoardingStatus[]).map((k) => (
                <option key={k} value={k}>
                  {BOARDING_STATUS[k].label} — {BOARDING_STATUS[k].plain}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Runway, in your words">
            <textarea name="runway" className="textarea" style={{ minHeight: 76 }} defaultValue={me.runway} />
          </Field>
          <Field label="Getting about">
            <select name="mobility" className="select" defaultValue={me.mobility}>
              {(Object.keys(MOBILITY) as Mobility[]).map((k) => (
                <option key={k} value={k}>
                  {MOBILITY[k].label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Good days">
            <input name="goodDays" className="input" defaultValue={me.goodDays} />
          </Field>
          <Field label="Here for">
            <div className="row wrap" style={{ gap: 8 }}>
              {(Object.keys(INTENT) as Intent[]).map((k) => (
                <label key={k} className="tag" data-hit={me.intents.includes(k)} style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    name="intents"
                    value={k}
                    defaultChecked={me.intents.includes(k)}
                    style={{ marginRight: 7, accentColor: "var(--amber)" }}
                  />
                  {INTENT[k].label}
                </label>
              ))}
            </div>
          </Field>
          <Field label="About you">
            <textarea name="bio" className="textarea" defaultValue={me.bio} />
          </Field>
          <Field label="The one thing you want someone to know first">
            <textarea name="lastWords" className="textarea" style={{ minHeight: 80 }} defaultValue={me.lastWords} />
          </Field>
          <button className="btn btn-primary">Save details</button>
        </form>
      </section>

      {/* ---- pre-flight ---- */}
      <section className="panel stack">
        <div className="panel-head">Pre-flight check</div>
        <p className="small mute" style={{ margin: 0 }}>
          Optional health &amp; boundaries. These details appear only on your demo
          pass in this browser. Use fictional details; leave fields blank to keep
          them unstated. Edit or remove them here any time.
        </p>
        <form action={updatePreflight} className="stack">
          <Field label="Last STI panel">
            <input
              type="date"
              name="lastTested"
              className="input"
              defaultValue={me.preflight.lastTested?.slice(0, 10) ?? ""}
            />
          </Field>
          <Field label="Stated up front" hint="One per line.">
            <textarea
              name="disclosures"
              className="textarea"
              style={{ minHeight: 80 }}
              defaultValue={me.preflight.disclosures.join("\n")}
            />
          </Field>
          <div>
            <label className="switch">
              <span className="choice-title">I&apos;m immunocompromised</span>
              <input type="checkbox" name="immunocompromised" defaultChecked={me.preflight.immunocompromised} />
            </label>
            <label className="switch">
              <span className="choice-title">Vaccinations current</span>
              <input type="checkbox" name="vaccinesCurrent" defaultChecked={me.preflight.vaccinesCurrent} />
            </label>
          </div>
          <Field label="Your note">
            <textarea
              name="preflightNote"
              className="textarea"
              style={{ minHeight: 76 }}
              defaultValue={me.preflight.note}
            />
          </Field>
          <button className="btn btn-primary">Save pre-flight check</button>
        </form>
      </section>

      {/* ---- ground crew ---- */}
      <section className="panel stack">
        <div className="panel-head">Ground crew</div>
        <p className="small mute" style={{ margin: 0 }}>
          Optional emergency contact. Use fictional details. Nobody is contacted
          or monitored. Clear the name and save to remove this contact.
        </p>
        <form action={setGroundCrew} className="stack">
          <Field label="Name">
            <input name="crewName" className="input" defaultValue={store.groundCrew?.name ?? ""} />
          </Field>
          <div className="grid-2">
            <Field label="Relationship">
              <input
                name="crewRelationship"
                className="input"
                defaultValue={store.groundCrew?.relationship ?? ""}
              />
            </Field>
            <Field label="Phone">
              <input name="crewPhone" type="tel" className="input" defaultValue={store.groundCrew?.phone ?? ""} />
            </Field>
          </div>
          <label className="switch">
            <span>
              <div className="choice-title">Remind me to share my date plans</div>
              <div className="choice-blurb">A reminder only. Share plans yourself if you choose.</div>
            </span>
            <input type="checkbox" name="crewShare" defaultChecked={store.groundCrew?.shareLayovers ?? false} />
          </label>
          <button className="btn btn-primary">Save ground crew</button>
        </form>
      </section>

      {/* ---- reset ---- */}
      <section className="panel stack">
        <div className="panel-head">Start over</div>
        <p className="small mute" style={{ margin: 0 }}>
          Wipes your profile, matches and conversations and puts the demo back to
          a fresh terminal.
        </p>
        <form action={resetEverything}>
          <button className="btn btn-danger btn-block">Clear everything</button>
        </form>
      </section>
    </div>
  );
}
