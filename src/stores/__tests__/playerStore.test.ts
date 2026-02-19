// =============================================================================
// IronQuest Player Store Unit Tests
// =============================================================================
// Tests for FP balances, spending, streak logic, and achievements

import { usePlayerStore, selectTotalFP, selectCanAfford, selectStreakDays } from '../playerStore';
import { appStorage, STORAGE_KEYS } from '@/utils/storage';

// Mock storage
jest.mock('@/utils/storage', () => ({
  appStorage: {
    getJSON: jest.fn(),
    setJSON: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
  },
  STORAGE_KEYS: {
    PLAYER: {
      FULL_STATE: 'player.full_state',
    },
  },
}));

describe('Player Store', () => {
  beforeEach(() => {
    usePlayerStore.getState().reset();
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // FP Actions
  // ---------------------------------------------------------------------------

  describe('FP Actions', () => {
    describe('addFP', () => {
      it('should add FP to specific type', () => {
        const { addFP } = usePlayerStore.getState();

        addFP('power', 50);

        expect(usePlayerStore.getState().fp.power).toBe(50);
      });

      it('should accumulate FP', () => {
        const { addFP } = usePlayerStore.getState();

        addFP('power', 25);
        addFP('power', 25);

        expect(usePlayerStore.getState().fp.power).toBe(50);
      });

      it('should add to generic FP', () => {
        const { addFP } = usePlayerStore.getState();

        addFP('generic', 100);

        expect(usePlayerStore.getState().fp.generic).toBe(100);
      });

      it('should not go negative', () => {
        const { addFP } = usePlayerStore.getState();

        addFP('power', -50);

        expect(usePlayerStore.getState().fp.power).toBe(0);
      });

      it('should persist after adding', () => {
        const { addFP } = usePlayerStore.getState();

        addFP('power', 50);

        expect(appStorage.setJSON).toHaveBeenCalled();
      });
    });

    describe('addMultipleFP', () => {
      it('should add multiple FP types at once', () => {
        const { addMultipleFP } = usePlayerStore.getState();

        addMultipleFP({
          power: 50,
          guard: 30,
          speed: 20,
        });

        const { fp } = usePlayerStore.getState();
        expect(fp.power).toBe(50);
        expect(fp.guard).toBe(30);
        expect(fp.speed).toBe(20);
      });

      it('should only add specified types', () => {
        const { addMultipleFP } = usePlayerStore.getState();

        addMultipleFP({ power: 50 });

        const { fp } = usePlayerStore.getState();
        expect(fp.power).toBe(50);
        expect(fp.guard).toBe(0);
      });
    });

    describe('spendFP', () => {
      beforeEach(() => {
        usePlayerStore.setState({
          fp: {
            generic: 100,
            power: 50,
            guard: 0,
            speed: 0,
            vigor: 0,
            focus: 0,
            spirit: 20,
          },
        });
      });

      it('should return true and deduct FP when enough available', () => {
        const { spendFP } = usePlayerStore.getState();

        const result = spendFP('power', 25);

        expect(result).toBe(true);
        expect(usePlayerStore.getState().fp.power).toBe(25);
      });

      it('should return false when not enough FP', () => {
        const { spendFP } = usePlayerStore.getState();

        const result = spendFP('power', 100);

        expect(result).toBe(false);
        expect(usePlayerStore.getState().fp.power).toBe(50);
      });

      it('should deduct from generic FP', () => {
        const { spendFP } = usePlayerStore.getState();

        const result = spendFP('generic', 50);

        expect(result).toBe(true);
        expect(usePlayerStore.getState().fp.generic).toBe(50);
      });

      it('should deduct from spirit FP', () => {
        const { spendFP } = usePlayerStore.getState();

        const result = spendFP('spirit', 10);

        expect(result).toBe(true);
        expect(usePlayerStore.getState().fp.spirit).toBe(10);
      });

      it('should not go negative after spend', () => {
        const { spendFP } = usePlayerStore.getState();

        spendFP('power', 60);

        expect(usePlayerStore.getState().fp.power).toBe(50);
      });

      it('should persist after spending', () => {
        const { spendFP } = usePlayerStore.getState();

        spendFP('power', 25);

        expect(appStorage.setJSON).toHaveBeenCalled();
      });
    });

    describe('setFP', () => {
      it('should replace all FP values', () => {
        const { setFP } = usePlayerStore.getState();

        setFP({
          generic: 200,
          power: 100,
          guard: 50,
          speed: 25,
          vigor: 10,
          focus: 5,
          spirit: 0,
        });

        const { fp } = usePlayerStore.getState();
        expect(fp.generic).toBe(200);
        expect(fp.power).toBe(100);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Streak Actions
  // ---------------------------------------------------------------------------

  describe('Streak Actions', () => {
    describe('updateStreak', () => {
      it('should start streak at 1 for first workout', () => {
        const { updateStreak } = usePlayerStore.getState();

        updateStreak(true);

        expect(usePlayerStore.getState().streak.current).toBe(1);
      });

      it('should increment streak for consecutive days', () => {
        const { updateStreak } = usePlayerStore.getState();

        // First workout
        updateStreak(true);
        expect(usePlayerStore.getState().streak.current).toBe(1);

        // Simulate next day
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        usePlayerStore.setState({
          streak: {
            current: 1,
            longest: 1,
            lastWorkoutDate: yesterday,
          },
        });

        // Second day workout
        updateStreak(true);
        expect(usePlayerStore.getState().streak.current).toBe(2);
      });

      it('should reset streak when missing a day', () => {
        const { updateStreak } = usePlayerStore.getState();

        // First workout
        updateStreak(true);

        // Simulate 2 days ago (missed yesterday)
        const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0];
        usePlayerStore.setState({
          streak: {
            current: 5,
            longest: 5,
            lastWorkoutDate: twoDaysAgo,
          },
        });

        // Workout today - streak should reset to 1
        updateStreak(true);
        expect(usePlayerStore.getState().streak.current).toBe(1);
      });

      it('should not increment for same day workout', () => {
        const { updateStreak } = usePlayerStore.getState();

        updateStreak(true);
        updateStreak(true); // Same day

        expect(usePlayerStore.getState().streak.current).toBe(1);
      });

      it('should update longest streak', () => {
        const { updateStreak } = usePlayerStore.getState();

        // Start streak
        updateStreak(true);

        // Simulate building streak
        for (let i = 0; i < 5; i++) {
          const prevDate = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];
          usePlayerStore.setState({
            streak: {
              current: i + 1,
              longest: i + 1,
              lastWorkoutDate: prevDate,
            },
          });
          updateStreak(true);
        }

        expect(usePlayerStore.getState().streak.longest).toBeGreaterThanOrEqual(5);
      });

      it('should not update longest when current is lower', () => {
        const { updateStreak } = usePlayerStore.getState();

        // Set up a long existing streak
        usePlayerStore.setState({
          streak: {
            current: 0,
            longest: 30,
            lastWorkoutDate: null,
          },
        });

        updateStreak(true);

        // Longest should still be 30
        expect(usePlayerStore.getState().streak.longest).toBe(30);
      });
    });

    describe('resetStreak', () => {
      it('should reset current streak to 0', () => {
        const { resetStreak } = usePlayerStore.getState();

        usePlayerStore.setState({
          streak: { current: 10, longest: 10, lastWorkoutDate: '2024-01-01' },
        });

        resetStreak();

        expect(usePlayerStore.getState().streak.current).toBe(0);
      });

      it('should preserve longest streak', () => {
        const { resetStreak } = usePlayerStore.getState();

        usePlayerStore.setState({
          streak: { current: 10, longest: 15, lastWorkoutDate: '2024-01-01' },
        });

        resetStreak();

        expect(usePlayerStore.getState().streak.longest).toBe(15);
      });

      it('should clear lastWorkoutDate', () => {
        const { resetStreak } = usePlayerStore.getState();

        usePlayerStore.setState({
          streak: { current: 10, longest: 10, lastWorkoutDate: '2024-01-01' },
        });

        resetStreak();

        expect(usePlayerStore.getState().streak.lastWorkoutDate).toBeNull();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Workout Actions
  // ---------------------------------------------------------------------------

  describe('Workout Actions', () => {
    describe('incrementWorkoutCount', () => {
      it('should increment total workouts', () => {
        const { incrementWorkoutCount } = usePlayerStore.getState();

        incrementWorkoutCount();
        incrementWorkoutCount();
        incrementWorkoutCount();

        expect(usePlayerStore.getState().totalWorkouts).toBe(3);
      });

      it('should persist workout count', () => {
        const { incrementWorkoutCount } = usePlayerStore.getState();

        incrementWorkoutCount();

        expect(appStorage.setJSON).toHaveBeenCalled();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Profile Actions
  // ---------------------------------------------------------------------------

  describe('Profile Actions', () => {
    describe('updateProfile', () => {
      it('should update profile fields', () => {
        const { updateProfile } = usePlayerStore.getState();

        updateProfile({ name: 'New Name' });

        expect(usePlayerStore.getState().profile.name).toBe('New Name');
      });

      it('should merge with existing profile', () => {
        const { updateProfile } = usePlayerStore.getState();

        updateProfile({ name: 'Name 1' });
        updateProfile({ avatar: 'avatar.png' });

        const { profile } = usePlayerStore.getState();
        expect(profile.name).toBe('Name 1');
        expect(profile.avatar).toBe('avatar.png');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Achievement Actions
  // ---------------------------------------------------------------------------

  describe('Achievement Actions', () => {
    describe('unlockAchievement', () => {
      it('should add achievement to list', () => {
        const { unlockAchievement } = usePlayerStore.getState();

        const result = unlockAchievement('first-workout');

        expect(result).toBe(true);
        expect(usePlayerStore.getState().achievements).toContain('first-workout');
      });

      it('should return false for duplicate achievement', () => {
        const { unlockAchievement } = usePlayerStore.getState();

        unlockAchievement('first-workout');
        const result = unlockAchievement('first-workout');

        expect(result).toBe(false);
      });

      it('should not add duplicate achievements', () => {
        const { unlockAchievement } = usePlayerStore.getState();

        unlockAchievement('first-workout');
        unlockAchievement('first-workout');

        expect(usePlayerStore.getState().achievements).toHaveLength(1);
      });
    });

    describe('removeAchievement', () => {
      it('should remove achievement from list', () => {
        const { unlockAchievement, removeAchievement } = usePlayerStore.getState();

        unlockAchievement('first-workout');
        removeAchievement('first-workout');

        expect(usePlayerStore.getState().achievements).not.toContain('first-workout');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Hydration
  // ---------------------------------------------------------------------------

  describe('Hydration', () => {
    describe('hydrate', () => {
      it('should restore player state from storage', async () => {
        const mockPlayer = {
          profile: { name: 'Test User', avatar: null, createdAt: '2024-01-01' },
          fp: {
            generic: 100,
            power: 50,
            guard: 30,
            speed: 20,
            vigor: 10,
            focus: 5,
            spirit: 15,
          },
          streak: { current: 5, longest: 10, lastWorkoutDate: '2024-01-15' },
          achievements: ['first-workout', 'streak-7'],
          totalWorkouts: 25,
        };

        (appStorage.getJSON as jest.Mock).mockResolvedValue(mockPlayer);

        const { hydrate } = usePlayerStore.getState();
        await hydrate();

        const state = usePlayerStore.getState();
        expect(state.fp.generic).toBe(100);
        expect(state.fp.power).toBe(50);
        expect(state.streak.current).toBe(5);
        expect(state.totalWorkouts).toBe(25);
        expect(state.achievements).toContain('first-workout');
      });

      it('should handle empty storage gracefully', async () => {
        (appStorage.getJSON as jest.Mock).mockResolvedValue(undefined);

        const { hydrate } = usePlayerStore.getState();
        await hydrate();

        const state = usePlayerStore.getState();
        expect(state.fp.generic).toBe(0);
        expect(state.streak.current).toBe(0);
      });

      it('should handle storage errors gracefully', async () => {
        (appStorage.getJSON as jest.Mock).mockRejectedValue(new Error('Storage error'));

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        const { hydrate } = usePlayerStore.getState();
        await hydrate();

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });

      it('should use defaults for missing fields', async () => {
        const mockPlayer = {
          // Only partial data
          fp: { power: 50 },
        };

        (appStorage.getJSON as jest.Mock).mockResolvedValue(mockPlayer);

        const { hydrate } = usePlayerStore.getState();
        await hydrate();

        const state = usePlayerStore.getState();
        // Should have defaults for missing fields
        expect(state.streak.current).toBe(0);
        expect(state.achievements).toEqual([]);
      });
    });

    describe('reset', () => {
      it('should clear all player state', () => {
        const { addFP, reset } = usePlayerStore.getState();

        addFP('power', 50);
        reset();

        const state = usePlayerStore.getState();
        expect(state.fp.power).toBe(0);
        expect(state.streak.current).toBe(0);
        expect(state.achievements).toEqual([]);
      });

      it('should delete player from storage', () => {
        const { reset } = usePlayerStore.getState();

        reset();

        expect(appStorage.delete).toHaveBeenCalledWith(STORAGE_KEYS.PLAYER.FULL_STATE);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Selectors
  // ---------------------------------------------------------------------------

  describe('Selectors', () => {
    beforeEach(() => {
      usePlayerStore.setState({
        fp: {
          generic: 100,
          power: 50,
          guard: 30,
          speed: 20,
          vigor: 10,
          focus: 5,
          spirit: 15,
        },
        streak: { current: 7, longest: 14, lastWorkoutDate: new Date().toISOString().split('T')[0] },
      });
    });

    describe('selectTotalFP', () => {
      it('should return sum of all FP types', () => {
        const state = usePlayerStore.getState();

        const total = selectTotalFP(state);

        // 100 + 50 + 30 + 20 + 10 + 5 + 15 = 230
        expect(total).toBe(230);
      });
    });

    describe('selectCanAfford', () => {
      it('should return true when enough FP', () => {
        const state = usePlayerStore.getState();

        const canAfford = selectCanAfford('power', 25)(state);

        expect(canAfford).toBe(true);
      });

      it('should return false when not enough FP', () => {
        const state = usePlayerStore.getState();

        const canAfford = selectCanAfford('guard', 100)(state);

        expect(canAfford).toBe(false);
      });

      it('should return true for exact amount', () => {
        const state = usePlayerStore.getState();

        const canAfford = selectCanAfford('power', 50)(state);

        expect(canAfford).toBe(true);
      });
    });

    describe('selectStreakDays', () => {
      it('should return current streak days', () => {
        const state = usePlayerStore.getState();

        const days = selectStreakDays(state);

        expect(days).toBe(7);
      });
    });
  });
});
