# Mobile Specialist — Memory Cache

> Quick reference for React Native + Expo development. Read this first.

---

## Tech Stack (Immutable)

| Layer | Technology | Version/Notes |
|-------|-----------|---------------|
| Framework | React Native + Expo (Managed) | Expo SDK 50+ |
| Language | TypeScript | Strict mode enabled |
| JS Engine | Hermes | Default in Expo, required |
| Animations | Reanimated v3 | UI thread, 60fps |
| SVG | React Native SVG | Pet rendering |
| State | Zustand | Lightweight, no boilerplate |
| Fast Storage | MMKV | Pet stats, FP, UI state |
| Slow Storage | AsyncStorage | Workout history, achievements |

---

## Critical Constraints

### The 3-Second Rule (Non-Negotiable)
- Set logging: tap target → number input → log = **≤3 seconds**
- No loading spinners during active workout
- Animations are decorative, never blocking
- One-handed, sweaty-finger operation assumed

### Performance Targets

| Metric | Target |
|--------|--------|
| App cold start | <2 seconds |
| Set log interaction | <300ms response |
| Pet idle animation | 60fps maintained |
| List scroll (workout history) | 60fps, no jank |
| Navigation transition | <400ms |

---

## File Structure Convention

```
src/
├── components/
│   ├── workout/      # Exercise cards, set logging, rest timer
│   ├── pet/          # Pet display, feeding UI, stat allocation
│   ├── feedback/     # Celebrations, FP popups, achievements
│   └── progress/     # XP bars, streak counters, floor indicators
├── navigation/       # Expo Router or React Navigation
├── stores/           # Zustand stores
├── engine/           # Game logic (not your domain)
├── renderer/         # Pet SVG rendering pipeline
└── theme/            # Colors, spacing, typography
```

---

## Pet Rendering Pipeline (Highest Risk)

### Evolution Stages

| Stage | Name | Shapes | Complexity |
|-------|------|--------|------------|
| 1 | Shard | 3–4 polygons | Simple |
| 2 | Form | 6–8 shapes + gradients | Medium |
| 3 | Prime | Multi-shape + inner detail | High |
| 4 | Apex | Fractal recursion | Very High |

### Stat → Visual Mapping

| Stat | Visual Effect |
|------|--------------|
| Power | Spikier, larger core |
| Guard | Thicker, layered |
| Speed | Elongated, motion lines |
| Vigor | Symmetrical, stable base |
| Focus | Sharp points, eye detail |
| Spirit | Glow intensity, particles |

### Animation Requirements

| Animation | Duration | Tech |
|-----------|----------|------|
| Pet idle breathing | 2–3s loop | Reanimated |
| Stat change morph | 400–600ms | SVG + Reanimated |
| Evolution morph | 3–5s | Rive (Phase 3+) |
| Battle hit | 200–300ms | Reanimated |

---

## Animation Timing Reference

| Context | Duration | Easing |
|---------|----------|--------|
| Set logged (FP tick) | 200–300ms | Spring (overshoot) |
| Exercise transition | 300–400ms | Ease-in-out |
| PR callout | 500ms flash | Sharp ease-out |
| Radar chart fill | 800ms | Spring |
| Achievement stamp | 400ms + 200ms | Ease-out + bounce |

---

## Haptic Patterns

| Event | Type | Intensity |
|-------|------|-----------|
| Log Set | Impact (medium) | Standard |
| PR achieved | Notification (success) | Strong |
| Evolution | Custom sequence | Heavy |
| Rest timer zero | Impact (light) | Gentle |
| Battle hit | Impact (medium) | Varies |
| Achievement | Notification (success) | Standard |

```typescript
// Expo Haptics usage
import * as Haptics from 'expo-haptics';

Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

---

## Color System

| Semantic | Color | Hex Reference |
|----------|-------|---------------|
| FP/Reward | Gold/Amber | #F59E0B |
| Power | Warm red-orange | #EF4444 |
| Guard | Steel blue | #3B82F6 |
| Speed | Electric green | #22C55E |
| Vigor | Earth brown | #A16207 |
| Focus | Sharp violet | #8B5CF6 |
| Spirit | White-gold glow | #FEF08A |
| Rest/calm | Cool blue | #60A5FA |
| Ready | Soft gold | #FBBF24 |
| Ferro type | Chrome/metallic | #94A3B8 |
| Terra type | Forest/earth | #22C55E |
| Flux type | Neon/electric | #A855F7 |

---

## Common Patterns

### High-Performance List
```typescript
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={exercises}
  renderItem={({ item }) => <ExerciseCard exercise={item} />}
  estimatedItemSize={80}
/>
```

### Reanimated Spring Animation
```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';

const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }]
}));

// Trigger
scale.value = withSpring(1.1, { damping: 15, stiffness: 150 });
```

### MMKV Quick Read/Write
```typescript
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

// Write
storage.set('pet.power', 25);

// Read (synchronous, fast)
const power = storage.getNumber('pet.power') ?? 0;
```

---

## Collaboration Triggers

| When | Hand Off To |
|------|-------------|
| FP display needs calculation | game-logic-specialist |
| Connecting UI to data | state-architect |
| Supabase queries | database-specialist |
| Animation triggers from game events | ui-gamification-specialist |

---

## Don't Forget

1. **Hermes is required** — no fallback to JSC
2. **Test on real devices** — simulators lie about performance
3. **MMKV for hot data** — never AsyncStorage for animation-coupled state
4. **Pet renderer is highest risk** — prototype in isolation first
5. **No blocking animations** — user must be able to log while animation plays
