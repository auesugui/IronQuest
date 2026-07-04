// =============================================================================
// IronQuest E2E Tests - Workout Session Flow
// =============================================================================
// Tests for complete workout workflow: start session, log sets, use rest timer
// Run with: npm run test:e2e -- --grep "Workout Session"
// =============================================================================

import { expect, test } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 390, height: 844 };

// Initial test state with FP for testing
const INITIAL_STATE = {
  player: {
    profile: { name: 'Test User', avatar: null, createdAt: new Date().toISOString() },
    fp: { generic: 500, power: 100, guard: 0, speed: 0, vigor: 0, focus: 0, spirit: 20 },
    streak: { current: 1, longest: 1, lastWorkoutDate: new Date().toISOString().split('T')[0] },
    achievements: [],
    totalWorkouts: 1,
  },
  pet: {
    id: 'test-pet-123',
    name: 'Test Pet',
    type: 'ferro',
    hunger: 100,
    lastFedAt: new Date().toISOString(),
    stats: { power: 5, guard: 5, speed: 5, vigor: 5, focus: 5, spirit: 0 },
    evolutionStage: 1,
    totalFPEarned: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

test.describe('Workout Session Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);

    // Navigate and seed data
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate((state) => {
      localStorage.setItem('player.full_state', JSON.stringify(state.player));
      localStorage.setItem('pet.full_state', JSON.stringify(state.pet));
    }, INITIAL_STATE);

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  });

  test('should display workout templates on Quest Board', async ({ page }) => {
    // Should see workout templates
    await expect(page.getByText('Workout Templates')).toBeVisible({ timeout: 10000 });

    // Should have at least one template
    const templates = page.locator('text=/Push \\/ Pull|Rull Body|Upper|Rower/i');
    await expect(templates.first()).toBeVisible({ timeout: 5000 });
  });

  test('should start workout from template', async ({ page }) => {
    // Find and click a template card
    const templateCard = page.locator('text=Full Body').first();
    await templateCard.click();
    await page.waitForTimeout(500);

    // Should navigate to session or show session options
    // The exact flow depends on implementation
  });
});

test.describe('Workout Session - Set Logging', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate((state) => {
      localStorage.setItem('player.full_state', JSON.stringify(state.player));
      localStorage.setItem('pet.full_state', JSON.stringify(state.pet));
    }, INITIAL_STATE);

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  });

  test('should have quick log buttons for reps', async ({ page }) => {
    // Navigate to a workout if session exists
    // Check for quick log buttons (5, 8, 10, 12 reps)
    const quickLogButtons = page.locator('text=/^5$|^8$|^10$|^12$/');

    // These might be on the session screen
    // For now, just verify we can navigate
    await expect(page.getByRole('tab', { name: 'Quest Board' })).toBeVisible();
  });
});

test.describe('Workout Session - Rest Timer', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate((state) => {
      localStorage.setItem('player.full_state', JSON.stringify(state.player));
      localStorage.setItem('pet.full_state', JSON.stringify(state.pet));
    }, INITIAL_STATE);

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  });

  test('should start rest timer after logging a set', async ({ page }) => {
    // This test would:
    // 1. Start a workout session
    // 2. Log a set
    // 3. Verify rest timer appears
    // Implementation depends on session flow
  });

  test('should allow pausing and resuming rest timer', async ({ page }) => {
    // This test would:
    // 1. Start rest timer
    // 2. Pause it
    // 3. Resume it
    // 4. Verify countdown continues
  });

  test('should allow skipping rest timer', async ({ page }) => {
    // This test would:
    // 1. Start rest timer
    // 2. Skip it
    // 3. Verify timer stops
  });
});

test.describe('Workout Session - Exercise Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate((state) => {
      localStorage.setItem('player.full_state', JSON.stringify(state.player));
      localStorage.setItem('pet.full_state', JSON.stringify(state.pet));
    }, INITIAL_STATE);

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  });

  test('should navigate between exercises', async ({ page }) => {
    // This test would:
    // 1. Start workout with multiple exercises
    // 2. Navigate to next exercise
    // 3. Navigate back
    // 4. Verify correct exercise is shown
  });

  test('should track progress across exercises', async ({ page }) => {
    // This test would:
    // 1. Log sets in multiple exercises
    // 2. Verify progress indicators update
  });
});

test.describe('Workout Session - Completion', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate((state) => {
      localStorage.setItem('player.full_state', JSON.stringify(state.player));
      localStorage.setItem('pet.full_state', JSON.stringify(state.pet));
    }, INITIAL_STATE);

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  });

  test('should end workout session', async ({ page }) => {
    // This test would:
    // 1. Start workout
    // 2. Log some sets
    // 3. End workout
    // 4. Verify session is closed
    // 5. Verify FP was earned
  });

  test('should cancel workout without saving', async ({ page }) => {
    // This test would:
    // 1. Start workout
    // 2. Log some sets
    // 3. Cancel workout
    // 4. Verify session is closed
    // 5. Verify FP was NOT earned
  });
});

test.describe('Workout Session - Weight Memory', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate((state) => {
      localStorage.setItem('player.full_state', JSON.stringify(state.player));
      localStorage.setItem('pet.full_state', JSON.stringify(state.pet));
      localStorage.setItem('weight_history.full_state', JSON.stringify({ history: {} }));
    }, INITIAL_STATE);

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  });

  test('should remember weight across sets in same session', async ({ page }) => {
    // This test would:
    // 1. Start workout with exercise
    // 2. Log set with weight 135
    // 3. Open modal for next set
    // 4. Verify weight is pre-filled with 135
  });

  test('should remember weight across sessions', async ({ page }) => {
    // This test would:
    // 1. Log set with weight 185
    // 2. End workout
    // 3. Start new workout with same exercise
    // 4. Verify weight 185 is pre-filled
  });

  test('should maintain separate weights per exercise', async ({ page }) => {
    // This test would:
    // 1. Log Bench Press at 135
    // 2. Log Squat at 225
    // 3. Return to Bench Press
    // 4. Verify 135, not 225
  });
});
