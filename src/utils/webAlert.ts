// =============================================================================
// IronQuest Web Alert — DOM renderer for the RN Alert.alert contract on web
// =============================================================================
// react-native-web's `Alert.alert` is a no-op (empty static method), so a
// confirmation dialog built on it is invisible during browser verification.
// The session-abandon guard (issue #20) is a UI-surfacing safety feature that
// MUST be verifiable in the browser, so this module renders an equivalent,
// theme-matched DOM dialog.
//
// Native never reaches this code path — `src/utils/alert.ts` gates on
// `Platform.OS === 'web'`. All DOM access (`document`, `window`) is kept
// inside function bodies so importing this module on native is safe (no
// top-level DOM evaluation).

import type { AlertButton, AlertButtonStyle, AlertConfig } from '@/workout/endSessionGuard';

// Theme tokens mirrored from src/theme/colors.ts so the web dialog matches
// the in-app modal vocabulary rather than looking like a foreign browser
// control.
const THEME = {
  overlayBg: 'rgba(15, 23, 42, 0.8)',
  cardBg: '#1E293B',
  border: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  tertiary: '#334155',
  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.18)',
  fp: '#F59E0B',
} as const;

const CONTAINER_ID = 'iq-web-alert';
const escapeActiveKey = '__iqWebAlertActive';

const applyButtonStyle = (el: HTMLButtonElement, style: AlertButtonStyle | undefined): void => {
  const base: Partial<CSSStyleDeclaration> = {
    flex: '1',
    padding: '14px 16px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '15px',
    fontWeight: '600',
  };
  Object.assign(el.style, base);

  switch (style) {
    case 'destructive':
      el.style.backgroundColor = THEME.dangerBg;
      el.style.color = THEME.danger;
      break;
    case 'cancel':
      el.style.backgroundColor = THEME.tertiary;
      el.style.color = THEME.textSecondary;
      break;
    default:
      el.style.backgroundColor = THEME.tertiary;
      el.style.color = THEME.textPrimary;
      break;
  }
};

const cleanup = (container: HTMLDivElement, onKey: ((e: KeyboardEvent) => void) | null): void => {
  if (onKey) {
    window.removeEventListener('keydown', onKey);
  }
  if (container.parentNode) {
    container.parentNode.removeChild(container);
  }
  delete (window as unknown as Record<string, unknown>)[escapeActiveKey];
};

/**
 * Render an Alert.alert-equivalent dialog into the DOM. Returns immediately;
 * button callbacks fire on user interaction. Calling while a dialog is already
 * open replaces the prior one (only one is expected at a time in this app).
 */
export const showWebAlert = (config: AlertConfig): void => {
  if (typeof document === 'undefined') return;

  const cancelable = config.options?.cancelable !== false;

  // Replace any existing instance — only one alert is shown at a time.
  const existing = document.getElementById(CONTAINER_ID);
  if (existing) {
    existing.remove();
  }

  const container = document.createElement('div');
  container.id = CONTAINER_ID;
  container.setAttribute('role', 'presentation');
  container.dataset.testid = 'iq-alert-overlay';
  Object.assign(container.style, {
    position: 'fixed',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.overlayBg,
    zIndex: '9999',
    padding: '24px',
  } as Partial<CSSStyleDeclaration>);

  const card = document.createElement('div');
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-modal', 'true');
  Object.assign(card.style, {
    width: '100%',
    maxWidth: '360px',
    backgroundColor: THEME.cardBg,
    border: `1px solid ${THEME.border}`,
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
  } as Partial<CSSStyleDeclaration>);

  const title = document.createElement('h2');
  title.textContent = config.title;
  Object.assign(title.style, {
    margin: '0 0 12px 0',
    fontSize: '19px',
    fontWeight: '700',
    color: THEME.textPrimary,
  } as Partial<CSSStyleDeclaration>);

  const message = document.createElement('p');
  message.textContent = config.message;
  Object.assign(message.style, {
    margin: '0 0 24px 0',
    fontSize: '15px',
    lineHeight: '1.5',
    color: THEME.textSecondary,
  } as Partial<CSSStyleDeclaration>);

  const buttonRow = document.createElement('div');
  Object.assign(buttonRow.style, {
    display: 'flex',
    gap: '10px',
  } as Partial<CSSStyleDeclaration>);

  card.append(title, message, buttonRow);
  container.append(card);
  document.body.append(container);
  document.body.style.overflow = 'hidden';

  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    document.body.style.overflow = '';
    cleanup(container, onKeydown);
  };

  // Wire each button. The first cancel-styled button is the safe dismiss for
  // overlay/escape handling; if none is cancel-styled, fall back to the last
  // button (mirrors RN's "last button = cancel" convention on Android).
  const cancelIndex = config.buttons.findIndex((b) => b.style === 'cancel');
  const safeCancelIndex = cancelIndex >= 0 ? cancelIndex : config.buttons.length - 1;

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && cancelable) {
      e.preventDefault();
      const cancelBtn = config.buttons[safeCancelIndex];
      cancelBtn?.onPress?.();
      dismiss();
    }
  };

  config.buttons.forEach((button: AlertButton, index: number) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.textContent = button.text;
    el.dataset.iqAlertAction = button.text;
    el.setAttribute('aria-label', button.text);
    applyButtonStyle(el, button.style);
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      button.onPress?.();
      dismiss();
    });
    buttonRow.append(el);

    // Default focus goes to the safe (cancel) button — "Cancel" is default.
    if (index === safeCancelIndex) {
      requestAnimationFrame(() => el.focus());
    }
  });

  if (cancelable) {
    container.addEventListener('click', (e) => {
      if (e.target === container) {
        const cancelBtn = config.buttons[safeCancelIndex];
        cancelBtn?.onPress?.();
        dismiss();
      }
    });
    window.addEventListener('keydown', onKeydown);
    (window as unknown as Record<string, unknown>)[escapeActiveKey] = true;
  }
};

/** Test-only: is a web alert currently rendered? */
export const isWebAlertVisible = (): boolean => {
  if (typeof document === 'undefined') return false;
  return document.getElementById(CONTAINER_ID) !== null;
};
