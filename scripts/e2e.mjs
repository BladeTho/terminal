import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const B = "http://localhost:3210";
const b = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
const page = await b.newPage();
await page.setViewport({ width: 430, height: 932 });
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));

const wait = (ms = 200) => new Promise((r) => setTimeout(r, ms));
// click inside the page so React re-renders can't detach a stale handle
const tap = async (sel, nth = 0) => {
  const ok = await page.evaluate((s, n) => {
    const el = document.querySelectorAll(s)[n];
    if (!el) return false;
    el.click();
    return true;
  }, sel, nth);
  if (!ok) throw new Error(`no element for ${sel}[${nth}]`);
  await wait();
};
const fill = async (sel, value) =>
  page.evaluate((s, v) => {
    const el = document.querySelector(s);
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
    Object.getOwnPropertyDescriptor(proto.prototype, "value").set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, sel, value);
const step = () => page.evaluate(() => document.querySelector(".kicker")?.textContent);

await page.goto(`${B}/onboarding`, { waitUntil: "networkidle0" });

assert.match(await page.$eval("main", el => el.innerText), /All 16 passengers are fictional/);
assert.equal(await page.$eval('input[name="status"]:checked', el => el.value), "PRIVATE");
assert.equal(await page.$eval('input[name="crewShare"]', el => el.checked), false);
await fill('input[name="name"]', "Eleanor Vance");
await fill('input[name="age"]', "73");
await tap("button.btn-primary");                                  // -> 2
await tap('input[name="status"][value="DELAYED"]');
await fill('textarea[name="runway"]', "Heart is tired but it isn't finished.");
await tap("button.btn-primary");                                  // -> 3
await tap('input[name="mobility"][value="CANE"]');
await fill('input[name="goodDays"]', "Mornings, before the tiredness lands.");
await tap("button.btn-primary");                                  // -> 4
await tap('input[name="intents"][value="ROMANCE"]');
await tap('input[name="intents"][value="MEALS"]');
await tap("button.btn-primary");                                  // -> 5
console.log("on:", await step());
for (const i of [0, 1, 3]) await tap("button.tag", i);
const picked = await page.$eval('input[name="itinerary"]', (el) => el.value.split("\n").length);
console.log("itinerary items picked:", picked);
await tap("button.btn-primary");                                  // -> 6
await fill('textarea[name="bio"]', "Retired librarian, thirty-eight years.");
await fill('textarea[name="lastWords"]', "I'm not fragile and I'm not a project.");
await fill('input[name="greenFlags"]', "Reads actual books, punctual");
await tap("button.btn-primary");                                  // -> 7
await fill('textarea[name="preflightNote"]', "Tested in July. Ask me and I'll ask you.");
await tap("button.btn-primary");                                  // -> 8
await fill('input[name="crewName"]', "Kirsten");
await fill('input[name="crewRelationship"]', "My daughter");
console.log("on:", await step());

await Promise.all([
  page.waitForNavigation({ waitUntil: "networkidle0" }),
  page.evaluate(() => document.querySelector('button[type="submit"]').click()),
]);
console.log("after submit ->", page.url().replace(B, ""));

const gate = await page.evaluate(() => document.body.innerText);
console.log("deck rendered a pass:", /people to discover/i.test(gate));

await tap(".deck-actions .btn-primary");
await wait(1400);
const afterTicket = await page.evaluate(() => document.body.innerText);
console.log("ticket -> match screen:", /It’s a match/i.test(afterTicket));

await page.goto(`${B}/matches`, { waitUntil: "networkidle0" });
const href = await page.$eval('a[href^="/matches/m_"]', (a) => a.getAttribute("href"));
await page.goto(`${B}${href}`, { waitUntil: "networkidle0" });
console.log("thread:", href);

const before = await page.$$eval(".bubble", (e) => e.length);
await tap(".panel button.btn");                                   // first suggested opener
await wait(1600);
const after = await page.$$eval(".bubble", (e) => e.length);
console.log(`bubbles ${before} -> ${after} (sent + auto-reply)`);

assert.equal(after, before + 2, "Message and scripted reply persist");
assert.equal(errs.length, 0, errs.join("\n"));
const cookie = (await page.cookies()).find(c => c.name === "terminal_state");
assert.ok(cookie.value.startsWith("z."));
assert.ok(cookie.value.length <= 3800);
await page.reload({ waitUntil: "networkidle0" });
assert.equal(await page.$$eval(".bubble", e => e.length), after);
console.log("Assertions passed: demo notice, private default, contact opt-in, chat persistence, cookie budget, no JS errors");
await b.close();
