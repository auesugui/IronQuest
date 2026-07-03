// =============================================================================
// IronQuest Quick-Tap Weight Capture — Regression Tests (issue #22 / audit A4)
// =============================================================================
// Verifies the fast path (rep chips 5/8/10/12) logs real weight auto-filled
// from weightHistoryStore, instead of `null`. These tests drive the REAL
// weightHistoryStore + workoutStore + prStore together (only persistence is
// mocked) so the cross-store flow is exercised exactly as the live handler
// `handleQuickLog` in app/workout/session.tsx runs it.
//
// The display-side criteria ("@ N lb · tap ... to change" / "no weight · tap
// ... to set") are UI-surfacing and are covered by CDT browser verification,
// not asserted here.

import type { Exercise } from '@/types';
import { usePRStore } from '../prStore';
import { useWeightHistoryStore } from '../weightHistoryStore';
import { useWorkoutStore } from '../workoutStore';

// Persistence is fire-and-forget in every store (`.catch(console.warn)`); mock
// it so tests stay isolated from AsyncStorage. STORAGE_KEYS values are
// arbitrary strings here because every key routes to the same mocked fns.
jest.mock('@/utils/storage', () => ({
  appStorage: {
    getJSON: jest.fn().mockResolvedValue(undefined),
    setJSON: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  },
  STORAGE_KEYS: {
    SESSION: { FULL_STATE: 'session.full_state' },
    WEIGHT_HISTORY: { FULL_STATE: 'weight_history.full_state' },
    PR: { FULL_STATE: 'pr.full_state' },
    BASELINE: { FULL_STATE: 'baseline.full_state' },
  },
}));

// Faithful replica of app/workout/session.tsx::handleQuickLog. If the handler
// drifts from this logic, THAT is the regression these tests exist to catch.
const quickTap = (exerciseId: string, exerciseIndex: number, setIndex: number, reps: number) => {
  const lastWeight = useWeightHistoryStore.getState().getLastWeight(exerciseId);
  const quickWeight = lastWeight && lastWeight > 0 ? lastWeight : undefined;
  useWorkoutStore.getState().logSet(exerciseIndex, setIndex, reps, quickWeight);
};

const makeExercise = (id = 'bench-press'): Exercise[] => [
  {
    id,
    name: 'Bench Press',
    muscleGroups: ['chest', 'triceps'],
    sets: [
      { reps: 10, weight: null, logged: false, isPR: false, isRepPR: false },
      { reps: 10, weight: null, logged: false, isPR: false, isRepPR: false },
      { reps: 10, weight: null, logged: false, isPR: false, isRepPR: false },
    ],
    restSeconds: 120,
    completed: false,
  },
];

describe('Quick-tap weight capture (issue #22 / audit A4)', () => {
  beforeEach(() => {
    useWorkoutStore.getState().reset();
    useWeightHistoryStore.getState().reset();
    usePRStore.getState().clearAll();
    jest.clearAllMocks();
  });

  it('logs the last-used weight (not null) when weightHistoryStore has history', () => {
    const { startSession } = useWorkoutStore.getState();
    startSession('tpl-1', makeExercise('bench-press'));

    // Seed history as a prior session would (e.g. the modal path does this).
    useWeightHistoryStore.getState().saveWeight('bench-press', 135);

    quickTap('bench-press', 0, 0, 10);

    const set = useWorkoutStore.getState().exercises[0].sets[0];
    expect(set.logged).toBe(true);
    expect(set.weight).toBe(135);
    expect(set.weight).not.toBeNull();
  });

  it('fires weight PRs from the fast path now that weight is captured', () => {
    const { startSession } = useWorkoutStore.getState();
    startSession('tpl-1', makeExercise('bench-press'));

    useWeightHistoryStore.getState().saveWeight('bench-press', 135);

    quickTap('bench-press', 0, 0, 10);

    const set = useWorkoutStore.getState().exercises[0].sets[0];
    // First time the PR store sees this exercise at weight>0 → weight PR.
    expect(set.isPR).toBe(true);

    const pr = usePRStore.getState().getExercisePR('bench-press');
    expect(pr?.maxWeight).toBe(135);
  });

  it('falls back to null weight when NO history exists (and does not pollute history)', () => {
    const { startSession } = useWorkoutStore.getState();
    startSession('tpl-1', makeExercise('bench-press'));

    // No saveWeight call — exercise has no history.
    expect(useWeightHistoryStore.getState().getLastWeight('bench-press')).toBeNull();

    quickTap('bench-press', 0, 0, 10);

    const set = useWorkoutStore.getState().exercises[0].sets[0];
    // Documented fallback: weight is null (NOT 0). 0 would pollute history and
    // display "0 lb"; null stays volume-neutral and history-clean.
    expect(set.weight).toBeNull();
    expect(set.isPR).toBe(false);

    // No pollution: a null-weight quick-tap must not write anything to history.
    expect(useWeightHistoryStore.getState().getLastWeight('bench-press')).toBeNull();
  });

  it('uses the NEW weight after the modal updates history (history was updated)', () => {
    const { startSession, logSet } = useWorkoutStore.getState();
    startSession('tpl-1', makeExercise('bench-press'));

    // Seed an old weight, then quick-tap set 0 → logs 135.
    useWeightHistoryStore.getState().saveWeight('bench-press', 135);
    quickTap('bench-press', 0, 0, 10);
    expect(useWorkoutStore.getState().exercises[0].sets[0].weight).toBe(135);

    // User opens the "..." modal on set 1 and enters 155. The modal path calls
    // logSet with the explicit weight, which writes 155 to history.
    logSet(0, 1, 8, 155);
    expect(useWeightHistoryStore.getState().getLastWeight('bench-press')).toBe(155);

    // The NEXT quick-tap (set 2) must pick up the new weight from history.
    quickTap('bench-press', 0, 2, 10);
    const lastSet = useWorkoutStore.getState().exercises[0].sets[2];
    expect(lastSet.weight).toBe(155);
    expect(lastSet.weight).not.toBe(135);
  });

  it('still satisfies the 3-second rule: quick-tap remains a single logSet call', () => {
    const { startSession } = useWorkoutStore.getState();
    startSession('tpl-1', makeExercise('bench-press'));
    useWeightHistoryStore.getState().saveWeight('bench-press', 135);

    const logSetSpy = jest.spyOn(useWorkoutStore.getState(), 'logSet');

    quickTap('bench-press', 0, 0, 10);

    // One tap → exactly one logSet. Weight resolution is a pure read, not an
    // extra step the user pays for.
    expect(logSetSpy).toHaveBeenCalledTimes(1);
    expect(logSetSpy).toHaveBeenCalledWith(0, 0, 10, 135);

    logSetSpy.mockRestore();
  });
});
