#!/usr/bin/env node
// =============================================================================
// IronQuest Visual Testing - Expo Web + Playwright
// =============================================================================
// This script starts the Expo web server and takes screenshots
// Usage:
//   1. Run: npm run web (in one terminal)
//   2. Run: node visual-test.js (in another terminal)
//   OR
//   node visual-test.js --start-server (starts Expo automatically)
// =============================================================================

const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const EXPO_PORT = 8081;
const MAX_WAIT_TIME = 90000; // 90 seconds
const CHECK_INTERVAL = 3000; // 3 seconds

let expoProcess = null;
const shouldStartServer = process.argv.includes('--start-server');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkServer(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForExpo() {
  const url = `http://localhost:${EXPO_PORT}`;

  log(`Waiting for Expo web server at ${url}...`, 'cyan');
  log('This may take up to 90 seconds on first run...', 'dim');

  const startTime = Date.now();

  while (Date.now() - startTime < MAX_WAIT_TIME) {
    if (await checkServer(url)) {
      log('Expo web server is ready!', 'green');
      return true;
    }
    process.stdout.write('.');
    await new Promise((r) => setTimeout(r, CHECK_INTERVAL));
  }

  console.log('');
  log('Timeout waiting for Expo web server', 'red');
  return false;
}

function startExpo() {
  log('Starting Expo web server...', 'yellow');

  expoProcess = spawn('npx', ['expo', 'start', '--web', '--port', String(EXPO_PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    cwd: process.cwd(),
    detached: true,
  });

  expoProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('started') || output.includes('running') || output.includes('localhost')) {
      log(`[Expo] ${output.trim()}`, 'dim');
    }
  });

  expoProcess.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.includes('error') || output.includes('Error')) {
      log(`[Expo Error] ${output.trim()}`, 'red');
    }
  });

  return expoProcess;
}

function stopExpo() {
  if (expoProcess) {
    log('Stopping Expo web server...', 'yellow');
    try {
      process.kill(-expoProcess.pid, 'SIGTERM');
    } catch (e) {
      expoProcess.kill('SIGTERM');
    }
    expoProcess = null;
  }
}

async function takeScreenshots() {
  log('\nTaking screenshots for visual verification...', 'cyan');

  // Use npx to run playwright
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Create a temporary test script
  const testScript = `
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();
  const screenshotsDir = '${screenshotsDir.replace(/'/g, "'\\''")}';

  try {
    console.log('Navigating to app...');
    await page.goto('http://localhost:${EXPO_PORT}');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Home screen
    await page.screenshot({ path: path.join(screenshotsDir, '01-home.png'), fullPage: true });
    console.log('✅ Home screen screenshot saved');

    // Try to navigate to Den tab
    const denTab = page.locator('text=Den').first();
    if (await denTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await denTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(screenshotsDir, '02-den.png'), fullPage: true });
      console.log('✅ Den screen screenshot saved');

      // Scroll to see FP breakdown
      await page.evaluate(() => window.scrollBy(0, 600));
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotsDir, '03-den-fp-breakdown.png'), fullPage: true });
      console.log('✅ FP Breakdown screenshot saved');
    }

    // Try Forge tab
    await page.evaluate(() => window.scrollTo(0, 0));
    const forgeTab = page.locator('text=Forge').first();
    if (await forgeTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await forgeTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(screenshotsDir, '04-forge.png'), fullPage: true });
      console.log('✅ Forge screen screenshot saved');
    }

    console.log('\\nScreenshots saved to: ' + screenshotsDir);
  } catch (error) {
    console.error('Screenshot error:', error.message);
  } finally {
    await browser.close();
  }
})();
`;

  const tempFile = path.join(process.cwd(), '.temp-screenshot-test.js');
  fs.writeFileSync(tempFile, testScript);

  try {
    execSync('npx playwright test --browser=chromium --headed=false', {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: '0' },
    });
  } catch (e) {
    // Try alternative approach
    try {
      execSync(`node ${tempFile}`, { stdio: 'inherit', cwd: process.cwd() });
    } catch (e2) {
      log('Could not take screenshots automatically. Run Playwright manually.', 'yellow');
    }
  } finally {
    fs.unlinkSync(tempFile);
  }
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('IronQuest Visual Testing');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Handle cleanup on exit
  process.on('SIGINT', () => {
    stopExpo();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    stopExpo();
    process.exit(0);
  });

  // Check if Expo is already running
  const alreadyRunning = await checkServer(`http://localhost:${EXPO_PORT}`);

  if (!alreadyRunning) {
    if (shouldStartServer) {
      startExpo();
      const ready = await waitForExpo();

      if (!ready) {
        log('Failed to start Expo web server', 'red');
        stopExpo();
        process.exit(1);
      }
    } else {
      log('Expo web server not running.', 'yellow');
      log('Start it first with: npm run web', 'cyan');
      log('Or run with --start-server flag to start automatically', 'cyan');
      process.exit(1);
    }
  } else {
    log('Expo web server already running', 'green');
  }

  // Take screenshots
  await takeScreenshots();

  // Cleanup
  if (shouldStartServer) {
    stopExpo();
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  log('✅ Visual testing complete!', 'green');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main().catch((error) => {
  log(`Fatal error: ${error.message}`, 'red');
  stopExpo();
  process.exit(1);
});
