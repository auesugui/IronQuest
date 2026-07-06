// =============================================================================
// IronQuest Pet Sprite Renderer (ADR-0006 hybrid rendering)
// =============================================================================
// Base layer: AI-generated stage sprite (fixed art, transparent PNG).
// Overlay layers (procedural, stat-driven, real time):
//   - dominant-stat glow behind the sprite (stat color, intensity from value)
//   - Spirit aura + orbiting particles (reused from the procedural system —
//     Spirit stays streak-only and earns its own visual channel)
//   - breathing idle via Reanimated (motion is mandatory — brief §8)

import { useEffect, useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { colors } from '@/theme';
import type { PetAvatarProps, PetStats } from './PetAvatar';
import { EVOLUTION_MULTIPLIERS, PetShapeGenerator } from './PetShapes';
import { getSprite } from './sprites';

// Spirit is excluded: it has its own dedicated aura/particle channel.
const GLOW_STATS = ['power', 'guard', 'speed', 'vigor', 'focus'] as const;

function getDominantStat(stats: PetStats): { stat: (typeof GLOW_STATS)[number]; value: number } {
  let dominant: (typeof GLOW_STATS)[number] = 'power';
  let max = 0;
  for (const stat of GLOW_STATS) {
    if (stats[stat] > max) {
      max = stats[stat];
      dominant = stat;
    }
  }
  return { stat: dominant, value: max };
}

export function PetSprite({
  petType,
  stats,
  evolutionStage,
  size,
  animated = true,
}: PetAvatarProps) {
  const breatheScale = useSharedValue(1);
  const particlePhase = useSharedValue(0);

  const effectiveSize = useMemo(
    () => size * EVOLUTION_MULTIPLIERS[evolutionStage],
    [size, evolutionStage]
  );

  const sprite = getSprite(petType, evolutionStage);

  const dominant = useMemo(() => getDominantStat(stats), [stats]);
  // 0 at stat 0 (clean base, nothing to show yet) up to a clearly visible halo
  // at the 50 cap. Matches the stat color language used by radar + Den rows.
  const glowOpacity = dominant.value === 0 ? 0 : 0.12 + 0.28 * (dominant.value / 50);
  const glowColor = colors.stats[dominant.stat];

  const auraShapes = useMemo(
    () => PetShapeGenerator.generateAura(effectiveSize, stats.spirit, evolutionStage),
    [effectiveSize, stats.spirit, evolutionStage]
  );

  const particleShapes = useMemo(
    () => PetShapeGenerator.generateParticles(effectiveSize, stats.spirit),
    [effectiveSize, stats.spirit]
  );

  useEffect(() => {
    if (!animated) return;

    // Same breathing cadence as the procedural renderer so mixed screens
    // (e.g. onboarding cards showing all three types) stay in one rhythm.
    breatheScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0, { duration: 1500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    particlePhase.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );

    return () => {
      breatheScale.value = 1;
      particlePhase.value = 0;
    };
  }, [animated, breatheScale, particlePhase]);

  const animatedSpriteStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breatheScale.value }],
  }));

  const animatedParticleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(particlePhase.value, [0, 1], [0, 360])}deg` }],
  }));

  const getPathKey = (prefix: string, path: string) => {
    let hash = 0;
    for (let i = 0; i < path.length; i++) {
      hash = (hash << 5) - hash + path.charCodeAt(i);
      hash = hash & hash;
    }
    return `${prefix}-${hash}`;
  };

  return (
    <View style={[styles.container, { width: effectiveSize, height: effectiveSize }]}>
      {/* Dominant-stat glow + Spirit aura, behind the sprite */}
      <Svg
        width={effectiveSize}
        height={effectiveSize}
        viewBox={`0 0 ${effectiveSize} ${effectiveSize}`}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <RadialGradient id="statGlow" cx="50%" cy="55%" r="50%">
            <Stop offset="0%" stopColor={glowColor} stopOpacity={glowOpacity} />
            <Stop offset="70%" stopColor={glowColor} stopOpacity={glowOpacity * 0.4} />
            <Stop offset="100%" stopColor={glowColor} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        {glowOpacity > 0 && (
          <Circle
            cx={effectiveSize / 2}
            cy={effectiveSize * 0.55}
            r={effectiveSize * 0.48}
            fill="url(#statGlow)"
          />
        )}
        {auraShapes.map((shape) => (
          <Path
            key={getPathKey('aura', shape.path)}
            d={shape.path}
            fill={shape.fill}
            opacity={shape.opacity}
          />
        ))}
      </Svg>

      {/* Base sprite with breathing idle */}
      <Animated.View style={[styles.spriteWrapper, animated ? animatedSpriteStyle : null]}>
        <Image
          source={sprite}
          style={{ width: effectiveSize, height: effectiveSize }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </Animated.View>

      {/* Spirit particles orbit above everything */}
      {particleShapes.length > 0 && (
        <Animated.View
          style={[StyleSheet.absoluteFill, animated ? animatedParticleStyle : null]}
          pointerEvents="none"
        >
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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  spriteWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PetSprite;
