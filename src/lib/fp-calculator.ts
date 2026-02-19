// =============================================================================
// IronQuest Set-Level FP Calculator
// =============================================================================
// This module provides set-level FP calculation, breaking down individual
// set contributions for display purposes and PR detection.

import { FP_CONFIG, getStreakMultiplier } from '@/config/fp-values';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * Breakdown of FP earned from a single set
 */
export interface FPBreakdown {
  /** Base completion FP - 100 flat per exercise */
  base: number;
  /** Volume bonus - 1 FP per 10 reps (floor) */
  volumeBonus: number;
  /** Weight PR bonus - 50 FP if new weight record */
  weightPR: number;
  /** Rep PR bonus - 25 FP if more reps at same weight */
  repPR: number;
  /** Streak multiplier - 1.0 to 2.0 based on consecutive days */
  streakMultiplier: number;
  /** Total FP = (base + volumeBonus + weightPR + repPR) * streakMultiplier */
  total: number;
}

/**
 * Parameters for calculating set FP
 */
export interface SetFPParams {
  /** Number of reps completed in this set */
  reps: number;
  /** Weight used (optional, bodyweight exercises may not have weight) */
  weight?: number;
  /** Previous best performance for this exercise */
  previousBest?: {
    /** Best weight ever used for this exercise */
    weight: number;
    /** Most reps completed at the best weight */
    reps: number;
  };
  /** Current streak in consecutive days */
  currentStreak: number;
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/** FP values extracted from config for easy access */
const BASE_FP = FP_CONFIG.base.completion;
const VOLUME_DIVISOR = FP_CONFIG.volume.divisor;
const WEIGHT_PR_BONUS = FP_CONFIG.pr.weight;
const REP_PR_BONUS = FP_CONFIG.pr.rep;

// -----------------------------------------------------------------------------
// Main Calculator
// -----------------------------------------------------------------------------

/**
 * Calculate FP earned from a single set.
 *
 * Formula:
 *   total = (base + volumeBonus + weightPR + repPR) * streakMultiplier
 *
 * Where:
 *   - base: 100 FP flat (per exercise completion)
 *   - volumeBonus: floor(reps / 10) FP
 *   - weightPR: 50 FP if weight > previousBest.weight
 *   - repPR: 25 FP if weight === previousBest.weight AND reps > previousBest.reps
 *   - streakMultiplier: min(1.0 + 0.1 * streakDays, 2.0)
 *
 * @param params - Set parameters including reps, weight, previous best, and streak
 * @returns Detailed breakdown of FP earned
 */
export function calculateSetFP(params: SetFPParams): FPBreakdown {
  const { reps, weight, previousBest, currentStreak } = params;

  // Validate inputs - treat negative reps as 0
  const validReps = Math.max(0, reps);
  const validStreak = Math.max(0, currentStreak);

  // Base FP - always 100 for completing an exercise
  const base = BASE_FP;

  // Volume bonus - 1 FP per 10 reps (floored)
  const volumeBonus = Math.floor(validReps / VOLUME_DIVISOR);

  // PR detection
  const { weightPR, repPR } = detectPRs(validReps, weight, previousBest);

  // Streak multiplier - 1.0 + 0.1 per day, capped at 2.0
  const streakMultiplier = getStreakMultiplier(validStreak);

  // Calculate subtotal and apply multiplier
  const subtotal = base + volumeBonus + weightPR + repPR;
  const total = Math.floor(subtotal * streakMultiplier);

  return {
    base,
    volumeBonus,
    weightPR,
    repPR,
    streakMultiplier,
    total,
  };
}

// -----------------------------------------------------------------------------
// PR Detection
// -----------------------------------------------------------------------------

/**
 * Detect personal records based on current set vs previous best.
 *
 * Rules:
 * - Weight PR: +50 FP if current weight > previous best weight
 * - Rep PR: +25 FP if same weight but more reps than before
 *
 * Note: Both can be earned simultaneously (new weight AND more reps at that weight)
 *
 * @param reps - Reps completed in current set
 * @param weight - Weight used in current set (undefined for bodyweight)
 * @param previousBest - Previous best performance
 * @returns Object with weightPR and repPR bonus amounts
 */
function detectPRs(
  reps: number,
  weight: number | undefined,
  previousBest: { weight: number; reps: number } | undefined
): { weightPR: number; repPR: number } {
  // No PR if no previous best recorded
  if (!previousBest) {
    return { weightPR: 0, repPR: 0 };
  }

  // No weight PR if current set has no weight (bodyweight)
  // Note: Bodyweight exercises track PRs differently (reps only)
  if (weight === undefined) {
    // For bodyweight, check if this is a rep PR at bodyweight (weight = 0)
    const isRepPR = reps > previousBest.reps;
    return { weightPR: 0, repPR: isRepPR ? REP_PR_BONUS : 0 };
  }

  // Weight PR: new weight exceeds previous best
  const isWeightPR = weight > previousBest.weight;

  // Rep PR: same weight, more reps
  // This applies when matching the best weight but beating the rep count
  const isRepPR = weight === previousBest.weight && reps > previousBest.reps;

  return {
    weightPR: isWeightPR ? WEIGHT_PR_BONUS : 0,
    repPR: isRepPR ? REP_PR_BONUS : 0,
  };
}

// -----------------------------------------------------------------------------
// Utility Functions
// -----------------------------------------------------------------------------

/**
 * Calculate FP for a set without PR bonuses (for preview/estimation).
 * Useful when showing expected FP before the set is completed.
 *
 * @param estimatedReps - Estimated reps to be completed
 * @param currentStreak - Current streak in days
 * @returns Estimated FP breakdown without PR bonuses
 */
export function estimateSetFP(estimatedReps: number, currentStreak: number): FPBreakdown {
  return calculateSetFP({
    reps: estimatedReps,
    currentStreak,
  });
}

/**
 * Check if a set would be a new PR given the parameters.
 * Useful for UI highlighting and celebrations.
 *
 * @param params - Set parameters
 * @returns Object indicating if this would be a weight PR and/or rep PR
 */
export function checkForPR(params: {
  reps: number;
  weight?: number;
  previousBest?: { weight: number; reps: number };
}): { isWeightPR: boolean; isRepPR: boolean } {
  const { reps, weight, previousBest } = params;

  if (!previousBest) {
    // First set is always a PR
    return {
      isWeightPR: weight !== undefined && weight > 0,
      isRepPR: true,
    };
  }

  if (weight === undefined) {
    return {
      isWeightPR: false,
      isRepPR: reps > previousBest.reps,
    };
  }

  return {
    isWeightPR: weight > previousBest.weight,
    isRepPR: weight === previousBest.weight && reps > previousBest.reps,
  };
}

/**
 * Format FP breakdown for display.
 * Returns a human-readable string of the FP calculation.
 *
 * @param breakdown - FP breakdown to format
 * @returns Formatted string (e.g., "100 + 5 + 50 = 155 FP (1.0x)")
 */
export function formatFPBreakdown(breakdown: FPBreakdown): string {
  const parts: string[] = [`${breakdown.base}`];

  if (breakdown.volumeBonus > 0) {
    parts.push(`${breakdown.volumeBonus}`);
  }

  if (breakdown.weightPR > 0) {
    parts.push(`${breakdown.weightPR} (weight PR)`);
  }

  if (breakdown.repPR > 0) {
    parts.push(`${breakdown.repPR} (rep PR)`);
  }

  const subtotal = breakdown.base + breakdown.volumeBonus + breakdown.weightPR + breakdown.repPR;
  const multiplierStr = breakdown.streakMultiplier.toFixed(1);

  return `${parts.join(' + ')} = ${subtotal} x ${multiplierStr} = ${breakdown.total} FP`;
}
