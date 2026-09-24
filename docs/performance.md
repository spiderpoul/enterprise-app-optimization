# Frontend performance contract

Performance is part of the definition of done. A successful build proves compilation, not the absence of a runtime, loading, rendering, or memory regression.

## Startup

Dependencies between initialization operations must be explicit. Independent blocking operations should not be serialized unnecessarily, and non-blocking initialization must not delay usable UI. The required outcome is a correct dependency graph—not a particular Promise combinator.

Validation: inspect the initialization dependency plan and measure the usable-UI milestone when startup behavior changes. `check:startup` is intentionally absent until that measurement can be deterministic.

## Bundle and loading

Product routes are loading boundaries. Feature implementation must stay out of the initial shell bundle, expected lazy chunks must be emitted, and initial assets must remain within the reviewed baseline tolerance. Shared runtime dependencies must not be duplicated in microfrontend output.

Validation: `npm run check:bundle`. Use `npm run analyze` for investigation.

## React rendering

Component identity must remain stable unless remounting is intentional. Expensive synchronous work must not execute repeatedly because of unrelated renders. Measure the affected interaction and computation; memoization and debouncing are possible implementations, not requirements.

Validation: lint/build plus a focused React Profiler or browser performance trace for changes that affect render behavior.

## Memory and DOM lifecycle

Detached DOM nodes must not remain retained by application-owned long-lived structures after navigation. Resources and observers must be released when component ownership ends.

Validation: start the production-like application at `MEMLAB_APP_BASE_URL`, then pass the scenario for the affected route explicitly, for example `npm run check:memory -- tests/memlab/device-security.scenario.js`. The reusable scenario must navigate through the affected interaction, confirm pagination actually changed, and navigate away so MemLab can compare snapshots. A scenario for another route is not evidence for the changed route.

## Evidence

- React rendering: PR #24 → #54.
- Memory: PR #28 → #36/#38 → #55 (problem → reproducible scenario → fix).
- Initialization: PR #49 and #64.
- Bundle/loading: PR #52 and #53, plus webpack bundle analyzer and Statoscope reports already configured in the clients.
