import assert from "node:assert/strict";
import { inflateSync } from "node:zlib";
import puppeteer from "puppeteer-core";

const base = process.env.TERMINAL_BASE_URL || "http://127.0.0.1:3210";
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${base}/onboarding`, { waitUntil: "networkidle0" });
  await page.type('input[name="name"]', 'Demo Explorer');
  await page.click('button.btn-primary');
  await page.waitForSelector('button[type="submit"]');
  await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), page.click('button[type="submit"]')]);
  await page.waitForSelector('.discovery-card');
  const state = async () => {
    const cookie = (await page.cookies()).find(c => c.name === 'terminal_state');
    return JSON.parse(inflateSync(Buffer.from(cookie.value.slice(2), 'base64url')).toString());
  };
  const profileHref = () => page.$eval('.discovery-card', el => el.getAttribute('href'));
  const first = await profileHref();
  assert.equal(await page.$('.pass'), null, 'No full profile in discovery');
  assert.equal(await page.$('.health-details'), null, 'No health panel in discovery');
  const originalChoices = (await state()).swipes.filter(s => s.from === 'me').length;
  await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), page.click('.discovery-card')]);
  assert.ok(page.url().endsWith(first));
  assert.equal(await page.$eval('.health-details', el => el.open), false);
  await page.click('.health-details summary');
  assert.equal(await page.$eval('.health-details', el => el.open), true);
  await page.goto(`${base}/gates`, { waitUntil: "networkidle0" });
  assert.equal(await profileHref(), first, 'Opening a profile does not swipe it');
  // A real horizontal mouse drag exercises the same Pointer Events as touch swipes.
  const box = await page.$eval('.discovery-card', el => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + 130 }; });
  await page.mouse.move(box.x, box.y);
  await page.mouse.down();
  await page.mouse.move(box.x - 110, box.y, { steps: 10 });
  await page.mouse.up();
  await page.waitForFunction(href => document.querySelector('.discovery-card')?.getAttribute('href') !== href, {}, first);
  assert.ok(page.url().endsWith('/gates'), 'Drag does not open a profile');
  assert.equal((await state()).swipes.filter(s => s.from === 'me').length, originalChoices + 1);
  const second = await profileHref();
  await page.waitForSelector('.deck-toolbar button:not([disabled])');
  await page.click('.deck-toolbar button');
  await page.waitForFunction(href => document.querySelector('.discovery-card')?.getAttribute('href') === href, {}, first);
  assert.equal((await state()).swipes.filter(s => s.from === 'me').length, originalChoices);
  await page.waitForSelector('.pass-action:not([disabled])');
  await page.$eval('.pass-action', el => el.scrollIntoView({ block: 'center' }));
  await page.click('.pass-action');
  await page.waitForFunction(href => document.querySelector('.discovery-card')?.getAttribute('href') === href, {}, second);
  assert.equal(await profileHref(), second, 'Pass advances exactly one card after undo');
  await page.reload({ waitUntil: "networkidle0" });
  assert.equal(await profileHref(), second, 'Deck choice survives reload');
  await page.screenshot({ path: '/tmp/terminal-discovery.png', fullPage: true });
  // Touch swipe right must like exactly once, without navigating to the profile.
  const client = await page.createCDPSession();
  const touch = await page.$eval('.discovery-card', el => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + 100 }; });
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touch] });
  for (const dx of [20, 40, 70, 100]) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: touch.x + dx, y: touch.y }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForFunction(href => !document.querySelector('.discovery-card') || document.querySelector('.discovery-card').getAttribute('href') !== href, {}, second);
  const like = (await state()).swipes.find(s => s.from === 'me' && `/passengers/${s.to}` === second);
  assert.equal(like?.direction, 'TICKET', 'Touch swipe right likes');
  await page.goto(`${base}/gates`, { waitUntil: "networkidle0" });
  const third = await profileHref();
  await page.goto(`${base}${third}`, { waitUntil: "networkidle0" });
  await page.click('.profile-actions .btn-primary');
  await page.waitForFunction(() => /\/(gates|matches)$/.test(location.pathname));
  assert.equal((await state()).swipes.find(s => s.from === 'me' && `/passengers/${s.to}` === third)?.direction, 'TICKET');
  for (const width of [320, 390, 1280]) {
    await page.setViewport({ width, height: 900 });
    for (const path of ['/gates', first, '/matches', '/itinerary', '/profile']) {
      await page.goto(`${base}${path}`, { waitUntil: "networkidle0" });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} fits ${width}px`);
    }
  }
  assert.deepEqual(errors, []);
  console.log('Passed: quick onboarding, profile drill-in, health disclosure, mouse pass, touch like, undo, no skipped cards, persistence, profile like, authenticated responsive pages, no JS errors.');
} finally { await browser.close(); }
