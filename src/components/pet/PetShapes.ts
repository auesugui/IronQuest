// =============================================================================
// IronQuest Pet SVG Shape Generators
// =============================================================================
// Generates stat-driven SVG paths for pet rendering
// Stat mappings:
// - Power: Spikier, larger core
// - Guard: Thicker, layered armor plates
// - Speed: Elongated body, motion lines
// - Vigor: Symmetrical, stable stance
// - Focus: Sharp points, detailed eyes
// - Spirit: Glow effect, particles

import type { EvolutionStage, PetStats, PetType } from './PetAvatar';

// =============================================================================
// Type Definitions
// =============================================================================

export interface ShapeConfig {
  path: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

export interface PetShapeGenerator {
  generateCore: (
    size: number,
    stats: PetStats,
    petType: PetType,
    stage: EvolutionStage
  ) => ShapeConfig[];
  generateAura: (size: number, spirit: number, stage: EvolutionStage) => ShapeConfig[];
  generateParticles: (size: number, spirit: number) => ShapeConfig[];
}

// =============================================================================
// Constants
// =============================================================================

// Pet type base colors — 3-type taxonomy (issue #33).
// Aligned with theme `colors.types` and docs/04-pet-system/pet-types.md:
//   Ferro → chrome/metallic · Terra → forest/earth · Flux → neon/electric
export const PET_TYPE_COLORS: Record<
  PetType,
  { primary: string; secondary: string; glow: string }
> = {
  ferro: {
    primary: '#94A3B8', // Chrome/metallic (theme colors.types.ferro)
    secondary: '#64748B', // Darker steel
    glow: '#CBD5E1', // Light chrome glow
  },
  terra: {
    primary: '#22C55E', // Forest/earth (theme colors.types.terra)
    secondary: '#16A34A', // Darker green
    glow: '#86EFAC', // Light green glow
  },
  flux: {
    primary: '#A855F7', // Neon/electric (theme colors.types.flux)
    secondary: '#7E22CE', // Darker violet
    glow: '#D8B4FE', // Light neon glow
  },
};

// Evolution stage multipliers
export const EVOLUTION_MULTIPLIERS: Record<EvolutionStage, number> = {
  1: 1.0, // Base size
  2: 1.2, // +20% size
  3: 1.4, // +40% size
  4: 1.6, // +60% size
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Normalizes a stat value (0-50) to a 0-1 range
 */
function normalizeStat(stat: number): number {
  return Math.min(50, Math.max(0, stat)) / 50;
}

/**
 * Interpolates between two values based on a normalized factor
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Generates spike intensity based on power stat
 */
function getSpikeIntensity(power: number): number {
  return lerp(0.1, 0.5, normalizeStat(power));
}

/**
 * Generates armor thickness based on guard stat
 */
function getArmorThickness(guard: number): number {
  return lerp(2, 8, normalizeStat(guard));
}

/**
 * Generates elongation factor based on speed stat
 */
function getElongation(speed: number): number {
  return lerp(1.0, 1.4, normalizeStat(speed));
}

/**
 * Generates symmetry factor based on vigor stat
 */
function getSymmetry(vigor: number): number {
  // Higher vigor = more symmetrical (closer to 1.0 multiplier)
  return lerp(0.85, 1.0, normalizeStat(vigor));
}

/**
 * Generates point sharpness based on focus stat
 */
function getSharpness(focus: number): number {
  return lerp(0.15, 0.05, normalizeStat(focus));
}

// =============================================================================
// Shape Generators
// =============================================================================

/**
 * Generates the core body shape for the pet
 */
function generateCoreBody(
  size: number,
  stats: PetStats,
  petType: PetType,
  stage: EvolutionStage
): ShapeConfig[] {
  const colors = PET_TYPE_COLORS[petType];
  const center = size / 2;
  const baseRadius = (size / 2) * 0.4;

  // Apply evolution multiplier
  const evolutionMult = EVOLUTION_MULTIPLIERS[stage];
  const scaledRadius = baseRadius * evolutionMult * 0.7;

  // Stat-driven modifications
  const spikeIntensity = getSpikeIntensity(stats.power);
  const armorThickness = getArmorThickness(stats.guard);
  const elongation = getElongation(stats.speed);
  const symmetry = getSymmetry(stats.vigor);
  const sharpness = getSharpness(stats.focus);

  const shapes: ShapeConfig[] = [];

  // Number of spikes based on power and stage
  const numSpikes = Math.floor(lerp(5, 12, normalizeStat(stats.power))) + stage * 2;

  // Generate spiky body path
  const bodyPoints: string[] = [];
  for (let i = 0; i < numSpikes; i++) {
    const angle = (i / numSpikes) * Math.PI * 2 - Math.PI / 2;
    const nextAngle = ((i + 0.5) / numSpikes) * Math.PI * 2 - Math.PI / 2;

    // Outer point (spike)
    const spikeLength = scaledRadius * (1 + spikeIntensity * Math.sin(i * 1.5));
    const outerX = center + Math.cos(angle) * spikeLength * elongation;
    const outerY = center + Math.sin(angle) * spikeLength;

    // Inner point (valley between spikes)
    const innerRadius = scaledRadius * (0.7 - sharpness * 2);
    const innerX = center + Math.cos(nextAngle) * innerRadius * elongation * symmetry;
    const innerY = center + Math.sin(nextAngle) * innerRadius;

    if (i === 0) {
      bodyPoints.push(`M ${outerX} ${outerY}`);
    } else {
      bodyPoints.push(`L ${outerX} ${outerY}`);
    }
    bodyPoints.push(`L ${innerX} ${innerY}`);
  }
  bodyPoints.push('Z');

  // Main body shape
  shapes.push({
    path: bodyPoints.join(' '),
    fill: colors.primary,
    stroke: colors.secondary,
    strokeWidth: armorThickness / 2,
    opacity: 0.95,
  });

  // Add inner detail for higher stages
  if (stage >= 2) {
    const innerPoints: string[] = [];
    const innerNumSpikes = Math.max(4, numSpikes - 2);

    for (let i = 0; i < innerNumSpikes; i++) {
      const angle = (i / innerNumSpikes) * Math.PI * 2 - Math.PI / 2;
      const nextAngle = ((i + 0.5) / innerNumSpikes) * Math.PI * 2 - Math.PI / 2;

      const spikeLength = scaledRadius * 0.6 * (1 + spikeIntensity * 0.3);
      const outerX = center + Math.cos(angle) * spikeLength * elongation;
      const outerY = center + Math.sin(angle) * spikeLength;

      const innerRadius = scaledRadius * 0.4;
      const innerX = center + Math.cos(nextAngle) * innerRadius * elongation;
      const innerY = center + Math.sin(nextAngle) * innerRadius;

      if (i === 0) {
        innerPoints.push(`M ${outerX} ${outerY}`);
      } else {
        innerPoints.push(`L ${outerX} ${outerY}`);
      }
      innerPoints.push(`L ${innerX} ${innerY}`);
    }
    innerPoints.push('Z');

    shapes.push({
      path: innerPoints.join(' '),
      fill: colors.secondary,
      opacity: 0.7,
    });
  }

  // Add eye(s) based on focus stat
  const eyeSize = lerp(3, 8, normalizeStat(stats.focus));
  const eyeY = center - scaledRadius * 0.2;

  // Left eye
  shapes.push({
    path: `M ${center - scaledRadius * 0.25 - eyeSize} ${eyeY}
           Q ${center - scaledRadius * 0.25} ${eyeY - eyeSize} ${center - scaledRadius * 0.25 + eyeSize} ${eyeY}
           Q ${center - scaledRadius * 0.25} ${eyeY + eyeSize * 0.5} ${center - scaledRadius * 0.25 - eyeSize} ${eyeY} Z`,
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 1,
  });

  // Right eye
  shapes.push({
    path: `M ${center + scaledRadius * 0.25 - eyeSize} ${eyeY}
           Q ${center + scaledRadius * 0.25} ${eyeY - eyeSize} ${center + scaledRadius * 0.25 + eyeSize} ${eyeY}
           Q ${center + scaledRadius * 0.25} ${eyeY + eyeSize * 0.5} ${center + scaledRadius * 0.25 - eyeSize} ${eyeY} Z`,
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 1,
  });

  // Add armor plates for high guard
  if (stats.guard > 20) {
    const numPlates = Math.floor(normalizeStat(stats.guard) * 4) + 2;
    for (let i = 0; i < numPlates; i++) {
      const angle = (i / numPlates) * Math.PI * 2;
      const plateRadius = scaledRadius * 1.15;
      const plateSize = armorThickness * 2;

      const px = center + Math.cos(angle) * plateRadius * elongation;
      const py = center + Math.sin(angle) * plateRadius;

      shapes.push({
        path: `M ${px - plateSize} ${py - plateSize / 2}
               L ${px} ${py - plateSize}
               L ${px + plateSize} ${py - plateSize / 2}
               L ${px + plateSize} ${py + plateSize / 2}
               L ${px} ${py + plateSize}
               L ${px - plateSize} ${py + plateSize / 2} Z`,
        fill: colors.secondary,
        stroke: colors.primary,
        strokeWidth: 1,
        opacity: 0.8,
      });
    }
  }

  return shapes;
}

/**
 * Generates motion lines for high speed pets
 */
function generateMotionLines(size: number, stats: PetStats, petType: PetType): ShapeConfig[] {
  if (stats.speed < 15) return [];

  const colors = PET_TYPE_COLORS[petType];
  const center = size / 2;
  const baseRadius = (size / 2) * 0.4;
  const numLines = Math.floor(normalizeStat(stats.speed) * 5) + 2;

  const shapes: ShapeConfig[] = [];

  for (let i = 0; i < numLines; i++) {
    const yOffset = (i - numLines / 2) * 8;
    const startX = center + baseRadius * 0.8;
    const endX = center + baseRadius * 1.4 + i * 3;
    const y = center + yOffset;

    shapes.push({
      path: `M ${startX} ${y} Q ${(startX + endX) / 2} ${y - 3} ${endX} ${y}`,
      fill: 'none',
      stroke: colors.glow,
      strokeWidth: 2,
      opacity: 0.4 + normalizeStat(stats.speed) * 0.3,
    });
  }

  return shapes;
}

/**
 * Generates aura effect based on spirit stat and evolution stage
 */
function generateAura(size: number, spirit: number, stage: EvolutionStage): ShapeConfig[] {
  // Aura only appears at stage 3+
  if (stage < 3 || spirit < 10) return [];

  const center = size / 2;
  const baseRadius = (size / 2) * 0.5;
  const auraIntensity = normalizeStat(spirit);

  const shapes: ShapeConfig[] = [];

  // Outer glow circles
  const numLayers = stage === 4 ? 3 : 2;
  for (let i = 0; i < numLayers; i++) {
    const layerRadius = baseRadius * (1.3 + i * 0.2);
    const opacity = (0.15 - i * 0.04) * auraIntensity;

    shapes.push({
      path: `M ${center} ${center - layerRadius}
             A ${layerRadius} ${layerRadius} 0 1 1 ${center} ${center + layerRadius}
             A ${layerRadius} ${layerRadius} 0 1 1 ${center} ${center - layerRadius} Z`,
      fill: '#FEF08A', // Spirit color
      opacity,
    });
  }

  return shapes;
}

/**
 * Generates particle effects based on spirit stat
 */
function generateParticles(size: number, spirit: number): ShapeConfig[] {
  if (spirit < 15) return [];

  const center = size / 2;
  const baseRadius = (size / 2) * 0.5;
  const numParticles = Math.floor(normalizeStat(spirit) * 8) + 3;

  const shapes: ShapeConfig[] = [];

  for (let i = 0; i < numParticles; i++) {
    const angle = (i / numParticles) * Math.PI * 2;
    const distance = baseRadius * (1.2 + Math.random() * 0.3);
    const particleSize = 2 + Math.random() * 3;

    const px = center + Math.cos(angle) * distance;
    const py = center + Math.sin(angle) * distance;

    shapes.push({
      path: `M ${px - particleSize} ${py}
             A ${particleSize} ${particleSize} 0 1 1 ${px + particleSize} ${py}
             A ${particleSize} ${particleSize} 0 1 1 ${px - particleSize} ${py} Z`,
      fill: '#FEF08A',
      opacity: 0.5 + Math.random() * 0.3,
    });
  }

  return shapes;
}

// =============================================================================
// Main Shape Generator Export
// =============================================================================

export const PetShapeGenerator: PetShapeGenerator = {
  generateCore: (size, stats, petType, stage) => {
    const bodyShapes = generateCoreBody(size, stats, petType, stage);
    const motionLines = generateMotionLines(size, stats, petType);
    return [...bodyShapes, ...motionLines];
  },

  generateAura: (size, spirit, stage) => generateAura(size, spirit, stage),

  generateParticles: (size, spirit) => generateParticles(size, spirit),
};

export default PetShapeGenerator;
