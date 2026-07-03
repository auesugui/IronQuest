# scripts/dev/ — legacy manual dev harnesses

These are one-off manual debugging/visual scripts from early Phase 1 scaffolding
(June 2026). They were relocated here from the repo root in the issue #26 hygiene
pass so the root directory no longer misrepresents them as official tooling.

## Contents

| Script | What it does | Status |
|--------|--------------|--------|
| `debug-ui.js` | Launches Playwright against the local Expo web server, dumps visible text + a11y tree, saves a screenshot. | Legacy manual debug aid. Unreferenced by `package.json`. |
| `interactive-test.js` | Headed Playwright walk-through that probes the Den screen (FP balance, stat rows, FP breakdown). | Legacy manual debug aid. Unreferenced by `package.json`. Selectors target the original Den layout and may not match current UI. |
| `visual-test.js` | Starts (or attaches to) the Expo web server and captures screenshots of Home/Den/Forge. Reachable via `npm run test:visual`. | Legacy manual screenshot harness. |

## Automated coverage lives elsewhere

The real automated browser coverage is the Playwright spec suite in `e2e/`
(`workout-session`, `stat-persistence`, `fp-system`, `pet-care-workflow`), which
runs in CI. These `scripts/dev/` files are **manual** helpers, kept for ad-hoc
debugging — not part of CI and not a substitute for the `e2e/` specs.

## Running

```bash
# from repo root
npm run web            # start Expo web in one terminal
node scripts/dev/debug-ui.js
node scripts/dev/visual-test.js
```

> Note: `debug-ui.js` and `interactive-test.js` resolve screenshot paths from
> `__dirname`, so screenshots land in `scripts/dev/screenshots/` when run from
> the relocated path. `visual-test.js` resolves from `process.cwd()`.
