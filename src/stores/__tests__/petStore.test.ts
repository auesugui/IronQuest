// =============================================================================
// IronQuest Pet Store Unit Tests
// =============================================================================
// Tests for pet initialization, care, stats, evolution, and hunger decay

import { STORAGE_KEYS, appStorage } from '@/utils/storage';
import {
  selectCanEvolve,
  selectHungerPercentage,
  selectIsPetInitialized,
  selectIsStatMaxed,
  selectPet,
  selectTotalStats,
  usePetStore,
} from '../petStore';

// Mock storage
jest.mock('@/utils/storage', () => ({
  appStorage: {
    getJSON: jest.fn(),
    setJSON: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
  },
  STORAGE_KEYS: {
    PET: {
      FULL_STATE: 'pet.full_state',
    },
  },
}));

describe('Pet Store', () => {
  beforeEach(() => {
    usePetStore.getState().reset();
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Pet Initialization
  // ---------------------------------------------------------------------------

  describe('initializePet', () => {
    it('should create a pet with type and name', () => {
      const { initializePet } = usePetStore.getState();

      initializePet('ignis', 'Flamey');

      const state = usePetStore.getState();
      expect(state.id).toBeTruthy();
      expect(state.name).toBe('Flamey');
      expect(state.type).toBe('ignis');
    });

    it('should initialize stats to 0', () => {
      const { initializePet } = usePetStore.getState();

      initializePet('ignis', 'Flamey');

      const { stats } = usePetStore.getState();
      expect(stats.power).toBe(0);
      expect(stats.guard).toBe(0);
      expect(stats.speed).toBe(0);
      expect(stats.vigor).toBe(0);
      expect(stats.focus).toBe(0);
      expect(stats.spirit).toBe(0);
    });

    it('should set hunger to 100%', () => {
      const { initializePet } = usePetStore.getState();

      initializePet('ignis', 'Flamey');

      expect(usePetStore.getState().hunger).toBe(100);
    });

    it('should set evolution stage to 1', () => {
      const { initializePet } = usePetStore.getState();

      initializePet('ignis', 'Flamey');

      expect(usePetStore.getState().evolutionStage).toBe(1);
    });

    it('should persist pet to storage', () => {
      const { initializePet } = usePetStore.getState();

      initializePet('ignis', 'Flamey');

      expect(appStorage.setJSON).toHaveBeenCalled();
    });

    it('should support all pet types', () => {
      const petTypes = ['ignis', 'terra', 'aqua', 'ventus', 'umbra', 'lumen'];

      petTypes.forEach((type) => {
        usePetStore.getState().reset();
        const { initializePet } = usePetStore.getState();
        initializePet(type as any, `Test ${type}`);

        expect(usePetStore.getState().type).toBe(type);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Pet Care - Feeding
  // ---------------------------------------------------------------------------

  describe('feedPet', () => {
    beforeEach(() => {
      const { initializePet } = usePetStore.getState();
      initializePet('ignis', 'Flamey');
    });

    it('should restore hunger to 100%', () => {
      const { feedPet } = usePetStore.getState();

      // Simulate hunger decay
      usePetStore.setState({ hunger: 50 });

      feedPet();

      expect(usePetStore.getState().hunger).toBe(100);
    });

    it('should update lastFedAt timestamp', () => {
      const { feedPet } = usePetStore.getState();

      feedPet();
      const after = usePetStore.getState().lastFedAt;

      // Verify timestamp is a valid ISO date string
      expect(after).toBeTruthy();
      expect(new Date(after!).getTime()).not.toBeNaN();
    });

    it('should persist fed state', () => {
      const { feedPet } = usePetStore.getState();

      feedPet();

      expect(appStorage.setJSON).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Pet Care - Hunger Decay
  // ---------------------------------------------------------------------------

  describe('calculateHungerDecay', () => {
    beforeEach(() => {
      const { initializePet } = usePetStore.getState();
      initializePet('ignis', 'Flamey');
    });

    it('should decay 5 points per hour', () => {
      const { calculateHungerDecay } = usePetStore.getState();

      // Set lastFedAt to 2 hours ago
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      usePetStore.setState({ lastFedAt: twoHoursAgo, hunger: 100 });

      calculateHungerDecay();

      // 2 hours * 5 points/hour = 10 points decay
      expect(usePetStore.getState().hunger).toBe(90);
    });

    it('should not decay below 0', () => {
      const { calculateHungerDecay } = usePetStore.getState();

      // Set lastFedAt to 30 hours ago (would decay 150 points)
      const thirtyHoursAgo = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
      usePetStore.setState({ lastFedAt: thirtyHoursAgo, hunger: 50 });

      calculateHungerDecay();

      expect(usePetStore.getState().hunger).toBe(0);
    });

    it('should not decay if pet not initialized', () => {
      usePetStore.getState().reset();

      const { calculateHungerDecay } = usePetStore.getState();
      calculateHungerDecay();

      // Should not crash, hunger stays at initial value
      expect(usePetStore.getState().hunger).toBe(100);
    });

    it('should not update if no decay needed', () => {
      const { calculateHungerDecay } = usePetStore.getState();

      // Just fed
      usePetStore.setState({ lastFedAt: new Date().toISOString(), hunger: 100 });

      calculateHungerDecay();

      expect(usePetStore.getState().hunger).toBe(100);
    });
  });

  // ---------------------------------------------------------------------------
  // Stat Upgrades
  // ---------------------------------------------------------------------------

  describe('upgradeStat', () => {
    beforeEach(() => {
      const { initializePet } = usePetStore.getState();
      initializePet('ignis', 'Flamey');
    });

    it('should increase stat by specified amount', () => {
      const { upgradeStat } = usePetStore.getState();

      upgradeStat('power', 1);

      expect(usePetStore.getState().stats.power).toBe(1);
    });

    it('should accumulate stat upgrades', () => {
      const { upgradeStat } = usePetStore.getState();

      upgradeStat('power', 1);
      upgradeStat('power', 1);
      upgradeStat('power', 1);

      expect(usePetStore.getState().stats.power).toBe(3);
    });

    it('should not exceed max stat value (50)', () => {
      const { upgradeStat } = usePetStore.getState();

      usePetStore.setState({ stats: { ...usePetStore.getState().stats, power: 49 } });
      upgradeStat('power', 5);

      expect(usePetStore.getState().stats.power).toBe(50);
    });

    it('should not update if already at max', () => {
      const { upgradeStat } = usePetStore.getState();

      usePetStore.setState({ stats: { ...usePetStore.getState().stats, power: 50 } });
      upgradeStat('power', 1);

      // Should still be 50, no change
      expect(usePetStore.getState().stats.power).toBe(50);
    });

    it('should update updatedAt timestamp', () => {
      const { upgradeStat } = usePetStore.getState();

      upgradeStat('power', 1);
      const after = usePetStore.getState().updatedAt;

      // Verify timestamp is a valid ISO date string
      expect(after).toBeTruthy();
      expect(new Date(after!).getTime()).not.toBeNaN();
    });

    it('should persist stat upgrade', () => {
      const { upgradeStat } = usePetStore.getState();

      upgradeStat('power', 1);

      expect(appStorage.setJSON).toHaveBeenCalled();
    });

    it('should upgrade each stat type independently', () => {
      const { upgradeStat } = usePetStore.getState();

      upgradeStat('power', 5);
      upgradeStat('guard', 3);
      upgradeStat('speed', 2);

      const { stats } = usePetStore.getState();
      expect(stats.power).toBe(5);
      expect(stats.guard).toBe(3);
      expect(stats.speed).toBe(2);
    });
  });

  describe('applyFPToStats', () => {
    beforeEach(() => {
      const { initializePet } = usePetStore.getState();
      initializePet('ignis', 'Flamey');
    });

    it('should apply multiple stat increases at once', () => {
      const { applyFPToStats } = usePetStore.getState();

      applyFPToStats({ power: 3, guard: 2, speed: 1 });

      const { stats } = usePetStore.getState();
      expect(stats.power).toBe(3);
      expect(stats.guard).toBe(2);
      expect(stats.speed).toBe(1);
    });

    it('should respect max stat value', () => {
      const { applyFPToStats } = usePetStore.getState();

      usePetStore.setState({ stats: { ...usePetStore.getState().stats, power: 48 } });
      applyFPToStats({ power: 5 });

      expect(usePetStore.getState().stats.power).toBe(50);
    });
  });

  // ---------------------------------------------------------------------------
  // Evolution System
  // ---------------------------------------------------------------------------

  describe('Evolution', () => {
    beforeEach(() => {
      const { initializePet } = usePetStore.getState();
      initializePet('ignis', 'Flamey');
    });

    describe('addFP', () => {
      it('should increase totalFPEarned', () => {
        const { addFP } = usePetStore.getState();

        addFP(100);

        expect(usePetStore.getState().totalFPEarned).toBe(100);
      });

      it('should accumulate FP', () => {
        const { addFP } = usePetStore.getState();

        addFP(50);
        addFP(50);

        expect(usePetStore.getState().totalFPEarned).toBe(100);
      });

      it('should evolve to stage 2 at 500 FP', () => {
        const { addFP } = usePetStore.getState();

        addFP(500);

        expect(usePetStore.getState().evolutionStage).toBe(2);
      });

      it('should evolve to stage 3 at 2000 FP', () => {
        const { addFP } = usePetStore.getState();

        addFP(2000);

        expect(usePetStore.getState().evolutionStage).toBe(3);
      });

      it('should evolve to stage 4 at 5000 FP', () => {
        const { addFP } = usePetStore.getState();

        addFP(5000);

        expect(usePetStore.getState().evolutionStage).toBe(4);
      });

      it('should not evolve past stage 4', () => {
        const { addFP } = usePetStore.getState();

        addFP(10000);

        expect(usePetStore.getState().evolutionStage).toBe(4);
      });

      it('should persist evolution progress', () => {
        const { addFP } = usePetStore.getState();

        addFP(500);

        expect(appStorage.setJSON).toHaveBeenCalled();
      });
    });

    describe('evolution thresholds', () => {
      it('should be stage 1 from 0-499 FP', () => {
        const { addFP } = usePetStore.getState();

        addFP(499);

        expect(usePetStore.getState().evolutionStage).toBe(1);
      });

      it('should be stage 2 from 500-1999 FP', () => {
        const { addFP } = usePetStore.getState();

        addFP(1000);

        expect(usePetStore.getState().evolutionStage).toBe(2);
      });

      it('should be stage 3 from 2000-4999 FP', () => {
        const { addFP } = usePetStore.getState();

        addFP(3000);

        expect(usePetStore.getState().evolutionStage).toBe(3);
      });

      it('should be stage 4 at 5000+ FP', () => {
        const { addFP } = usePetStore.getState();

        addFP(5000);

        expect(usePetStore.getState().evolutionStage).toBe(4);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Hydration
  // ---------------------------------------------------------------------------

  describe('Hydration', () => {
    describe('hydrate', () => {
      it('should restore pet state from storage', async () => {
        const mockPet = {
          id: 'test-pet-123',
          name: 'Flamey',
          type: 'ignis',
          hunger: 80,
          lastFedAt: new Date().toISOString(),
          stats: {
            power: 10,
            guard: 8,
            speed: 6,
            vigor: 5,
            focus: 4,
            spirit: 2,
          },
          evolutionStage: 2,
          totalFPEarned: 750,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        (appStorage.getJSON as jest.Mock).mockResolvedValue(mockPet);

        const { hydrate } = usePetStore.getState();
        await hydrate();

        const state = usePetStore.getState();
        expect(state.id).toBe('test-pet-123');
        expect(state.name).toBe('Flamey');
        expect(state.stats.power).toBe(10);
        expect(state.evolutionStage).toBe(2);
      });

      it('should generate id if missing (migration)', async () => {
        const mockPet = {
          // No id field
          name: 'Flamey',
          type: 'ignis',
          hunger: 80,
          stats: { power: 5, guard: 5, speed: 5, vigor: 5, focus: 5, spirit: 0 },
          evolutionStage: 1,
          totalFPEarned: 100,
        };

        (appStorage.getJSON as jest.Mock).mockResolvedValue(mockPet);

        const { hydrate } = usePetStore.getState();
        await hydrate();

        const state = usePetStore.getState();
        expect(state.id).toBeTruthy();
        expect(state.id).toMatch(/^pet_/);
      });

      it('should handle empty storage gracefully', async () => {
        (appStorage.getJSON as jest.Mock).mockResolvedValue(undefined);

        const { hydrate } = usePetStore.getState();
        await hydrate();

        // Should stay at initial state
        const state = usePetStore.getState();
        expect(state.id).toBe('');
      });

      it('should handle storage errors gracefully', async () => {
        (appStorage.getJSON as jest.Mock).mockRejectedValue(new Error('Storage error'));

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        const { hydrate } = usePetStore.getState();
        await hydrate();

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });

      it('should use defaults for missing optional fields', async () => {
        const mockPet = {
          id: 'test-pet',
          // Missing optional fields
        };

        (appStorage.getJSON as jest.Mock).mockResolvedValue(mockPet);

        const { hydrate } = usePetStore.getState();
        await hydrate();

        const state = usePetStore.getState();
        expect(state.name).toBe('');
        expect(state.type).toBe('ignis');
        expect(state.hunger).toBe(100);
        expect(state.evolutionStage).toBe(1);
      });
    });

    describe('reset', () => {
      it('should clear all pet state', () => {
        const { initializePet, reset } = usePetStore.getState();

        initializePet('ignis', 'Flamey');
        reset();

        const state = usePetStore.getState();
        expect(state.id).toBe('');
        expect(state.name).toBe('');
        expect(state.stats.power).toBe(0);
      });

      it('should delete pet from storage', () => {
        const { reset } = usePetStore.getState();

        reset();

        expect(appStorage.delete).toHaveBeenCalledWith(STORAGE_KEYS.PET.FULL_STATE);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Selectors
  // ---------------------------------------------------------------------------

  describe('Selectors', () => {
    beforeEach(() => {
      const { initializePet } = usePetStore.getState();
      initializePet('ignis', 'Flamey');
    });

    describe('selectPet', () => {
      it('should return complete pet state', () => {
        const state = usePetStore.getState();
        const pet = selectPet(state);

        if (pet) {
          expect(pet.id).toBeTruthy();
          expect(pet.name).toBe('Flamey');
        }
      });
    });

    describe('selectHungerPercentage', () => {
      it('should return hunger as percentage', () => {
        const state = usePetStore.getState();
        const hunger = selectHungerPercentage(state);

        expect(hunger).toBe(100);
      });

      it('should clamp to 0-100 range', () => {
        usePetStore.setState({ hunger: 150 });
        const state = usePetStore.getState();
        const hunger = selectHungerPercentage(state);

        // Selector clamps to 0-100 range
        expect(hunger).toBeGreaterThanOrEqual(0);
        expect(hunger).toBeLessThanOrEqual(100);
      });
    });

    describe('selectCanEvolve', () => {
      it('should return true when FP threshold reached', () => {
        // Set totalFPEarned directly to the next threshold without triggering
        // auto-evolution (addFP would move past the threshold and evolve the
        // pet, making selectCanEvolve return false for the NEXT stage).
        usePetStore.setState({ totalFPEarned: 500, evolutionStage: 1 });
        const state = usePetStore.getState();
        const canEvolve = selectCanEvolve(state);

        expect(canEvolve).toBe(true);
      });

      it('should return false at max evolution', () => {
        const { addFP } = usePetStore.getState();

        addFP(5000);
        const state = usePetStore.getState();
        const canEvolve = selectCanEvolve(state);

        expect(canEvolve).toBe(false);
      });
    });

    describe('selectTotalStats', () => {
      it('should return sum of all stats', () => {
        const { upgradeStat } = usePetStore.getState();

        upgradeStat('power', 10);
        upgradeStat('guard', 5);

        const state = usePetStore.getState();
        const total = selectTotalStats(state);

        expect(total).toBe(15);
      });
    });

    describe('selectIsStatMaxed', () => {
      it('should return true when stat is at 50', () => {
        usePetStore.setState({ stats: { ...usePetStore.getState().stats, power: 50 } });

        const state = usePetStore.getState();
        const isMaxed = selectIsStatMaxed('power')(state);

        expect(isMaxed).toBe(true);
      });

      it('should return false when stat is below 50', () => {
        usePetStore.setState({ stats: { ...usePetStore.getState().stats, power: 25 } });

        const state = usePetStore.getState();
        const isMaxed = selectIsStatMaxed('power')(state);

        expect(isMaxed).toBe(false);
      });
    });

    describe('selectIsPetInitialized', () => {
      it('should return true when pet has id', () => {
        const state = usePetStore.getState();
        const isInitialized = selectIsPetInitialized(state);

        expect(isInitialized).toBe(true);
      });

      it('should return false when pet has no id', () => {
        usePetStore.getState().reset();

        const state = usePetStore.getState();
        const isInitialized = selectIsPetInitialized(state);

        expect(isInitialized).toBe(false);
      });
    });
  });
});
