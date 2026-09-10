import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const pages = process.argv.slice(3);
const width = Number(process.argv[2]);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
for (const path of pages) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900 });
  await page.goto(`http://localhost:3111${path}`, { waitUntil: "networkidle0" });
  const result = await page.evaluate((w) => {
    const offenders = [];
    for (const el of document.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.right > w + 1 && r.width > 0) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: el.className?.toString?.().slice(0, 44) ?? "",
          right: Math.round(r.right),
          width: Math.round(r.width),
          text: (el.textContent ?? "").trim().slice(0, 30),
        });
      }
    }
    return { docWidth: document.documentElement.scrollWidth, offenders: offenders.slice(0, 8) };
  }, width);
  console.log(`\n${path} @${width}px — document is ${result.docWidth}px wide`);
  for (const o of result.offenders)
    console.log(`   ${o.right}px  <${o.tag} class="${o.cls}"> w=${o.width}  "${o.text}"`);
  await page.close();
}
await browser.close();
