// =============================================================================
// IronQuest Splash/Index Screen — first-run gating
// =============================================================================
// Phase 2 (issue #33): route to the onboarding wizard when the pet has not been
// initialized yet, otherwise into the main tab navigator.
//
// The root layout (app/_layout.tsx) gates all rendering behind a hydration flag,
// so by the time this screen renders, the pet store has been hydrated from
// AsyncStorage and `selectIsPetInitialized` reflects persisted state. That also
// keeps static web rendering in sync — the redirect only fires post-hydration.

import { Redirect } from 'expo-router';

import { selectIsPetInitialized, usePetStore } from '@/stores';

export default function IndexScreen() {
  const isPetInitialized = usePetStore(selectIsPetInitialized);

  if (!isPetInitialized) {
    return <Redirect href="/onboarding/type" />;
  }

  return <Redirect href="/(tabs)" />;
}
