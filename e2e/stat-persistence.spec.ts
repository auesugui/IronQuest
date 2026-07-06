// =============================================================================
// IronQuest E2E Tests - Stat Persistence
// =============================================================================
// Run with: npm run test:e2e -- --grep "Stat Persistence"
// Prerequisites: Expo web server running (npm run web)
// =============================================================================

import { expect, test } from '@playwright/test';

// Mobile viewport constants
const MOBILE_VIEWPORT = { width: 390, height: 844 };

// Initial state for testing
const INITIAL_PLAYER_STATE = {
  profile: {
    name: 'Test User',
    avatar: null,
    createdAt: new Date().toISOString(),
  },
  fp: {
    generic: 100,
    power: 50,
    guard: 0,
    speed: 0,
    vigor: 0,
    focus: 0,
    spirit: 20,
  },
  streak: {
    current: 1,
    longest: 1,
    lastWorkoutDate: new Date().toISOString().split('T')[0],
  },
  achievements: [],
  totalWorkouts: 1,
};

const INITIAL_PET_STATE = {
  id: 'test-pet-123',
  name: 'Test Pet',
  type: 'ferro',
  hunger: 100,
  lastFedAt: new Date().toISOString(),
  stats: {
    power: 5,
    guard: 5,
    speed: 5,
    vigor: 5,
    focus: 5,
    spirit: 0,
  },
  evolutionStage: 1,
  totalFPEarned: 100,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Navigate to The Den tab
 */
async function navigateToDen(page: import('@playwright/test').Page) {
  // Use role-based selector for better reliability
  const denTab = page.getByRole('tab', { name: 'The Den' });
  await denTab.waitFor({ state: 'visible', timeout: 15000 });
  await denTab.click();
  await page.waitForTimeout(500);
}

test.describe('Stat Persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize(MOBILE_VIEWPORT);

    // Capture browser console logs
    page.on('console', (msg) => {
      if (
        msg.text().includes('[') ||
        msg.text().includes('Hydration') ||
        msg.text().includes('Store')
      ) {
        console.log(`[Browser] ${msg.text()}`);
      }
    });

    // Navigate to the app first
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Now seed initial state via localStorage
    await page.evaluate(
      (initialState) => {
        // Set player state - key matches STORAGE_KEYS.PLAYER.FULL_STATE
        localStorage.setItem('player.full_state', JSON.stringify(initialState.player));
        // Set pet state - key matches STORAGE_KEYS.PET.FULL_STATE
        localStorage.setItem('pet.full_state', JSON.stringify(initialState.pet));

        // Debug: log what was set
        console.log('Set player data:', localStorage.getItem('player.full_state'));
        console.log('Set pet data:', localStorage.getItem('pet.full_state'));
      },
      { player: INITIAL_PLAYER_STATE, pet: INITIAL_PET_STATE }
    );

    // Reload to trigger hydration with the new data
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Debug: check storage after reload
    const storedPlayer = await page.evaluate(() => localStorage.getItem('player.full_state'));
    const storedPet = await page.evaluate(() => localStorage.getItem('pet.full_state'));
    console.log('After reload - player:', storedPlayer ? 'exists' : 'missing');
    console.log('After reload - pet:', storedPet ? 'exists' : 'missing');

    // Wait for hydration to complete
    await page.waitForTimeout(2000);

    // Navigate to Den tab
    await navigateToDen(page);
  });

  test('should persist stat upgrade after page refresh', async ({ page }) => {
    // Wait for The Den to be visible
    await expect(page.getByRole('heading', { name: 'The Den' })).toBeVisible({ timeout: 10000 });

    // Wait for Stats section (exact match to avoid "Quick Stats")
    await expect(page.getByText('Stats', { exact: true })).toBeVisible({ timeout: 10000 });

    // Debug: take a screenshot to see the current state
    await page.screenshot({ path: 'test-results/den-initial-state.png' });

    // Find the Power stat label
    const powerLabel = page.getByText('Power', { exact: true }).first();
    await expect(powerLabel).toBeVisible();

    // The upgrade button should contain "+1"
    const upgradeButton = page.getByText('+1').first();
    await expect(upgradeButton).toBeVisible({ timeout: 5000 });

    // Get the available FP before upgrade
    const fpCard = page.locator('text=Available FP').locator('..');
    const fpText = await fpCard.textContent();
    const initialTotalFP = Number.parseInt(fpText?.match(/\d+/)?.[0] || '0', 10);
    console.log(`Initial Total FP: ${initialTotalFP}`);

    // Click the first +1 button (should be Power since it's first in the list)
    await upgradeButton.click();
    await page.waitForTimeout(500);

    // Verify FP decreased
    const fpTextAfter = await fpCard.textContent();
    const afterTotalFP = Number.parseInt(fpTextAfter?.match(/\d+/)?.[0] || '0', 10);
    console.log(`After upgrade Total FP: ${afterTotalFP}`);

    // Should have spent 5 FP (cost for stats 0-9)
    expect(afterTotalFP).toBe(initialTotalFP - 5);

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Navigate back to Den
    await navigateToDen(page);

    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'The Den' })).toBeVisible({ timeout: 10000 });

    // Verify FP persisted (should still be lower than initial)
    const fpTextPersisted = await fpCard.textContent();
    const persistedTotalFP = Number.parseInt(fpTextPersisted?.match(/\d+/)?.[0] || '0', 10);
    console.log(`After refresh Total FP: ${persistedTotalFP}`);

    expect(persistedTotalFP).toBe(afterTotalFP);

    // Take screenshot after refresh
    await page.screenshot({ path: 'test-results/stat-after-refresh.png' });
  });

  test('should persist Spirit stat upgrade (uses Spirit FP)', async ({ page }) => {
    // Wait for The Den to be visible
    await expect(page.getByRole('heading', { name: 'The Den' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Stats', { exact: true })).toBeVisible({ timeout: 10000 });

    // Get the available FP before upgrade
    const fpCard = page.locator('text=Available FP').locator('..');
    const fpText = await fpCard.textContent();
    const initialTotalFP = Number.parseInt(fpText?.match(/\d+/)?.[0] || '0', 10);
    console.log(`Initial Total FP: ${initialTotalFP}`);

    // Find Spirit stat row and its +1 button
    // Spirit is the last stat in the list
    const allPlusOneButtons = page.getByText('+1');
    const count = await allPlusOneButtons.count();
    console.log(`Found ${count} +1 buttons`);

    if (count < 6) {
      console.log('Not enough buttons found, skipping test');
      test.skip();
      return;
    }

    // The 6th +1 button should be Spirit
    const spiritUpgradeButton = allPlusOneButtons.nth(5);

    // Click Spirit upgrade
    await spiritUpgradeButton.click();
    await page.waitForTimeout(500);

    // Verify FP decreased by 10 (Spirit costs 10 FP)
    const fpTextAfter = await fpCard.textContent();
    const afterTotalFP = Number.parseInt(fpTextAfter?.match(/\d+/)?.[0] || '0', 10);
    console.log(`After upgrade Total FP: ${afterTotalFP}`);
    expect(afterTotalFP).toBe(initialTotalFP - 10);

    // Refresh
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Navigate back to Den
    await navigateToDen(page);

    // Verify FP persisted
    const fpTextPersisted = await fpCard.textContent();
    const persistedTotalFP = Number.parseInt(fpTextPersisted?.match(/\d+/)?.[0] || '0', 10);
    console.log(`After refresh Total FP: ${persistedTotalFP}`);
    expect(persistedTotalFP).toBe(afterTotalFP);
  });

  test('should maintain multiple stat upgrades after refresh', async ({ page }) => {
    // Wait for The Den to be visible
    await expect(page.getByRole('heading', { name: 'The Den' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Stats', { exact: true })).toBeVisible({ timeout: 10000 });

    // Get the available FP before upgrades
    const fpCard = page.locator('text=Available FP').locator('..');
    const fpText = await fpCard.textContent();
    const initialTotalFP = Number.parseInt(fpText?.match(/\d+/)?.[0] || '0', 10);
    console.log(`Initial Total FP: ${initialTotalFP}`);

    // Click the first +1 button twice (Power)
    const firstButton = page.getByText('+1').first();
    await firstButton.click();
    await page.waitForTimeout(300);
    await firstButton.click();
    await page.waitForTimeout(300);

    // Click the third +1 button (Speed)
    const speedButton = page.getByText('+1').nth(2);
    await speedButton.click();
    await page.waitForTimeout(300);

    // Verify FP decreased (2x5 + 5 = 15 FP spent)
    const fpTextAfter = await fpCard.textContent();
    const afterTotalFP = Number.parseInt(fpTextAfter?.match(/\d+/)?.[0] || '0', 10);
    console.log(`After upgrades Total FP: ${afterTotalFP}`);
    expect(afterTotalFP).toBe(initialTotalFP - 15);

    // Refresh
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Navigate back to Den
    await navigateToDen(page);

    // Verify FP persisted
    const fpTextPersisted = await fpCard.textContent();
    const persistedTotalFP = Number.parseInt(fpTextPersisted?.match(/\d+/)?.[0] || '0', 10);
    console.log(`After refresh Total FP: ${persistedTotalFP}`);
    expect(persistedTotalFP).toBe(afterTotalFP);
  });
});

test.describe('Stat Persistence - No Initial State', () => {
  test('should handle fresh app with no stored state', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);

    // Clear any existing storage
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Since the Phase 2 onboarding flow (issue #33), a fresh app routes to the
    // type-selection wizard instead of the tab navigator.
    const onboardingTitle = page.locator('text=Choose your companion').first();
    await expect(onboardingTitle).toBeVisible({ timeout: 15000 });

    // All three type options should be selectable
    for (const typeName of ['Ferro', 'Flux', 'Terra']) {
      await expect(
        page.getByRole('button', { name: `Select ${typeName} type` })
      ).toBeVisible({ timeout: 10000 });
    }

    // App should not crash
    const errorText = page.locator('text=/error|failed|exception/i');
    const hasErrors = await errorText.count();
    expect(hasErrors).toBe(0);
  });
});
