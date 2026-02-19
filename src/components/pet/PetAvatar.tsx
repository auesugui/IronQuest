// =============================================================================
// IronQuest Pet Avatar Component
// =============================================================================
// Main pet rendering component using react-native-svg
// Displays stat-driven geometric pet with idle animations

import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { G, Defs, Filter, FeGaussianBlur, Path } from 'react-native-svg';
import { EVOLUTION_MULTIPLIERS, PetShapeGenerator } from './PetShapes';

// =============================================================================
// Type Definitions
// =============================================================================

export type PetType = 'ignis' | 'terra' | 'aqua' | 'ventus' | 'umbra';

export type EvolutionStage = 1 | 2 | 3 | 4;

export interface PetStats {
  power: number; // 0-50 - Push (Chest/Shoulders)
  guard: number; // 0-50 - Pull (Back/Traps)
  speed: number; // 0-50 - Legs (Quads/Hams)
  vigor: number; // 0-50 - Legs (Core/Calves)
  focus: number; // 0-50 - Arms (Biceps/Triceps)
  spirit: number; // 0-50 - Streak only
}

export interface PetAvatarProps {
  petType: PetType;
  stats: PetStats;
  evolutionStage: EvolutionStage;
  size: number; // width/height in pixels
  animated?: boolean; // Enable idle animation (default: true)
}

// =============================================================================
// Main PetAvatar Component
// =============================================================================

export function PetAvatar({
  petType,
  stats,
  evolutionStage,
  size,
  animated = true,
}: PetAvatarProps) {
  // Animation values for breathing effect
  const breatheScale = useSharedValue(1);
  const particlePhase = useSharedValue(0);

  // Calculate effective size based on evolution stage
  const effectiveSize = useMemo(() => {
    return size * EVOLUTION_MULTIPLIERS[evolutionStage];
  }, [size, evolutionStage]);

  // Generate shapes based on stats and type
  const shapes = useMemo(() => {
    return PetShapeGenerator.generateCore(effectiveSize, stats, petType, evolutionStage);
  }, [effectiveSize, stats, petType, evolutionStage]);

  const auraShapes = useMemo(() => {
    return PetShapeGenerator.generateAura(effectiveSize, stats.spirit, evolutionStage);
  }, [effectiveSize, stats.spirit, evolutionStage]);

  const particleShapes = useMemo(() => {
    return PetShapeGenerator.generateParticles(effectiveSize, stats.spirit);
  }, [effectiveSize, stats.spirit]);

  // Setup breathing animation
  useEffect(() => {
    if (!animated) return;

    // Breathing: subtle scale pulse (2-3 second loop as per specs)
    breatheScale.value = withRepeat(
      withSequence(
        withTiming(1.03, {
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(1.0, {
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
        })
      ),
      -1, // Infinite
      false // Don't reverse
    );

    // Particle phase rotation
    particlePhase.value = withRepeat(
      withTiming(1, {
        duration: 4000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    return () => {
      breatheScale.value = 1;
      particlePhase.value = 0;
    };
  }, [animated, breatheScale, particlePhase]);

  // Animated style for the pet container
  const animatedContainerStyle = useAnimatedStyle(() => {
    const scale = breatheScale.value;
    return {
      transform: [{ scale }],
    };
  });

  // Animated style for particles (rotation)
  const animatedParticleStyle = useAnimatedStyle(() => {
    const rotation = interpolate(particlePhase.value, [0, 1], [0, 360]);
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  // Simple hash function for generating stable keys from path strings
  const getPathKey = (prefix: string, path: string) => {
    let hash = 0;
    for (let i = 0; i < path.length; i++) {
      const char = path.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `${prefix}-${hash}`;
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: effectiveSize,
          height: effectiveSize,
        },
      ]}
    >
      <Animated.View style={[styles.petWrapper, animated ? animatedContainerStyle : null]}>
        <Svg
          width={effectiveSize}
          height={effectiveSize}
          viewBox={`0 0 ${effectiveSize} ${effectiveSize}`}
        >
          {/* SVG Filters for glow effects */}
          <Defs>
            <Filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <FeGaussianBlur stdDeviation="3" result="coloredBlur" />
            </Filter>
          </Defs>

          {/* Aura layer (behind pet) */}
          <G opacity={0.8}>
            {auraShapes.map((shape) => (
              <Path
                key={getPathKey('aura', shape.path)}
                d={shape.path}
                fill={shape.fill}
                opacity={shape.opacity}
              />
            ))}
          </G>

          {/* Core pet shapes */}
          <G>
            {shapes.map((shape) => (
              <Path
                key={getPathKey('shape', shape.path)}
                d={shape.path}
                fill={shape.fill}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
                opacity={shape.opacity}
              />
            ))}
          </G>
        </Svg>
      </Animated.View>

      {/* Particle layer (rotates separately) */}
      {particleShapes.length > 0 && (
        <Animated.View style={[styles.particleWrapper, animated ? animatedParticleStyle : null]}>
          <Svg
            width={effectiveSize}
            height={effectiveSize}
            viewBox={`0 0 ${effectiveSize} ${effectiveSize}`}
          >
            {particleShapes.map((shape) => (
              <Path
                key={getPathKey('particle', shape.path)}
                d={shape.path}
                fill={shape.fill}
                opacity={shape.opacity}
              />
            ))}
          </Svg>
        </Animated.View>
      )}
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  petWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  particleWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// =============================================================================
// Utility Exports
// =============================================================================

/**
 * Helper to create default stats object
 */
export function createDefaultStats(): PetStats {
  return {
    power: 0,
    guard: 0,
    speed: 0,
    vigor: 0,
    focus: 0,
    spirit: 0,
  };
}

/**
 * Helper to validate stats are within bounds
 */
export function validateStats(stats: Partial<PetStats>): PetStats {
  return {
    power: Math.min(50, Math.max(0, stats.power ?? 0)),
    guard: Math.min(50, Math.max(0, stats.guard ?? 0)),
    speed: Math.min(50, Math.max(0, stats.speed ?? 0)),
    vigor: Math.min(50, Math.max(0, stats.vigor ?? 0)),
    focus: Math.min(50, Math.max(0, stats.focus ?? 0)),
    spirit: Math.min(50, Math.max(0, stats.spirit ?? 0)),
  };
}

export default PetAvatar;
