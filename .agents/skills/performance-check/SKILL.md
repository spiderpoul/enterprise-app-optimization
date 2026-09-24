---
name: performance-check
description: Select and run focused validation after frontend changes that may affect startup, bundle/loading, React rendering, DOM memory lifecycle, or the microfrontend runtime.
---

# Performance check

Use this procedure after a potentially performance-sensitive frontend change. Read `docs/performance.md` for project invariants; do not duplicate or redefine them here.

## Classify the change

Classify by effect, allowing more than one category:

- **startup** — initialization order, blocking work, bootstrap, permissions, or usable-UI timing;
- **bundle** — routes, imports, dependencies, assets, or loading boundaries;
- **rendering** — component identity, derived computation, large UI, frequent updates, or interaction latency;
- **memory** — DOM references, observers, listeners, timers, subscriptions, pagination, or navigation cleanup;
- **microfrontend** — manifest, discovery, runtime loading, shared dependencies, common webpack configuration, or deployment boundary.

Do not classify solely by filename. State briefly which observable behavior could regress.

## Select focused checks

Run the least expensive set that covers the classified risk:

| Classification | Required checks |
| --- | --- |
| startup | Relevant build plus a focused usable-UI trace or timing; document the measurement because no deterministic `check:startup` exists yet |
| bundle | `npm run check:bundle` |
| rendering | `npm run lint`, relevant build, and a focused React Profiler/browser trace of the affected interaction |
| memory | Start the production-like app, set `MEMLAB_APP_BASE_URL` when needed, then run `npm run check:memory -- tests/memlab/<affected-route>.scenario.js` |
| microfrontend | `npm run check:architecture` and `npm run check:bundle` |

Combine overlapping checks once. A route change requires the bundle gate; an observer change requires MemLab; a microfrontend runtime change requires architecture and bundle gates. Do not run every expensive check when the risk is narrow, unless the active specification requires the full set.

Always name the route-specific memory scenario in the command and report; never substitute a scenario for an unrelated route. If a focused scenario cannot exercise the changed behavior, adapt the reusable helper or record that gap as uncertainty. Do not treat a successful build as evidence that performance did not regress. Do not weaken a baseline or threshold merely to make a failure pass; first determine whether the change is intentional and obtain review for a baseline update.

## Report

Return these four sections:

1. **Checks executed** — exact commands and scenarios.
2. **Metrics/results** — baseline deltas, traces, retained-node findings, and pass/fail outcomes.
3. **Failures** — actionable failure text and what remains unfixed; write `None` only when every selected check passed.
4. **Remaining uncertainty** — unmeasured behavior, environment limitations, skipped checks, and why they were not relevant or could not run.
