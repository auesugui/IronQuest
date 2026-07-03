// =============================================================================
// IronQuest Tab Bar Icons
// =============================================================================
// Real SVG icons for the four primary tabs, rendered via react-native-svg.
//
// Why SVG and not expo-symbols / react-native-vector-icons?
//  - expo-symbols' web build (SymbolView.web.js) is literally
//        `export function SymbolView(props) { return props.fallback; }`
//    i.e. on web it renders NOTHING unless the caller supplies a hand-built
//    fallback. The issue's verification model drives CDT against the web build,
//    so an icon that is invisible on web is unverifiable and ships broken for
//    web users. We'd have to build the SVG fallback anyway.
//  - react-native-vector-icons is not currently a dependency and would require
//    adding the package + configuring per-set web fonts.
//  - react-native-svg is ALREADY a dependency (used for the pet avatar + radar
//    chart) and renders identically on web, iOS, and Android. One code path,
//    full control over stroke weight / color states, no new deps.
//
// Visual-weight consistency: all four icons live on a uniform 24x24 grid with a
// 2px round-joined stroke and no fill (Feather-icon conventions). Three are
// stock Feather glyphs; "Tower" is a custom battlement silhouette (Feather has
// no tower/castle glyph — choice documented inline).

import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';

export type TabIconName = 'quest' | 'den' | 'tower' | 'profile';

interface TabIconProps {
  name: TabIconName;
  /**
   * Whether the owning tab is currently focused. We derive the icon color from
   * `focused` (rather than the `color` argument expo-router passes to
   * `tabBarIcon`) because on web expo-router forwards the active tint as
   * `color` to every tab regardless of focus, so the `color` prop cannot
   * produce an inactive state. Reading `focused` + theme tokens works
   * identically on web, iOS, and Android. Active = accent gold, inactive = muted.
   */
  focused: boolean;
  /** Pixel size of the icon square. Defaults to 24 (matches the old placeholder). */
  size?: number;
}

const STROKE_WIDTH = 2;

/**
 * Single tab icon. Color is chosen from theme tokens by `focused`: the accent
 * gold (`colors.reward.fp`) when active, muted (`colors.text.muted`) when not —
 * matching the tab bar's configured active/inactive tints.
 */
export function TabIcon({ name, focused, size = 24 }: TabIconProps) {
  const color = focused ? colors.reward.fp : colors.text.muted;
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'quest':
      // Feather "clipboard" — a board with a clip. Reads as a quest/task board.
      return (
        <Svg {...common}>
          <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <Path d="M9 4h6a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
          <Path d="M9 13h6M9 17h4" />
        </Svg>
      );
    case 'den':
      // Feather "heart" — the Den is where you care for your pet. There is no
      // literal "den" glyph; a heart signals pet-care/affection and matches the
      // warm tone ("glad you're here") better than a generic house outline.
      return (
        <Svg {...common}>
          <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </Svg>
      );
    case 'tower':
      // Custom battlement tower (no Feather equivalent). Merlons + crenels read
      // as a fortress tower — the battle tower you climb. A rounded arch door
      // makes it unambiguously a structure rather than an abstract shape.
      return (
        <Svg {...common}>
          <Path d="M5 8h3v2h2V8h4v2h2V8h3v13H5z" />
          <Path d="M10 21v-4a2 2 0 0 1 4 0v4" />
        </Svg>
      );
    case 'profile':
      // Feather "user" — standard person silhouette for the player profile.
      return (
        <Svg {...common}>
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <Circle cx={12} cy={7} r={4} />
        </Svg>
      );
    default:
      return null;
  }
}
