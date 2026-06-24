import { colors } from '@/theme';
import { StyleSheet, View } from 'react-native';
import Svg, { Polygon, Line, Text, G, Defs, RadialGradient, Stop } from 'react-native-svg';

interface RadarChartProps {
  values: Record<string, number>; // 0-100 for each stat
  size?: number;
  showLabels?: boolean;
  animated?: boolean;
}

const STAT_CONFIG = [
  { key: 'power', label: 'PWR', color: colors.stats.power, angle: -90 },
  { key: 'speed', label: 'SPD', color: colors.stats.speed, angle: -30 },
  { key: 'focus', label: 'FOC', color: colors.stats.focus, angle: 30 },
  { key: 'spirit', label: 'SPT', color: colors.stats.spirit, angle: 90 },
  { key: 'guard', label: 'GRD', color: colors.stats.guard, angle: 150 },
  { key: 'vigor', label: 'VIG', color: colors.stats.vigor, angle: 210 },
];

export function RadarChart({ values, size = 200, showLabels = true }: RadarChartProps) {
  // Account for labels that extend outside the chart
  // Labels are at radius + 18 from center, so we need extra padding
  const labelPadding = showLabels ? 20 : 0;
  const svgSize = size + labelPadding * 2;
  const center = svgSize / 2;
  const radius = size / 2 - 30; // Internal padding for grid
  const levels = 5; // Number of grid circles

  // Calculate point on circle for given angle and distance
  const getPoint = (angleDeg: number, distance: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: center + distance * Math.cos(angleRad),
      y: center + distance * Math.sin(angleRad),
    };
  };

  // Get data points for the polygon
  const dataPoints = STAT_CONFIG.map((stat, index) => {
    const value = values[stat.key] ?? 0;
    const normalizedValue = Math.min(100, Math.max(0, value)) / 100;
    const point = getPoint(stat.angle, normalizedValue * radius);
    return { ...point, value, stat };
  });

  // Generate polygon path
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={[styles.container, { width: svgSize, height: svgSize }]}>
      <Svg width={svgSize} height={svgSize}>
        {/* Grid lines (concentric polygons) */}
        {Array.from({ length: levels }).map((_, levelIndex) => {
          const levelRadius = ((levelIndex + 1) / levels) * radius;
          const gridPoints = STAT_CONFIG.map((stat) => {
            const point = getPoint(stat.angle, levelRadius);
            return `${point.x},${point.y}`;
          }).join(' ');

          return (
            <Polygon
              // biome-ignore lint/suspicious/noArrayIndexKey: grid rings are positional, no natural id
              key={`grid-${levelIndex}`}
              points={gridPoints}
              fill="none"
              stroke={colors.ui.border}
              strokeWidth={1}
              opacity={0.3}
            />
          );
        })}

        {/* Axis lines */}
        {STAT_CONFIG.map((stat, index) => {
          const endPoint = getPoint(stat.angle, radius);
          return (
            <Line
              // biome-ignore lint/suspicious/noArrayIndexKey: axis lines are positional, no natural id
              key={`axis-${index}`}
              x1={center}
              y1={center}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke={colors.ui.border}
              strokeWidth={1}
              opacity={0.5}
            />
          );
        })}

        {/* Gradient definition */}
        <Defs>
          <RadialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.reward.fp} stopOpacity="0.7" />
            <Stop offset="100%" stopColor={colors.reward.fp} stopOpacity="0.2" />
          </RadialGradient>
        </Defs>

        {/* Data polygon */}
        <Polygon
          points={polygonPoints}
          fill="url(#radarGradient)"
          stroke={colors.reward.fp}
          strokeWidth={3}
        />

        {/* Labels */}
        {showLabels &&
          STAT_CONFIG.map((stat, index) => {
            const labelRadius = radius + 18;
            const point = getPoint(stat.angle, labelRadius);
            const value = values[stat.key] ?? 0;

            return (
              <G
                // biome-ignore lint/suspicious/noArrayIndexKey: stat labels are positional, no natural id
                key={`label-${index}`}
              >
                <Text
                  x={point.x}
                  y={point.y - 6}
                  textAnchor="middle"
                  fill={stat.color}
                  fontSize={10}
                  fontWeight="600"
                >
                  {stat.label}
                </Text>
                <Text
                  x={point.x}
                  y={point.y + 6}
                  textAnchor="middle"
                  fill={colors.text.secondary}
                  fontSize={9}
                >
                  {value}%
                </Text>
              </G>
            );
          })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
});
