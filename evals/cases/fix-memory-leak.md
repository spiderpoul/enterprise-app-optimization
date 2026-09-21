# Fix memory leak

## Task

Fix detached-DOM retention after navigating through a paginated product page and leaving it.

## Expected invariants

- Long-lived application state does not retain detached DOM nodes.
- Resources and observers are released when ownership ends.
- The reproduction remains as a reusable regression scenario.

## Machine checks

- `npm run check:memory -- tests/memlab/<affected-route>.scenario.js`
- `npm run lint`
- `npm run build`

## Expected failure classes

- Clearing visible UI without releasing application-owned references.
- Replacing a strong collection without addressing other resource cleanup.
- A scenario that never exercises pagination or navigation away.
- Deleting or weakening the reproduction instead of fixing retention.
