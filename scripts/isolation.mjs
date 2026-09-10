import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const B = "http://localhost:3210";
const b = await puppeteer.launch({ executablePath: CHROME, headless: "new" });

async function checkIn(name) {
  // incognito-equivalent: a fresh, isolated browser context = a fresh visitor
  const ctx = await b.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 430, height: 932 });
  const fill = (sel, v) => page.evaluate((s, val) => {
    const el = document.querySelector(s);
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
    Object.getOwnPropertyDescriptor(proto.prototype, "value").set.call(el, val);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, sel, v);
  const tap = (sel) => page.evaluate((s) => document.querySelector(s).click(), sel);

  await page.goto(`${B}/onboarding`, { waitUntil: "networkidle0" });
  await fill('input[name="name"]', name);
  await tap("button.btn-primary");
  await new Promise(r => setTimeout(r, 150));
  await tap('input[name="status"][value="ON_TIME"]');
  await tap("button.btn-primary");
  for (let i = 0; i < 5; i++) { await tap("button.btn-primary"); await new Promise(r => setTimeout(r, 150)); }
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.evaluate(() => document.querySelector('button[type="submit"]').click()),
  ]);
  await page.goto(`${B}/profile`, { waitUntil: "networkidle0" });
  const who = await page.$eval(".pass h2", (el) => el.textContent);
  await ctx.close();
  return { who };
}

const [alice, bob] = await Promise.all([checkIn("Alice Whitmore"), checkIn("Bob Castellan")]);
console.log("Alice's pass shows:", alice.who);
console.log("Bob's pass shows:  ", bob.who);
console.log("Isolated correctly:", alice.who.includes("Alice") && bob.who.includes("Bob"));
assert.ok(alice.who.includes("Alice") && bob.who.includes("Bob"), "Visitors stay isolated");
await b.close();
