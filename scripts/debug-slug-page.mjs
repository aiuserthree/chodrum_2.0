import { chromium } from 'playwright';

const urls = [
  'https://renewal.chodrum.com/sheets/day6-happy',
  'https://renewal.chodrum.com/sheets/윤하-사건의-지평선',
];

const browser = await chromium.launch();
const page = await browser.newPage();

page.on('console', (msg) => {
  if (msg.type() === 'warning' || msg.type() === 'error') {
    console.log('[console]', msg.type(), msg.text());
  }
});

for (const url of urls) {
  console.log('\n===', url, '===');
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  const diag = await page.evaluate(() => {
    const D = window.DrumData;
    const api = window.ChodrumAPI;
    const m = location.pathname.match(/^\/sheets\/([^/]+)\/?$/);
    const slugPath = m ? decodeURIComponent(m[1]) : null;
    const s = slugPath && D && typeof D.bySlug === 'function' ? D.bySlug(slugPath) : null;
    const sample = (D && D.sheets || []).slice(0, 3).map((x) => ({ id: x.id, slug: x.slug }));
    return {
      pathname: location.pathname,
      slugPath,
      sheetsCount: D && D.sheets ? D.sheets.length : -1,
      apiMode: api && api.mode,
      apiReady: api && api.readyState && api.readyState.ready,
      apiError: api && api.readyState && api.readyState.error && String(api.readyState.error.message || api.readyState.error),
      found: s ? { id: s.id, title: s.title, slug: s.slug } : null,
      sample,
      bodyText: document.body.innerText.slice(0, 500),
    };
  });

  console.log(JSON.stringify(diag, null, 2));
}

await browser.close();
