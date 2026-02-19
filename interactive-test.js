// =============================================================================
// IronQuest Interactive UI Test - Run with: node interactive-test.js
// =============================================================================
// This script demonstrates interactive testing of the FP system UI
// =============================================================================

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const EXPO_URL = 'http://localhost:8081';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

// Mobile viewport
const MOBILE_VIEWPORT = { width: 390, height: 844 };

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('IronQuest Interactive UI Test');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Ensure screenshots directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  try {
    // =========================================================================
    // Step 1: Navigate to the app
    // =========================================================================
    console.log('📱 Navigating to the app...');
    await page.goto(EXPO_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'interactive-01-home.png') });
    console.log('   ✅ Home screen loaded\n');

    // =========================================================================
    // Step 2: Navigate to Den tab (FP system)
    // =========================================================================
    console.log('📱 Navigating to Den tab...');

    // Use JavaScript to click on the Den tab (bypasses viewport issues with RN Web)
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('[class*="css-text"]');
      for (const tab of tabs) {
        if (tab.textContent === 'The Den') {
          tab.click();
          return true;
        }
      }
      return false;
    });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'interactive-02-den.png'), fullPage: true });
    console.log('   ✅ Den screen loaded\n');

    // =========================================================================
    // Step 3: Verify FP Balance Display
    // =========================================================================
    console.log('🔍 Verifying FP Balance...');
    const fpBalance = page.locator('text=/Available FP|\\d+/').first();
    const balanceVisible = await fpBalance.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`   ${balanceVisible ? '✅' : '❌'} FP Balance visible: ${balanceVisible}\n`);

    // =========================================================================
    // Step 4: Verify Stats Section
    // =========================================================================
    console.log('🔍 Verifying Stats section...');
    const statsSection = page.locator('text=Stats').first();
    const statsVisible = await statsSection.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`   ${statsVisible ? '✅' : '❌'} Stats section visible\n`);

    // Check for each stat
    const stats = ['Power', 'Guard', 'Speed', 'Vigor', 'Focus', 'Spirit'];
    for (const stat of stats) {
      const statLabel = page.locator(`text=${stat}`).first();
      const visible = await statLabel.isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`   ${visible ? '✅' : '❌'} ${stat} stat visible`);
    }
    console.log('');

    // =========================================================================
    // Step 5: Check Spirit stat for special indicator
    // =========================================================================
    console.log('🔍 Checking Spirit stat indicator...');
    const spiritRow = page.locator('text=Spirit').first();
    await spiritRow.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'interactive-03-spirit-stat.png') });

    // Check for crystal ball emoji or Spirit-specific text
    const spiritSection = await page.locator('text=/🔮|Spirit.*10/').first().isVisible().catch(() => false);
    console.log(`   ${spiritSection ? '✅' : '⚠️'} Spirit indicator present\n`);

    // =========================================================================
    // Step 6: Check FP Breakdown section
    // =========================================================================
    console.log('🔍 Checking FP Breakdown...');
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(500);

    const fpBreakdown = page.locator('text=FP Breakdown').first();
    const breakdownVisible = await fpBreakdown.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`   ${breakdownVisible ? '✅' : '❌'} FP Breakdown section visible\n`);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'interactive-04-fp-breakdown.png') });

    // Check for FP types
    const fpTypes = ['Generic', 'Power', 'Guard', 'Speed', 'Vigor', 'Focus', 'Spirit'];
    console.log('🔍 Checking FP types in breakdown...');
    for (const fpType of fpTypes) {
      const typeRow = page.locator(`text=${fpType}`).first();
      const visible = await typeRow.isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`   ${visible ? '✅' : '❌'} ${fpType} FP visible`);
    }
    console.log('');

    // =========================================================================
    // Step 7: Verify upgrade button states
    // =========================================================================
    console.log('🔍 Checking upgrade button states...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    const upgradeButtons = page.locator('button, [role="button"]').filter({ hasText: /\+1/ });
    const buttonCount = await upgradeButtons.count();
    console.log(`   Found ${buttonCount} upgrade buttons\n`);

    // =========================================================================
    // Summary
    // =========================================================================
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📸 Screenshots saved to: screenshots/');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Keep browser open for inspection
    console.log('👀 Browser will stay open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
