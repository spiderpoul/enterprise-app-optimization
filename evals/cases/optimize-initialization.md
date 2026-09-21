# Optimize initialization

## Task

Reduce time to usable UI while preserving required initialization dependencies and failure behavior.

## Expected invariants

- Dependencies between operations are explicit.
- Independent blocking operations are not serialized unnecessarily.
- Non-blocking work does not delay usable UI.
- Failures remain observable and ownership/cleanup is defined.

## Machine checks

- `npm run lint`
- `npm run build`
- Focused startup trace or timing of the usable-UI milestone, with before/after evidence.

## Expected failure classes

- Blind parallelization of dependent work.
- Background work still awaited on the critical path.
- Changed error semantics or unhandled rejection.
- Build success reported as startup-performance evidence.
