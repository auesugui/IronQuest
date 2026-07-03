// =============================================================================
// IronQuest Tower Configuration
// =============================================================================
// The Battle Tower is Phase 2 — there is no tower store yet. Until it ships,
// the home screen needs *some* value to render for "Tower Floor", and that
// value must not be a literal baked into JSX (so the Phase 2 wiring is a
// one-line change here, not a hunt through components).
//
// Keep this as the single source of truth for the placeholder. Phase 2 replaces
// it with a real selector over the tower store.

/**
 * The player's current tower floor.
 *
 * Phase 1 placeholder — always 1 until the Battle Tower ships (Phase 2).
 * The home-screen Quick Stats read from this constant rather than a hardcoded
 * JSX literal so the swap to a live store value is localized to this file.
 */
export const CURRENT_TOWER_FLOOR = 1;
