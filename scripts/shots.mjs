import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
const shots = [["landing", "/"], ["gates", "/gates"], ["chat", "/matches/m_demo"], ["itinerary", "/itinerary"], ["profile", "/profile"], ["lounge", "/lounge/jokes"], ["onboarding", "/onboarding"]];
for (const [name, path] of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 1600, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:3111${path}`, { waitUntil: "networkidle0" });
  await page.screenshot({ path: `.shots/${name}.png` });
  await page.close();
}
await browser.close();
console.log("shots written");
