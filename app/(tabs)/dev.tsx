// =============================================================================
// IronQuest Dev Panel Route — __DEV__ only, hidden tab (href: null)
// =============================================================================
// Reached via the Profile screen's dev row (router.push('/(tabs)/dev')).
// Defense in depth: the Profile row is __DEV__-gated AND this screen renders
// null outside __DEV__, so even a stale deep link shows nothing in production.

import { DevPanel } from '@/components/dev/DevPanel';

export default function DevScreen() {
  if (!__DEV__) return null;
  return <DevPanel />;
}
