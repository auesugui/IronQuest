// Quick debug script to see what's on screen
const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });

  await page.goto('http://localhost:8081');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Take screenshot
  await page.screenshot({
    path: path.join(__dirname, 'screenshots', 'debug-current.png'),
    fullPage: true,
  });
  console.log('Screenshot saved to screenshots/debug-current.png');

  // Get all visible text
  const allText = await page.evaluate(() => document.body.innerText);
  console.log('\n=== Visible text on page ===\n');
  console.log(allText.substring(0, 2000));

  // Get accessibility tree
  const snapshot = await page.accessibility.snapshot();
  console.log('\n=== Accessibility tree (first level) ===\n');
  if (snapshot?.children) {
    snapshot.children.slice(0, 20).forEach((child) => {
      console.log(`- ${child.role}: "${child.name || ''}"`);
    });
  }

  await browser.close();
}

main().catch(console.error);
